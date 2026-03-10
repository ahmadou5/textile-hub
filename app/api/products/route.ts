// app/api/products/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  retailPricePerYard: z.number().positive("Retail price must be positive"),
  wholesalePricePerYard: z
    .number()
    .positive("Wholesale price must be positive"),
  totalYardsInStock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
});

// GET — list all products
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST — create a product
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { retailPricePerYard, wholesalePricePerYard, ...rest } = parsed.data;

    // Validate wholesale < retail
    if (wholesalePricePerYard >= retailPricePerYard) {
      return NextResponse.json(
        { error: "Wholesale price must be less than retail price" },
        { status: 400 },
      );
    }

    // Convert to cents/kobo before saving
    const product = await db.product.create({
      data: {
        ...rest,
        description: rest.description ?? null,
        imageUrl: rest.imageUrl || null,
        retailPricePerYard: Math.round(retailPricePerYard * 100),
        wholesalePricePerYard: Math.round(wholesalePricePerYard * 100),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
