// components/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  retailPricePerYard: number; // in cents
  imageUrl: string | null;
}

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductCard({
  id,
  name,
  category,
  retailPricePerYard,
  imageUrl,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group block rounded-2xl overflow-hidden
        hover:-translate-y-1
        transition-[transform,box-shadow] duration-300 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-brand)",
        boxShadow: "var(--shadow-card)",
        outlineColor: "var(--brand-hex)",
      }}
      // hover shadow via CSS custom property isn't possible inline,
      // so we use a data attribute + Tailwind group trick below
    >
      {/* Image */}
      <div
        className="relative w-full aspect-[3/4] overflow-hidden"
        style={{ background: "var(--bg-subtle)" }}
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-[transform] duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-[opacity] duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-2 opacity-30">
              <div className="text-4xl">🧵</div>
              <p
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                No image
              </p>
            </div>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide backdrop-blur-sm"
            style={{
              background: "color-mix(in srgb, var(--bg-card) 88%, transparent)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-brand)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3
            className="font-semibold leading-snug line-clamp-2 transition-[color] duration-200"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
              fontSize: "1.05rem",
            }}
          >
            {name}
          </h3>
          <p
            className="text-sm font-medium"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {formatPrice(retailPricePerYard)}
            <span
              className="font-normal text-xs ml-1"
              style={{ color: "var(--text-muted)" }}
            >
              / yard
            </span>
          </p>
        </div>

        {/* CTA */}
        <div
          className="flex items-center gap-1.5 text-sm font-medium transition-[color] duration-200"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          View Details
          <ArrowUpRight
            size={14}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[transform] duration-200"
          />
        </div>
      </div>
    </Link>
  );
}
