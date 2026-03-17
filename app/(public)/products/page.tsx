// app/(public)/products/page.tsx
import { Suspense } from "react";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue — TextileHub",
  description:
    "Browse our premium fabric collection sourced from across West Africa and beyond.",
};

async function ProductGrid() {
  const products = await db.products.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      retailPricePerYard: true,
      imageUrl: true,
    },
  });

  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="text-5xl">🧵</div>
        <h3
          className="text-2xl font-semibold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
          }}
        >
          Collection coming soon
        </h3>
        <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
          Our curated fabric collection is being prepared. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-3 max-w-2xl">
        <p
          className="text-xs font-medium tracking-[0.15em] uppercase"
          style={{
            color: "var(--brand-hex)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Full Collection
        </p>
        <h1
          className="text-5xl sm:text-6xl font-light leading-none"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.02em",
          }}
        >
          Browse all
          <br />
          <em
            className="font-semibold not-italic"
            style={{ color: "var(--brand-hex)" }}
          >
            fabrics.
          </em>
        </h1>
        <p
          className="text-base max-w-md"
          style={{
            color: "var(--text-muted)",
            lineHeight: "1.7",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Retail pricing shown — wholesalers{" "}
          <Link
            href="/login"
            className="underline underline-offset-2 transition-[color] duration-150"
            style={{ color: "var(--brand-hex)" }}
          >
            sign in
          </Link>{" "}
          for exclusive bulk rates.
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
