// app/(admin)/admin/low-stock/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  Package,
  TrendingDown,
  ShieldAlert,
} from "lucide-react";
import type { Metadata } from "next";
import RestockButton from "@/components/admin/RestockButton";

export const metadata: Metadata = {
  title: "Low Stock Alerts — Admin | TextileHub",
};

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

const CRITICAL = 10;
const LOW = 20;
const MAX_DISPLAY = 100; // bar scale cap

export default async function LowStockPage() {
  await requireRole("ADMIN");

  const lowStockProducts = await db.products.findMany({
    where: { totalYardsInStock: { lt: LOW } },
    orderBy: { totalYardsInStock: "asc" }, // most critical first
    select: {
      id: true,
      name: true,
      category: true,
      totalYardsInStock: true,
      wholesalePricePerYard: true,
      retailPricePerYard: true,
      createdAt: true,
    },
  });

  const criticalCount = lowStockProducts.filter(
    (p: { totalYardsInStock: number }) => p.totalYardsInStock < CRITICAL,
  ).length;
  const lowCount = lowStockProducts.filter(
    (p: { totalYardsInStock: number }) =>
      p.totalYardsInStock >= CRITICAL && p.totalYardsInStock < LOW,
  ).length;

  // Overall stock health for context bar
  const totalProducts = await db.products.count();
  const healthyCount = totalProducts - lowStockProducts.length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500
          hover:text-slate-800 transition-[color] duration-150 group
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
        />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1
              className="text-3xl font-bold text-slate-800 tracking-tight"
              style={{
                fontFamily: "var(--font-playfair, serif)",
                letterSpacing: "-0.02em",
              }}
            >
              Low Stock Alerts
            </h1>
            {lowStockProducts.length > 0 && (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                <AlertTriangle size={11} />
                {lowStockProducts.length} affected
              </span>
            )}
          </div>
          <p
            className="text-slate-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Products with fewer than 20 yards remaining
          </p>
        </div>
      </div>

      {/* Stock health overview bar */}
      <div
        className="p-5 rounded-2xl space-y-4"
        style={{
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px_4px rgba(0,0,0,0.04), 0 8px_16px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Inventory Health — {totalProducts} products total
          </span>
          <span
            className="text-xs text-slate-400"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {Math.round((healthyCount / totalProducts) * 100)}% healthy
          </span>
        </div>

        {/* Segmented bar */}
        <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
          {/* Critical */}
          {criticalCount > 0 && (
            <div
              className="h-full rounded-l-full"
              style={{
                width: `${(criticalCount / totalProducts) * 100}%`,
                background: "linear-gradient(90deg, #dc2626, #ef4444)",
                boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                minWidth: criticalCount > 0 ? "8px" : "0",
              }}
            />
          )}
          {/* Low */}
          {lowCount > 0 && (
            <div
              className="h-full"
              style={{
                width: `${(lowCount / totalProducts) * 100}%`,
                background: "linear-gradient(90deg, #d97706, #f59e0b)",
                boxShadow: "0 0 6px rgba(245,158,11,0.3)",
                minWidth: lowCount > 0 ? "8px" : "0",
              }}
            />
          )}
          {/* Healthy */}
          <div
            className="h-full flex-1 rounded-r-full"
            style={{
              background: "linear-gradient(90deg, #10b981, #34d399)",
            }}
          />
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-5 text-xs"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <span className="flex items-center gap-1.5 text-red-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
            Critical (&lt;10 yds) · {criticalCount}
          </span>
          <span className="flex items-center gap-1.5 text-amber-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
            Low (10–19 yds) · {lowCount}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            Healthy (20+ yds) · {healthyCount}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {lowStockProducts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
          style={{
            background: "rgba(16,185,129,0.03)",
            border: "1px solid rgba(16,185,129,0.12)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <Package size={22} className="text-emerald-500" />
          </div>
          <h3
            className="text-lg font-bold text-slate-700"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            All stock levels healthy
          </h3>
          <p
            className="text-slate-500 text-sm mt-1 max-w-xs"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Every product has 20 or more yards in stock. No action needed.
          </p>
        </div>
      ) : (
        /* ── Alert table ── */
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow:
              "0 2px_4px rgba(0,0,0,0.04), 0 8px_24px rgba(0,0,0,0.04)",
          }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_120px_160px_120px_140px] gap-4 px-5 py-3"
            style={{
              background: "rgba(0,0,0,0.02)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {["Product", "Category", "Stock Level", "Value/yd", "Action"].map(
              (h) => (
                <span
                  key={h}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {lowStockProducts.map(
              (
                product: {
                  totalYardsInStock: number;
                  id: string;
                  name: string;
                  createdAt: Date;
                  category: string;
                  wholesalePricePerYard: number;
                },
                index: number,
              ) => {
                const isCritical = product.totalYardsInStock < CRITICAL;
                const barPct = Math.max(
                  (product.totalYardsInStock / MAX_DISPLAY) * 100,
                  2,
                );

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[1fr_120px_160px_120px_140px] gap-4 px-5 py-4 items-center bg-white"
                    style={{
                      background: isCritical
                        ? "rgba(239,68,68,0.02)"
                        : "rgba(245,158,11,0.015)",
                    }}
                  >
                    {/* Name */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        {isCritical && (
                          <ShieldAlert
                            size={13}
                            className="text-red-500 flex-shrink-0"
                          />
                        )}
                        <Link
                          href={`/admin/products`}
                          className="text-sm font-semibold text-slate-800 truncate hover:text-[#D4A853]
                          transition-[color] duration-150
                          focus-visible:outline-none focus-visible:underline"
                          style={{
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          {product.name}
                        </Link>
                      </div>
                      <p
                        className="text-[11px] text-slate-400 truncate"
                        style={{
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        Added{" "}
                        {product.createdAt.toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>

                    {/* Category */}
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium border-slate-200 text-slate-500 h-auto py-0.5 w-fit"
                    >
                      {product.category}
                    </Badge>

                    {/* Stock level + bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isCritical ? "text-red-500" : "text-amber-500"
                          }`}
                          style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                        >
                          {product.totalYardsInStock}
                        </span>
                        <span
                          className="text-xs text-slate-400"
                          style={{
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          yards
                        </span>
                        <Badge
                          className={`text-[9px] font-bold border h-auto py-0.5 px-1.5 ${
                            isCritical
                              ? "bg-red-50 text-red-500 border-red-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                          variant="outline"
                        >
                          {isCritical ? "CRITICAL" : "LOW"}
                        </Badge>
                      </div>
                      {/* Mini bar */}
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(0,0,0,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${barPct}%`,
                            background: isCritical
                              ? "linear-gradient(90deg, #dc2626, #ef4444)"
                              : "linear-gradient(90deg, #d97706, #f59e0b)",
                            boxShadow: isCritical
                              ? "0 0 4px rgba(239,68,68,0.5)"
                              : "0 0 4px rgba(245,158,11,0.4)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Wholesale price */}
                    <span
                      className="text-sm font-medium text-slate-700 tabular-nums"
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      {formatPrice(product.wholesalePricePerYard)}
                    </span>

                    {/* Restock CTA */}
                    <RestockButton productName={product.name} />
                  </div>
                );
              },
            )}
          </div>

          {/* Table footer summary */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: "rgba(0,0,0,0.015)",
              borderTop: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <span
              className="text-xs text-slate-400"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {criticalCount > 0 && (
                <span className="text-red-500 font-semibold">
                  {criticalCount} critical{" "}
                </span>
              )}
              {lowCount > 0 && (
                <span className="text-amber-500 font-semibold">
                  {lowCount} low
                </span>
              )}{" "}
              · {lowStockProducts.length} total requiring attention
            </span>
            <Link
              href="/admin/products"
              className="text-xs text-[#D4A853] hover:text-slate-800 transition-[color] duration-150 font-medium
                focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D4A853]"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              View all products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
