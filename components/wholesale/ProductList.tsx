import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  TrendingDown,
  Package,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LOW_STOCK = 50;

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function isNew(date: Date) {
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

type Product = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  retailPricePerYard: number;
  wholesalePricePerYard: number;
  totalYardsInStock: number;
  createdAt: Date;
};

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="space-y-3">
      {products.map((product, i) => {
        const isCritical = product.totalYardsInStock < LOW_STOCK;
        const freshDrop = isNew(product.createdAt);
        const savings =
          product.retailPricePerYard - product.wholesalePricePerYard;
        const savingsPct =
          product.retailPricePerYard > 0
            ? Math.round((savings / product.retailPricePerYard) * 100)
            : 0;

        return (
          <div
            key={product.id}
            className={`group flex gap-4 p-4 rounded-2xl border
              hover:-translate-y-0.5
              hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(16,185,129,0.1)]
              transition-[transform,box-shadow,border-color] duration-200
              ${
                isCritical
                  ? "border-amber-500/20 hover:border-amber-500/35"
                  : "border-white/[0.07] hover:border-emerald-500/25"
              }`}
            style={{
              background: "rgba(255,255,255,0.025)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              animationDelay: `${i * 60}ms`,
            }}
          >
            {/* ── Thumbnail ── */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
              {product.imageUrl ? (
                <>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-[transform] duration-500 group-hover:scale-105"
                    sizes="96px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl opacity-20">🧵</span>
                </div>
              )}

              {freshDrop && (
                <div className="absolute top-1.5 left-1.5">
                  <span className="relative flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider bg-emerald-500 text-white uppercase">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    New
                  </span>
                </div>
              )}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Row 1: category + timestamp */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-medium tracking-widest uppercase text-slate-500"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {product.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600 flex-shrink-0">
                  <Clock size={10} />
                  {relativeTime(product.createdAt)}
                </span>
              </div>

              {/* Row 2: product name */}
              <h3
                className="text-base font-bold text-white leading-snug truncate group-hover:text-emerald-300 transition-[color] duration-200"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}
              >
                {product.name}
              </h3>

              {/* Row 3: pricing + stock */}
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-lg font-bold text-emerald-400"
                    style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                  >
                    {formatPrice(product.wholesalePricePerYard)}
                  </span>
                  <span className="text-xs text-slate-600">/yd</span>
                </div>

                {savingsPct > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                    <TrendingDown size={9} />
                    {savingsPct}% off retail
                  </span>
                )}

                {isCritical ? (
                  <Badge className="flex items-center gap-1 text-[10px] px-2 py-0.5 h-auto font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-full">
                    <AlertTriangle size={9} />
                    Low Stock · {product.totalYardsInStock} yds
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Package size={10} />
                    {product.totalYardsInStock.toLocaleString()} yds
                  </span>
                )}
              </div>

              {/* Row 4: action */}
              <div className="flex items-center justify-end pt-0.5">
                <Link
                  href={`/wholesale/products/${product.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                    text-slate-300 border border-white/10 bg-white/[0.04]
                    hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/[0.08]
                    active:scale-[0.97]
                    transition-[color,border-color,background,transform] duration-150
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  <MessageSquare size={12} />
                  Message Admin
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
