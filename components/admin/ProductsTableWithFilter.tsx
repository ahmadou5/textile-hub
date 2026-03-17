"use client";

// components/admin/ProductsTableWithFilter.tsx
import { useState } from "react";
import ProductActions from "@/components/admin/ProductActions";
import { AlertTriangle, Filter, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  retailPricePerYard: number;
  wholesalePricePerYard: number;
  totalYardsInStock: number;
  createdAt: Date;
}

interface ProductsTableWithFilterProps {
  products: Product[];
  lowStockCount: number;
}

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function ProductsTableWithFilter({
  products,
  lowStockCount,
}: ProductsTableWithFilterProps) {
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const displayed = showLowStockOnly
    ? products.filter((p) => p.totalYardsInStock < 20)
    : products;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <p
          className="text-sm"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {showLowStockOnly
            ? `${displayed.length} low stock products`
            : `${products.length} total products`}
        </p>

        <button
          onClick={() => setShowLowStockOnly((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
            transition-[background,border-color,color,transform] duration-150
            hover:-translate-y-0.5 active:translate-y-0
            focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            fontFamily: "var(--font-dm-sans, sans-serif)",
            border: showLowStockOnly
              ? "1px solid rgba(220,38,38,0.25)"
              : "1px solid var(--border)",
            background: showLowStockOnly
              ? "rgba(220,38,38,0.08)"
              : "var(--bg-card)",
            color: showLowStockOnly
              ? "var(--status-cancelled)"
              : "var(--text-muted)",
            outlineColor: showLowStockOnly
              ? "var(--status-cancelled)"
              : "var(--brand-hex)",
          }}
        >
          {showLowStockOnly ? (
            <>
              <X size={12} /> Clear filter
            </>
          ) : (
            <>
              <Filter size={12} />
              Low Stock Only
              {lowStockCount > 0 && (
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
                  style={{ background: "var(--status-cancelled)" }}
                >
                  {lowStockCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Empty filter state */}
      {displayed.length === 0 && showLowStockOnly && (
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-brand)",
          }}
        >
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            No low stock products — all healthy!
          </p>
        </div>
      )}

      {displayed.length > 0 && (
        <>
          {/* ── Desktop table (md+) ── */}
          <div
            className="hidden md:block rounded-2xl overflow-hidden"
            style={{
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-[1fr_130px_110px_110px_90px_90px] gap-4 px-5 py-3"
              style={{
                background: "var(--bg-subtle)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {[
                "Product",
                "Category",
                "Retail/yd",
                "Wholesale/yd",
                "Stock",
                "Actions",
              ].map((h) => (
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
              ))}
            </div>

            {/* Rows */}
            <div>
              {displayed.map((product, i) => {
                const isCritical = product.totalYardsInStock < 10;
                const isLow = !isCritical && product.totalYardsInStock < 20;

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[1fr_130px_110px_110px_90px_90px] gap-4 px-5 py-4 items-center"
                    style={{
                      background: isCritical
                        ? "rgba(220,38,38,0.03)"
                        : isLow
                          ? "rgba(217,119,6,0.03)"
                          : "var(--bg-card)",
                      borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {isCritical && (
                          <AlertTriangle
                            size={12}
                            className="inline-block mr-1.5 mb-0.5"
                            style={{ color: "var(--status-cancelled)" }}
                          />
                        )}
                        {product.name}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{
                          color: "var(--text-faint)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {new Date(product.createdAt).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>

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

                    <span
                      className="text-sm font-medium tabular-nums"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {formatPrice(product.retailPricePerYard)}
                    </span>

                    <span
                      className="text-sm tabular-nums"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {formatPrice(product.wholesalePricePerYard)}
                    </span>

                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{
                        color: isCritical
                          ? "var(--status-cancelled)"
                          : isLow
                            ? "var(--status-pending)"
                            : "var(--text-primary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {product.totalYardsInStock}
                      <span
                        className="text-xs font-normal ml-1"
                        style={{ color: "var(--text-faint)" }}
                      >
                        yds
                      </span>
                    </span>

                    <ProductActions productId={product.id} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-3">
            {displayed.map((product) => {
              const isCritical = product.totalYardsInStock < 10;
              const isLow = !isCritical && product.totalYardsInStock < 20;

              return (
                <div
                  key={product.id}
                  className="rounded-2xl p-4 space-y-3"
                  style={{
                    background: isCritical
                      ? "rgba(220,38,38,0.03)"
                      : isLow
                        ? "rgba(217,119,6,0.03)"
                        : "var(--bg-card)",
                    border: `1px solid ${isCritical ? "rgba(220,38,38,0.2)" : isLow ? "rgba(217,119,6,0.2)" : "var(--border-brand)"}`,
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  {/* Top: name + actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {isCritical && (
                          <AlertTriangle
                            size={12}
                            className="flex-shrink-0"
                            style={{ color: "var(--status-cancelled)" }}
                          />
                        )}
                        <p
                          className="text-sm font-semibold truncate"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          {product.name}
                        </p>
                      </div>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{
                          color: "var(--text-faint)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {new Date(product.createdAt).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                    <ProductActions productId={product.id} />
                  </div>

                  {/* Category */}
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {product.category}
                  </span>

                  {/* Price + stock grid */}
                  <div
                    className="grid grid-cols-3 gap-3 pt-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    {[
                      {
                        label: "Retail",
                        value: formatPrice(product.retailPricePerYard),
                        color: "var(--text-primary)",
                      },
                      {
                        label: "Wholesale",
                        value: formatPrice(product.wholesalePricePerYard),
                        color: "var(--text-secondary)",
                      },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                          style={{
                            color: "var(--text-faint)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-xs font-semibold tabular-nums"
                          style={{
                            color,
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                    <div>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                        style={{
                          color: "var(--text-faint)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        Stock
                      </p>
                      <p
                        className="text-xs font-bold tabular-nums"
                        style={{
                          color: isCritical
                            ? "var(--status-cancelled)"
                            : isLow
                              ? "var(--status-pending)"
                              : "var(--text-primary)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {product.totalYardsInStock}{" "}
                        <span
                          className="font-normal"
                          style={{ color: "var(--text-faint)" }}
                        >
                          yds
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
