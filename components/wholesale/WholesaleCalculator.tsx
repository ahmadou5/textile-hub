// components/wholesale/WholesaleCalculator.tsx
"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

interface WholesaleCalculatorProps {
  wholesalePricePerYard: number; // cents
  retailPricePerYard: number; // cents
}

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function WholesaleCalculator({
  wholesalePricePerYard,
  retailPricePerYard,
}: WholesaleCalculatorProps) {
  const [yards, setYards] = useState<string>("50");

  const yardsNum = Math.max(1, parseInt(yards) || 1);
  const wholesaleTotal = wholesalePricePerYard * yardsNum;
  const retailTotal = retailPricePerYard * yardsNum;
  const savings = retailTotal - wholesaleTotal;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calculator size={13} className="text-emerald-400" />
        <span
          className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Bulk Calculator
        </span>
      </div>

      {/* Yards input + quick picks */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min="1"
              step="1"
              value={yards}
              onChange={(e) => setYards(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl text-white font-bold text-xl
                bg-white/[0.04] border border-white/[0.08]
                focus:outline-none focus:border-emerald-500/40
                transition-[border-color] duration-200
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              "
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              yards
            </span>
          </div>
        </div>

        {/* Quick picks */}
        <div className="flex gap-2 flex-wrap">
          {[25, 50, 100, 200, 500].map((qty) => (
            <button
              key={qty}
              onClick={() => setYards(String(qty))}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold
                border transition-[background,border-color,color] duration-150
                focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-500
                ${
                  yardsNum === qty
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.03] border-white/[0.08] text-slate-500 hover:border-emerald-500/20 hover:text-emerald-400"
                }
              `}
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {qty}
            </button>
          ))}
        </div>
      </div>

      {/* Results panel */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          background: "rgba(16,185,129,0.04)",
          border: "1px solid rgba(16,185,129,0.12)",
        }}
      >
        {/* Wholesale total — hero */}
        <div className="flex items-baseline justify-between">
          <span
            className="text-xs text-slate-500 uppercase tracking-wider font-medium"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Your total ({yardsNum} yds)
          </span>
          <span
            className="text-2xl font-bold text-emerald-400"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            {formatPrice(wholesaleTotal)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* Comparison */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span
              className="text-slate-600"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Retail equivalent
            </span>
            <span
              className="text-slate-500 line-through"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {formatPrice(retailTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span
              className="text-emerald-500 font-semibold"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Your savings
            </span>
            <span
              className="text-emerald-400 font-bold"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {formatPrice(savings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
