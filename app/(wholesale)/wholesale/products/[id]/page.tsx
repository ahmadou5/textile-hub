// app/(wholesale)/wholesale/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  TrendingDown,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Metadata } from "next";
import WholesaleCalculator from "@/components/wholesale/WholesaleCalculator";
import InquiryModal from "@/components/wholesale/InquiryModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.products.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: product
      ? `${product.name} — Wholesale | TextileHub`
      : "Product Not Found",
  };
}

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const LOW_STOCK = 20;
const WARN_STOCK = 50;

export default async function WholesaleProductDetailPage({
  params,
}: PageProps) {
  await requireRole(["WHOLESALER", "ADMIN"] as never);

  const { id } = await params;

  const product = await db.products.findUnique({
    where: { id },
  });

  if (!product) notFound();

  const isCritical = product.totalYardsInStock < LOW_STOCK;
  const isLow = !isCritical && product.totalYardsInStock < WARN_STOCK;
  const savingsPct = Math.round(
    ((product.retailPricePerYard - product.wholesalePricePerYard) /
      product.retailPricePerYard) *
      100,
  );

  // Stock bar fill (cap at 100%)
  const maxStock = 500;
  const stockPct = Math.min((product.totalYardsInStock / maxStock) * 100, 100);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Back nav */}
      <Link
        href="/wholesale/new-arrivals"
        className="inline-flex items-center gap-2 text-sm text-slate-500
          hover:text-slate-200 transition-[color] duration-150 group
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
        />
        Back to New Arrivals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: Image + meta ─────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image */}
          <div
            className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px_32px rgba(0,0,0,0.4)",
            }}
          >
            {product.imageUrl ? (
              <>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl opacity-10">🧵</span>
              </div>
            )}

            {/* Wholesale exclusive badge */}
            <div className="absolute top-3 left-3">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold
                  tracking-wider uppercase bg-emerald-500/90 backdrop-blur-sm text-white"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                <ShieldCheck size={10} />
                Wholesale
              </span>
            </div>

            {/* Stock status corner badge */}
            {(isCritical || isLow) && (
              <div className="absolute top-3 right-3">
                <Badge
                  className={`text-[10px] font-bold border ${
                    isCritical
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {isCritical ? "Critical Stock" : "Low Stock"}
                </Badge>
              </div>
            )}
          </div>

          {/* Category + upload info */}
          <div className="flex items-center justify-between">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {product.category}
            </span>
            <span
              className="text-xs text-slate-600"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Added{" "}
              {product.createdAt.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* ── Right: Data panel ──────────────────── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Product name */}
          <div className="space-y-1">
            <h1
              className="text-4xl font-bold text-white leading-tight"
              style={{
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.03em",
              }}
            >
              {product.name}
            </h1>
            {product.description && (
              <p
                className="text-slate-500 text-sm leading-relaxed pt-1"
                style={{
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                  lineHeight: "1.75",
                }}
              >
                {product.description}
              </p>
            )}
          </div>

          {/* ── Dual pricing panel ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Wholesale price — primary */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: "rgba(16,185,129,0.07)" }}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <EyeOff size={12} className="text-emerald-500" />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600"
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    Your Wholesale Price
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold text-emerald-400"
                    style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                  >
                    {formatPrice(product.wholesalePricePerYard)}
                  </span>
                  <span
                    className="text-sm text-slate-500"
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    / yard
                  </span>
                </div>
              </div>
              {savingsPct > 0 && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    color: "#34d399",
                    fontFamily: "var(--font-syne, sans-serif)",
                  }}
                >
                  <TrendingDown size={14} />
                  {savingsPct}% off
                </div>
              )}
            </div>

            {/* Retail price — secondary */}
            <div
              className="px-5 py-3 flex items-center justify-between border-t"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2">
                <Eye size={12} className="text-slate-600" />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  Public Retail Price
                </span>
              </div>
              <span
                className="text-base text-slate-500 line-through"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {formatPrice(product.retailPricePerYard)} / yard
              </span>
            </div>
          </div>

          {/* ── Stock panel ── */}
          <div
            className="rounded-2xl px-5 py-4 space-y-3"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: isCritical
                ? "1px solid rgba(239,68,68,0.2)"
                : isLow
                  ? "1px solid rgba(251,191,36,0.2)"
                  : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package
                  size={14}
                  className={
                    isCritical
                      ? "text-red-400"
                      : isLow
                        ? "text-amber-400"
                        : "text-slate-500"
                  }
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  Stock Level
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(isCritical || isLow) && (
                  <Badge
                    className={`text-[10px] font-bold border h-auto py-0.5 ${
                      isCritical
                        ? "bg-red-500/10 text-red-400 border-red-500/25"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                    }`}
                  >
                    {isCritical ? "Critical" : "Low"}
                  </Badge>
                )}
                <span
                  className={`text-xl font-bold ${
                    isCritical
                      ? "text-red-400"
                      : isLow
                        ? "text-amber-400"
                        : "text-white"
                  }`}
                  style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                >
                  {product.totalYardsInStock.toLocaleString()}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    yards
                  </span>
                </span>
              </div>
            </div>

            {/* Stock bar */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${stockPct}%`,
                  background: isCritical
                    ? "linear-gradient(90deg, #ef4444, #f87171)"
                    : isLow
                      ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                      : "linear-gradient(90deg, #10b981, #34d399)",
                  boxShadow: isCritical
                    ? "0 0 8px rgba(239,68,68,0.4)"
                    : isLow
                      ? "0 0 8px rgba(245,158,11,0.4)"
                      : "0 0 8px rgba(16,185,129,0.4)",
                }}
              />
            </div>

            {isCritical && (
              <p
                className="text-xs text-red-400/80"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                ⚠ Stock critically low — message admin to confirm availability
                before ordering
              </p>
            )}
          </div>

          {/* ── Bulk Calculator ── */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <WholesaleCalculator
              wholesalePricePerYard={product.wholesalePricePerYard}
              retailPricePerYard={product.retailPricePerYard}
            />
          </div>

          {/* ── CTA ── */}
          <InquiryModal productId={product.id} productName={product.name} />

          {/* Browse link */}
          <p
            className="text-center text-xs text-slate-600"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Need something else?{" "}
            <Link
              href="/wholesale/products"
              className="text-emerald-500 hover:text-emerald-400 transition-[color] duration-150 underline underline-offset-2"
            >
              Browse full catalogue
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
