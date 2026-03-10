// app/(public)/products/page.tsx
import { Suspense } from "react";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue — TextileHub",
  description:
    "Browse our premium fabric collection sourced from across West Africa and beyond.",
};

async function ProductGrid() {
  const users = await db.users.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      email: true,
      role: true,
    },
  });
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
          className="text-2xl font-semibold text-[#1C1410]"
          style={{ fontFamily: "var(--font-cormorant, serif)" }}
        >
          Collection coming soon
        </h3>
        <p className="text-[#8B7355] text-sm max-w-sm">
          Our curated fabric collection is being prepared. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      <div className="flex">
        {users.length !== 0 &&
          users.map((user) => (
            <p className="ml-auto mr-auto" key={user.email}>
              {user.name}
            </p>
          ))}
      </div>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 max-w-2xl">
        <p
          className="text-xs font-medium tracking-[0.15em] uppercase text-[#C9913A]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Full Collection
        </p>
        <h1
          className="text-5xl sm:text-6xl font-light text-[#1C1410] leading-none"
          style={{
            fontFamily: "var(--font-cormorant, serif)",
            letterSpacing: "-0.02em",
          }}
        >
          Browse all
          <br />
          <em className="font-semibold not-italic text-[#C9913A]">fabrics.</em>
        </h1>
        <p
          className="text-[#8B7355] text-base max-w-md"
          style={{ lineHeight: "1.7" }}
        >
          Retail pricing shown — wholesalers{" "}
          <a
            href="/login"
            className="text-[#C9913A] hover:text-[#1C1410] underline underline-offset-2 transition-[color] duration-150"
          >
            sign in
          </a>{" "}
          for exclusive bulk rates.
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
