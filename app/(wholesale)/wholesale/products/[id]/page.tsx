// app/(wholesale)/wholesale/products/[id]/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { ArrowLeft, Package, TrendingDown, AlertTriangle } from "lucide-react";
import InquiryModal from "@/components/wholesale/InquiryModal";

import OrderButton from "@/components/checkout/OrderButton";
import WholesaleCalculator from "@/components/wholesale/WholesaleCalculator";

const LOW_STOCK = 50;

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await db.products.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: `${product?.name ?? "Product"} — TextileHub Wholesale` };
}

export default async function WholesaleProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const session = await requireRole(["WHOLESALER", "ADMIN"] as never);
  const { id } = await params;

  const product = await db.products.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      imageUrl: true,
      description: true,
      retailPricePerYard: true,
      wholesalePricePerYard: true,
      totalYardsInStock: true,
      createdAt: true,
    },
  });

  if (!product) notFound();

  const isCritical = product.totalYardsInStock < LOW_STOCK;
  const savings = product.retailPricePerYard - product.wholesalePricePerYard;
  const savingsPct =
    product.retailPricePerYard > 0
      ? Math.round((savings / product.retailPricePerYard) * 100)
      : 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Grain */}
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: "fixed",
          inset: 0,
          filter: "url(#grain)",
          opacity: 0.025,
          pointerEvents: "none",
          zIndex: 999,
        }}
      />

      {/* Back */}
      <Link
        href="/wholesale/products"
        className="inline-flex items-center gap-2 text-sm transition-colors duration-150"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <ArrowLeft size={14} />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-subtle)",
          }}
        >
          {product.imageUrl ? (
            <>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-10">🧵</span>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {product.category}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1
              className="text-3xl font-bold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.03em",
              }}
            >
              {product.name}
            </h1>
            {product.description && (
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {product.description}
              </p>
            )}
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Wholesale price */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--brand-glow)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-1"
                style={{
                  color: "var(--brand-hex)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Your Price
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: "var(--brand-bright)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {formatPrice(product.wholesalePricePerYard)}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{
                  color: "var(--brand-hex)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                per yard (wholesale)
              </p>
            </div>

            {/* Retail price */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-1"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Retail Price
              </p>
              <p
                className="text-2xl font-bold line-through"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {formatPrice(product.retailPricePerYard)}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                per yard (retail)
              </p>
            </div>
          </div>

          {/* Savings badge */}
          {savingsPct > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{
                background: "var(--brand-glow)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <TrendingDown
                size={14}
                style={{ color: "var(--brand-bright)" }}
              />
              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--brand-bright)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                You save {savingsPct}% vs retail — {formatPrice(savings)} per
                yard
              </p>
            </div>
          )}

          {/* Stock */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: isCritical
                ? "rgba(251,191,36,0.06)"
                : "var(--bg-subtle)",
              border: `1px solid ${isCritical ? "rgba(251,191,36,0.2)" : "var(--border)"}`,
            }}
          >
            {isCritical ? (
              <AlertTriangle size={16} style={{ color: "#fbbf24" }} />
            ) : (
              <Package size={16} style={{ color: "var(--text-faint)" }} />
            )}
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: isCritical ? "#fbbf24" : "var(--text-primary)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {product.totalYardsInStock.toLocaleString()} yards in stock
              </p>
              {isCritical && (
                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: "#d97706",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Low stock — order soon
                </p>
              )}
            </div>
          </div>

          {/* Yardage calculator */}
          <WholesaleCalculator
            wholesalePricePerYard={product.wholesalePricePerYard}
            retailPricePerYard={product.retailPricePerYard}
          />

          {/* CTAs — Inquiry + Order */}
          <div className="flex flex-col gap-3">
            {/* ✅ Order button — opens CheckoutModal */}
            <OrderButton
              product={{
                id: product.id,
                name: product.name,
                category: product.category,
                wholesalePricePerYard: product.wholesalePricePerYard,
                totalYardsInStock: product.totalYardsInStock,
              }}
            />

            {/* Inquiry — secondary action */}
            <InquiryModal productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
