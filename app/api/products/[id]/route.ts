// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().min(1).optional(),
    imageUrl: z.string().url().nullable().optional(),
    retailPricePerYard: z.number().positive().optional(), // in naira/dollars — multiply ×100 here
    wholesalePricePerYard: z.number().positive().optional(),
    totalYardsInStock: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.retailPricePerYard && data.wholesalePricePerYard) {
        return data.wholesalePricePerYard < data.retailPricePerYard;
      }
      return true;
    },
    { message: "Wholesale price must be less than retail price" },
  );

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const product = await db.products.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const updated = await db.products.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.retailPricePerYard !== undefined && {
          retailPricePerYard: Math.round(data.retailPricePerYard * 100),
        }),
        ...(data.wholesalePricePerYard !== undefined && {
          wholesalePricePerYard: Math.round(data.wholesalePricePerYard * 100),
        }),
        ...(data.totalYardsInStock !== undefined && {
          totalYardsInStock: data.totalYardsInStock,
        }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("[PRODUCT_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.products.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("[PRODUCT_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
