// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentRef: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

// ── PATCH /api/orders/[id] — admin updates status / paymentRef ────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await db.orders.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // If cancelling — restore stock
    if (parsed.data.status === "CANCELLED" && order.status !== "CANCELLED") {
      await db.$transaction([
        db.orders.update({
          where: { id },
          data: { ...parsed.data, updatedAt: new Date() },
        }),
        db.products.update({
          where: { id: order.productId },
          data: {
            totalYardsInStock: { increment: order.yardsOrdered },
            updatedAt: new Date(),
          },
        }),
      ]);
    } else {
      await db.orders.update({
        where: { id },
        data: { ...parsed.data, updatedAt: new Date() },
      });
    }

    const updated = await db.orders.findUnique({
      where: { id },
      include: {
        products: { select: { name: true, category: true } },
        users: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("[ORDER_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── GET /api/orders/[id] — single order detail ───────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await db.orders.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            category: true,
            imageUrl: true,
            wholesalePricePerYard: true,
          },
        },
        users: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Wholesalers can only see their own orders
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[ORDER_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
