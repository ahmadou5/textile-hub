// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createOrderSchema = z.object({
  productId: z.string().min(1),
  yardsOrdered: z.number().int().min(1, "Minimum 1 yard"),
  paymentMethod: z.enum(["PAYSTACK", "BANK_TRANSFER", "CASH_ON_DELIVERY"]),
  notes: z.string().max(500).optional(),
});

// ── POST /api/orders — wholesaler creates an order ────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["WHOLESALER", "ADMIN"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { productId, yardsOrdered, paymentMethod, notes } = parsed.data;

    const product = await db.products.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.totalYardsInStock < yardsOrdered) {
      return NextResponse.json(
        { error: `Only ${product.totalYardsInStock} yards in stock` },
        { status: 400 },
      );
    }

    const totalAmountInCents = product.wholesalePricePerYard * yardsOrdered;
    const orderId = `TXH-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Create order + deduct stock atomically
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          id: orderId,
          yardsOrdered,
          totalAmountInCents,
          paymentMethod,
          notes: notes ?? null,
          status: "PENDING",
          userId: session.user.id,
          productId,
          updatedAt: new Date(),
        },
        include: {
          products: {
            select: { name: true, category: true, wholesalePricePerYard: true },
          },
        },
      });

      // Deduct stock
      await tx.products.update({
        where: { id: productId },
        data: {
          totalYardsInStock: { decrement: yardsOrdered },
          updatedAt: new Date(),
        },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[ORDER_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── GET /api/orders — wholesaler sees their own orders ────────────────────
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = 20;
    const offset = (page - 1) * limit;

    const where =
      session.user.role === "ADMIN"
        ? {} // admin sees all
        : { userId: session.user.id }; // wholesaler sees own only

    const [orders, total] = await Promise.all([
      db.orders.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          products: {
            select: { id: true, name: true, category: true, imageUrl: true },
          },
          users: { select: { id: true, name: true, email: true } },
        },
      }),
      db.orders.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ORDERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
