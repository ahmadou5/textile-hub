// app/(admin)/admin/low-stock/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Package, ShieldAlert } from "lucide-react";
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
const MAX_DISPLAY = 100;

export default async function LowStockPage() {
  await requireRole("ADMIN");

  const lowStockProducts = await db.products.findMany({
    where: { totalYardsInStock: { lt: LOW } },
    orderBy: { totalYardsInStock: "asc" },
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

  const totalProducts = await db.products.count();
  const healthyCount = totalProducts - lowStockProducts.length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm group
          transition-[color] duration-150
          focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          color: "var(--text-muted)",
          outlineColor: "var(--brand-hex)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
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
              className="text-3xl font-bold tracking-tight"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.02em",
              }}
            >
              Low Stock Alerts
            </h1>
            {lowStockProducts.length > 0 && (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  color: "var(--status-cancelled)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                <AlertTriangle size={11} />
                {lowStockProducts.length} affected
              </span>
            )}
          </div>
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Products with fewer than 20 yards remaining
          </p>
        </div>
      </div>

      {/* Stock health overview bar */}
      <div
        className="p-5 rounded-2xl space-y-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-brand)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Inventory Health — {totalProducts} products total
          </span>
          <span
            className="text-xs"
            style={{
              color: "var(--text-faint)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {Math.round((healthyCount / totalProducts) * 100)}% healthy
          </span>
        </div>

        {/* Segmented bar */}
        <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
          {criticalCount > 0 && (
            <div
              className="h-full rounded-l-full"
              style={{
                width: `${(criticalCount / totalProducts) * 100}%`,
                background: "linear-gradient(90deg, #dc2626, #ef4444)",
                boxShadow: "0 0 8px rgba(220,38,38,0.4)",
                minWidth: "8px",
              }}
            />
          )}
          {lowCount > 0 && (
            <div
              className="h-full"
              style={{
                width: `${(lowCount / totalProducts) * 100}%`,
                background: "linear-gradient(90deg, #d97706, #f59e0b)",
                boxShadow: "0 0 6px rgba(217,119,6,0.3)",
                minWidth: "8px",
              }}
            />
          )}
          <div
            className="h-full flex-1 rounded-r-full"
            style={{
              background: `linear-gradient(90deg, var(--brand-hex), var(--brand-bright))`,
            }}
          />
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-5 text-xs flex-wrap"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <span
            className="flex items-center gap-1.5"
            style={{ color: "var(--status-cancelled)" }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: "var(--status-cancelled)" }}
            />
            Critical (&lt;10 yds) · {criticalCount}
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{ color: "var(--status-pending)" }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: "var(--status-pending)" }}
            />
            Low (10–19 yds) · {lowCount}
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{ color: "var(--status-confirmed)" }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: "var(--status-confirmed)" }}
            />
            Healthy (20+ yds) · {healthyCount}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {lowStockProducts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-brand)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "var(--brand-glow)",
              border: "1px solid var(--border-brand)",
            }}
          >
            <Package size={22} style={{ color: "var(--brand-hex)" }} />
          </div>
          <h3
            className="text-lg font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
            }}
          >
            All stock levels healthy
          </h3>
          <p
            className="text-sm mt-1 max-w-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Every product has 20 or more yards in stock. No action needed.
          </p>
        </div>
      ) : (
        /* ── Alert table ── */
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_120px_160px_120px_140px] gap-4 px-5 py-3"
            style={{
              background: "var(--bg-subtle)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {["Product", "Category", "Stock Level", "Value/yd", "Action"].map(
              (h) => (
                <span
                  key={h}
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {/* Rows */}
          <div>
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
                    className="grid grid-cols-[1fr_120px_160px_120px_140px] gap-4 px-5 py-4 items-center"
                    style={{
                      background: isCritical
                        ? "rgba(220,38,38,0.03)"
                        : "rgba(217,119,6,0.02)",
                      borderTop:
                        index === 0 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {/* Name */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        {isCritical && (
                          <ShieldAlert
                            size={13}
                            className="flex-shrink-0"
                            style={{ color: "var(--status-cancelled)" }}
                          />
                        )}
                        <Link
                          href="/admin/products"
                          className="text-sm font-semibold truncate transition-[color] duration-150
                            focus-visible:outline-none focus-visible:underline"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--brand-hex)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "var(--text-primary)")
                          }
                        >
                          {product.name}
                        </Link>
                      </div>
                      <p
                        className="text-[11px]"
                        style={{
                          color: "var(--text-faint)",
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
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium w-fit"
                      style={{
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {product.category}
                    </span>

                    {/* Stock level + bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{
                            color: isCritical
                              ? "var(--status-cancelled)"
                              : "var(--status-pending)",
                            fontFamily: "var(--font-syne, sans-serif)",
                          }}
                        >
                          {product.totalYardsInStock}
                        </span>
                        <span
                          className="text-xs"
                          style={{
                            color: "var(--text-faint)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          yards
                        </span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            background: isCritical
                              ? "rgba(220,38,38,0.08)"
                              : "rgba(217,119,6,0.08)",
                            color: isCritical
                              ? "var(--status-cancelled)"
                              : "var(--status-pending)",
                            border: isCritical
                              ? "1px solid rgba(220,38,38,0.2)"
                              : "1px solid rgba(217,119,6,0.2)",
                          }}
                        >
                          {isCritical ? "CRITICAL" : "LOW"}
                        </span>
                      </div>
                      {/* Mini bar */}
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--border)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${barPct}%`,
                            background: isCritical
                              ? "linear-gradient(90deg, #dc2626, #ef4444)"
                              : "linear-gradient(90deg, #d97706, #f59e0b)",
                            boxShadow: isCritical
                              ? "0 0 4px rgba(220,38,38,0.5)"
                              : "0 0 4px rgba(217,119,6,0.4)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Wholesale price */}
                    <span
                      className="text-sm font-medium tabular-nums"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
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

          {/* Table footer */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: "var(--bg-subtle)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <span
              className="text-xs"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {criticalCount > 0 && (
                <span
                  className="font-semibold"
                  style={{ color: "var(--status-cancelled)" }}
                >
                  {criticalCount} critical{" "}
                </span>
              )}
              {lowCount > 0 && (
                <span
                  className="font-semibold"
                  style={{ color: "var(--status-pending)" }}
                >
                  {lowCount} low
                </span>
              )}{" "}
              · {lowStockProducts.length} total requiring attention
            </span>
            <Link
              href="/admin/products"
              className="text-xs font-medium transition-[color] duration-150
                focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                color: "var(--brand-hex)",
                outlineColor: "var(--brand-hex)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              View all products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
