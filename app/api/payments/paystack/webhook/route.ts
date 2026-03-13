// app/api/payments/paystack/webhook/route.ts
// Add PAYSTACK_SECRET_KEY to your .env
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";
    const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

    // ── Verify Paystack signature ─────────────────────────────────────────
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

    if (hash !== signature) {
      console.warn("[PAYSTACK_WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const ref = event.data.reference as string; // this is our orderId
      const paystackRef = event.data.id as string;

      // orderId is stored as the Paystack reference
      const order = await db.orders.findUnique({ where: { id: ref } });
      if (order && order.status === "PENDING") {
        await db.orders.update({
          where: { id: ref },
          data: {
            status: "CONFIRMED",
            paymentRef: String(paystackRef),
            updatedAt: new Date(),
          },
        });
        console.log(`[PAYSTACK_WEBHOOK] Order ${ref} confirmed`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PAYSTACK_WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
