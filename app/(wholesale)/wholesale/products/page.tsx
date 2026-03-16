// app/(wholesale)/wholesale/products/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import ProductsGrid from "@/components/wholesale/ProductGrid";

export const metadata: Metadata = {
  title: "Products — TextileHub Wholesale",
};

export default async function WholesaleProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; sort?: string };
}) {
  noStore();
  await requireRole(["WHOLESALER", "ADMIN"] as never);

  const { category, search, sort } = searchParams;

  const products = await db.products.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      category: true,
      imageUrl: true,
      retailPricePerYard: true,
      wholesalePricePerYard: true,
      totalYardsInStock: true,
      createdAt: true,
      description: true,
    },
    orderBy:
      sort === "price_asc"
        ? { wholesalePricePerYard: "asc" }
        : sort === "price_desc"
          ? { wholesalePricePerYard: "desc" }
          : sort === "stock"
            ? { totalYardsInStock: "desc" }
            : { createdAt: "desc" },
  });

  // Get unique categories for filter
  const allCategories = await db.products.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const categories = allCategories.map((p) => p.category);

  return (
    <div className="p-6 lg:p-8 lg:max-w-7xl w-[90%] mx-auto space-y-8">
      {/* Grain overlay */}
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: "fixed",
          inset: 0,
          filter: "url(#grain)",
          opacity: 0.025,
          pointerEvents: "none",
          zIndex: 999,
        }}
      />

      {/* Header */}
      <div className="space-y-1">
        <p
          className="text-xs font-semibold tracking-[0.15em] uppercase text-emerald-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Catalogue
        </p>
        <h1
          className="text-4xl font-bold text-white"
          style={{
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.03em",
          }}
        >
          All Products
        </h1>
        <p
          className="text-slate-500 text-sm"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {products.length} fabric{products.length !== 1 ? "s" : ""} available
          at wholesale pricing
        </p>
      </div>

      {/* Client-side grid with filters */}
      <ProductsGrid
        products={products}
        categories={categories}
        initialCategory={category}
        initialSearch={search}
        initialSort={sort}
      />
    </div>
  );
}
