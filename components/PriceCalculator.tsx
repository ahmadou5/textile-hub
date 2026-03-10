// components/PriceCalculator.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Calculator } from "lucide-react";

interface PriceCalculatorProps {
  productId: string;
  productName: string;
  retailPricePerYard: number; // cents
}

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PriceCalculator({
  productId,
  productName,
  retailPricePerYard,
}: PriceCalculatorProps) {
  const [yards, setYards] = useState<string>("1");

  const yardsNum = Math.max(1, parseInt(yards) || 1);
  const totalCents = retailPricePerYard * yardsNum;
  const pricePerYard = retailPricePerYard / 100;

  function handleAddToCart() {
    toast.success("Added to cart!", {
      description: `${yardsNum} yard${yardsNum > 1 ? "s" : ""} of ${productName}`,
      duration: 3000,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator size={14} className="text-[#C9913A]" />
        <h2
          className="text-xs font-semibold tracking-[0.12em] uppercase text-[#8B7355]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Price Calculator
        </h2>
      </div>

      {/* Yards input */}
      <div className="space-y-2">
        <label
          htmlFor={`yards-${productId}`}
          className="block text-sm font-medium text-[#4A3728]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Enter Yards Needed
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[140px]">
            <input
              id={`yards-${productId}`}
              type="number"
              min="1"
              step="1"
              value={yards}
              onChange={(e) => setYards(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl text-[#1C1410] font-semibold text-lg
                bg-white border border-[#DDD6C8]
                focus:outline-none focus:border-[#C9913A] focus:ring-2 focus:ring-[#C9913A]/15
                transition-[border-color,box-shadow] duration-200
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              "
              style={{ fontFamily: "var(--font-cormorant, serif)" }}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B7355]"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              yds
            </span>
          </div>

          {/* Quick yard buttons */}
          <div className="flex gap-1.5">
            {[5, 10, 20].map((qty) => (
              <button
                key={qty}
                onClick={() => setYards(String(qty))}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium
                  border transition-[background,border-color,color] duration-150
                  focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C9913A]
                  ${
                    yardsNum === qty
                      ? "bg-[#C9913A] border-[#C9913A] text-white"
                      : "bg-white border-[#DDD6C8] text-[#8B7355] hover:border-[#C9913A] hover:text-[#C9913A]"
                  }
                `}
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {qty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live total */}
      <div
        className="rounded-2xl p-4 space-y-1"
        style={{
          background:
            "radial-gradient(ellipse at 0% 100%, rgba(201,145,58,0.08) 0%, transparent 70%), #F5F0E8",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs text-[#8B7355] uppercase tracking-wider font-medium"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {yardsNum} yd{yardsNum !== 1 ? "s" : ""} ×{" "}
            {formatPrice(retailPricePerYard)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span
            className="text-sm font-medium text-[#8B7355]"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Estimated Total
          </span>
          <span
            className="text-3xl font-semibold text-[#1C1410]"
            style={{
              fontFamily: "var(--font-cormorant, serif)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatPrice(totalCents)}
          </span>
        </div>
        <p
          className="text-[10px] text-[#8B7355]/70 pt-1"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Final price confirmed at checkout · Wholesale rates available on
          request
        </p>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        className="
          w-full flex items-center justify-center gap-2.5
          py-3.5 px-6 rounded-2xl
          bg-[#1C1410] text-[#FAF7F2] font-semibold text-sm
          shadow-[0_2px_8px_rgba(28,20,16,0.2),0_1px_2px_rgba(28,20,16,0.1)]
          hover:bg-[#C9913A] hover:-translate-y-0.5
          hover:shadow-[0_4px_16px_rgba(201,145,58,0.3),0_1px_4px_rgba(28,20,16,0.1)]
          active:translate-y-0 active:brightness-95
          transition-[background,transform,box-shadow] duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]
        "
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        <ShoppingBag size={16} />
        Add {yardsNum} yd{yardsNum !== 1 ? "s" : ""} to Cart
      </button>
    </div>
  );
}
