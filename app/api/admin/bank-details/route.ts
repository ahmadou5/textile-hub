// app/api/admin/bank-details/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const BANK_DETAILS_ID = "singleton"; // one row in the table

const schema = z.object({
  bankName: z.string().min(1, "Bank name required"),
  accountNumber: z
    .string()
    .min(10, "Account number must be at least 10 digits")
    .max(10),
  accountName: z.string().min(2, "Account name required"),
});

// ── GET — public read (shown on checkout bank transfer card) ──────────────
export async function GET() {
  try {
    const details = await db.admin_bank_details.findUnique({
      where: { id: BANK_DETAILS_ID },
    });
    return NextResponse.json({ details });
  } catch (error) {
    console.error("[BANK_DETAILS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── PUT — admin only: upsert bank details ─────────────────────────────────
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const details = await db.admin_bank_details.upsert({
      where: { id: BANK_DETAILS_ID },
      create: { id: BANK_DETAILS_ID, ...parsed.data },
      update: { ...parsed.data },
    });

    return NextResponse.json({ details });
  } catch (error) {
    console.error("[BANK_DETAILS_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
