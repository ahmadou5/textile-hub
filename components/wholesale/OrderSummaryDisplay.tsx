"use client";

import { useWholesaleCalculator } from "@/context/calculatorContext";

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function OrderSummaryDisplay() {
  const { totals } = useWholesaleCalculator();

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10">
      <h2
        className="text-xl font-bold text-white mb-4"
        style={{ fontFamily: "var(--font-syne, sans-serif)" }}
      >
        Order Summary
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span
            className="text-slate-400 text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Wholesale Price
          </span>
          <span
            className="text-emerald-400 font-bold text-lg"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            {formatPrice(totals.wholesale)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className="text-slate-400 text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Retail Value
          </span>
          <span
            className="text-slate-500 line-through text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {formatPrice(totals.retail)}
          </span>
        </div>

        <div className="h-px bg-white/10 my-4" />

        <div className="flex justify-between items-center">
          <span
            className="text-white font-semibold"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Total Savings
          </span>
          <span
            className="text-emerald-400 font-bold text-2xl"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            {formatPrice(totals.savings)}
          </span>
        </div>
      </div>
    </div>
  );
}
