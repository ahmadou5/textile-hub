// app/api/inquiries/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";

const createInquirySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "WHOLESALER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only wholesalers can submit inquiries" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = createInquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { productId, subject, message } = parsed.data;

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create inquiry + first message in a transaction
    const inquiry = await db.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const newInquiry = await tx.inquiry.create({
          data: {
            subject,
            status: "OPEN",
            wholesalerId: session.user.id,
            productId,
          },
        });

        await tx.message.create({
          data: {
            body: message,
            inquiryId: newInquiry.id,
            senderId: session.user.id,
          },
        });

        return newInquiry;
      },
    );

    return NextResponse.json(
      { inquiryId: inquiry.id, message: "Inquiry submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[INQUIRY_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
