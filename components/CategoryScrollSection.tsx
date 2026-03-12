"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

function isNew(date: Date) {
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
}

type Product = {
  id: string;
  name: string;
  category: string;
  retailPricePerYard: number;
  imageUrl: string | null;
  totalYardsInStock: number;
  createdAt: Date;
};

interface CategoryScrollSectionProps {
  category: string;
  products: Product[];
  isLoggedIn: boolean;
}

export default function CategoryScrollSection({
  category,
  products,
  isLoggedIn,
}: CategoryScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  // Only show sections with 2+ products
  if (products.length < 2) return null;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-end justify-between">
        <div>
          <p
            className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#C9913A] mb-1"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Category
          </p>
          <h2
            className="text-2xl font-light text-[#1C1410]"
            style={{
              fontFamily: "var(--font-cormorant, serif)",
              letterSpacing: "-0.02em",
            }}
          >
            {category}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs text-[#8B7355] mr-2 hidden sm:block"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {products.length} fabric{products.length !== 1 ? "s" : ""}
          </span>
          {/* Scroll buttons */}
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-[#C9913A]/20 bg-white flex items-center justify-center
              text-[#8B7355] hover:text-[#C9913A] hover:border-[#C9913A]/40
              transition-[color,border-color] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-[#C9913A]/20 bg-white flex items-center justify-center
              text-[#8B7355] hover:text-[#C9913A] hover:border-[#C9913A]/40
              transition-[color,border-color] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Scroll track */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {products.map((product) => {
            const fresh = isNew(product.createdAt);
            const lowStock = product.totalYardsInStock < 50;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex-shrink-0 w-52 rounded-2xl border overflow-hidden
                  hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(201,145,58,0.12)]
                  transition-[transform,box-shadow,border-color] duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
                style={{
                  background: "#fff",
                  borderColor: "rgba(201,145,58,0.12)",
                }}
              >
                {/* Image */}
                <div className="relative w-full aspect-[3/4] bg-[#F9F5F0] overflow-hidden">
                  {product.imageUrl ? (
                    <>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-[transform] duration-500 group-hover:scale-105"
                        sizes="208px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl opacity-15">🧵</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {fresh && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider bg-[#C9913A] text-white uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        New
                      </span>
                    )}
                    {lowStock && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/90 text-white uppercase">
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-1.5">
                  <h3
                    className="text-sm font-semibold text-[#1C1410] leading-snug line-clamp-2
                      group-hover:text-[#C9913A] transition-[color] duration-200"
                    style={{ fontFamily: "var(--font-cormorant, serif)" }}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-base font-bold text-[#C9913A]"
                        style={{
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {formatPrice(product.retailPricePerYard)}
                      </p>
                      <p
                        className="text-[10px] text-[#8B7355]"
                        style={{
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        per yard
                      </p>
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="text-[#C9913A]/40 group-hover:text-[#C9913A] transition-[color] duration-200"
                    />
                  </div>

                  {/* Login nudge for guests */}
                  {!isLoggedIn && (
                    <p
                      className="text-[10px] text-[#8B7355]/60 border-t border-[#C9913A]/10 pt-1.5 mt-1"
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      Sign in for wholesale pricing
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
