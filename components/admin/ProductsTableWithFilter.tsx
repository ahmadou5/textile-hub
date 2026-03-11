// components/admin/ProductsTableWithFilter.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
    <div className="w-[90%] mx-auto">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <p
          className="text-sm text-slate-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {showLowStockOnly
            ? `${displayed.length} low stock products`
            : `${products.length} total products`}
        </p>

        <button
          onClick={() => setShowLowStockOnly((v) => !v)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border
            transition-[background,border-color,color,transform] duration-150
            hover:-translate-y-0.5 active:translate-y-0
            focus-visible:outline-2 focus-visible:outline-offset-1
            ${
              showLowStockOnly
                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 focus-visible:outline-red-500"
                : "bg-white border-slate-200 text-slate-600 hover:border-[#D4A853]/40 hover:text-[#D4A853] focus-visible:outline-[#D4A853]"
            }
          `}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {showLowStockOnly ? (
            <>
              <X size={12} />
              Clear filter
            </>
          ) : (
            <>
              <Filter size={12} />
              Low Stock Only
              {lowStockCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white bg-red-500">
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
            background: "rgba(16,185,129,0.03)",
            border: "1px solid rgba(16,185,129,0.12)",
          }}
        >
          <p
            className="text-slate-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            No low stock products — all healthy!
          </p>
        </div>
      )}

      {/* Table */}
      {displayed.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow:
              "0 2px_4px rgba(0,0,0,0.04), 0 8px_24px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-[1fr_130px_110px_110px_110px_90px] gap-4 px-5 py-3"
            style={{
              background: "rgba(0,0,0,0.02)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
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
                className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {displayed.map((product) => {
              const isCritical = product.totalYardsInStock < 10;
              const isLow = !isCritical && product.totalYardsInStock < 20;

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[1fr_130px_110px_110px_110px_90px] gap-4 px-5 py-4 items-center bg-white"
                  style={{
                    background: isCritical
                      ? "rgba(239,68,68,0.02)"
                      : isLow
                        ? "rgba(245,158,11,0.015)"
                        : "white",
                  }}
                >
                  {/* Name */}
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold text-slate-800 truncate"
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      {isCritical && (
                        <AlertTriangle
                          size={12}
                          className="inline-block text-red-500 mr-1.5 mb-0.5"
                        />
                      )}
                      {product.name}
                    </p>
                    <p
                      className="text-[11px] text-slate-400 mt-0.5"
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      {new Date(product.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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

                  {/* Retail */}
                  <span
                    className="text-sm text-slate-700 font-medium tabular-nums"
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    {formatPrice(product.retailPricePerYard)}
                  </span>

                  {/* Wholesale */}
                  <span
                    className="text-sm text-slate-600 tabular-nums"
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    {formatPrice(product.wholesalePricePerYard)}
                  </span>

                  {/* Stock */}
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isCritical
                        ? "text-red-500"
                        : isLow
                          ? "text-amber-500"
                          : "text-slate-700"
                    }`}
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    {product.totalYardsInStock}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      yds
                    </span>
                  </span>

                  {/* Actions */}
                  <ProductActions productId={product.id} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
