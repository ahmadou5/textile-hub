// app/api/inquiries/[id]/message/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const messageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiry = await db.inquiries.findUnique({
      where: { id },
      select: {
        id: true,
        wholesalerId: true,
        status: true,
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Only the wholesaler who owns the inquiry can reply
    if (inquiry.wholesalerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (inquiry.status === "CLOSED") {
      return NextResponse.json(
        { error: "Cannot reply to a closed inquiry" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors.body?.[0] ?? "Invalid data",
        },
        { status: 400 },
      );
    }

    // Create message + reopen inquiry to OPEN so admin sees it as needing attention
    const [message] = await db.$transaction([
      db.messages.create({
        data: {
          id: crypto.randomUUID(),
          body: parsed.data.body,
          inquiryId: id,
          senderId: session.user.id,
          updatedAt: new Date(),
        },
        include: {
          users: { select: { id: true, name: true, role: true } },
        },
      }),
      // Set back to OPEN so admin knows wholesaler has replied
      db.inquiries.update({
        where: { id },
        data: { status: "OPEN", updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("[WHOLESALER_MESSAGE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
