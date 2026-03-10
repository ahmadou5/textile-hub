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
      className="group block rounded-2xl overflow-hidden bg-white border border-[#EDE8DF]
        shadow-[0_2px_8px_rgba(28,20,16,0.06),0_1px_2px_rgba(28,20,16,0.04)]
        hover:shadow-[0_8px_24px_rgba(28,20,16,0.12),0_2px_8px_rgba(28,20,16,0.08)]
        hover:-translate-y-1
        transition-[transform,box-shadow] duration-300 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F0EBE3]">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-[transform] duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-[opacity] duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-2 opacity-30">
              <div className="text-4xl">🧵</div>
              <p
                className="text-xs text-[#1C1410]"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                No image
              </p>
            </div>
          </div>
        )}

        {/* Category badge — floats on image */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide
              bg-white/90 backdrop-blur-sm text-[#1C1410] border border-white/60
              shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3
            className="font-semibold text-[#1C1410] leading-snug line-clamp-2 text-base group-hover:text-[#C9913A] transition-[color] duration-200"
            style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "1.05rem",
            }}
          >
            {name}
          </h3>
          <p
            className="text-sm font-medium text-[#C9913A]"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {formatPrice(retailPricePerYard)}
            <span className="text-[#8B7355] font-normal text-xs ml-1">
              / yard
            </span>
          </p>
        </div>

        {/* CTA */}
        <div
          className="flex items-center gap-1.5 text-sm font-medium text-[#1C1410]/60
            group-hover:text-[#C9913A] transition-[color] duration-200"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
