// app/api/inquiries/[id]/reply/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/browser";

const replySchema = z.object({
  message: z.string().min(1, "Reply cannot be empty").max(5000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: inquiryId } = await params;
    const body = await req.json();
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const inquiry = await db.inquiries.findUnique({
      where: { id: inquiryId },
      select: { id: true, status: true },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Create message + update status in one transaction
    const result = await db.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const message = await tx.messages.create({
          data: {
            id: crypto.randomUUID(), // same here if messages.id is required
            body: parsed.data.message,
            inquiryId,
            senderId: session.user.id,
          },
          include: {
            users: { select: { id: true, name: true, role: true } },
          },
        });

        // Only update status if not already CLOSED
        if (inquiry.status !== "CLOSED") {
          await tx.inquiries.update({
            where: { id: inquiryId },
            data: { status: "REPLIED" },
          });
        }

        return message;
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[INQUIRY_REPLY_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
