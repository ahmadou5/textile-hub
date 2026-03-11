// app/(wholesale)/wholesale/new-arrivals/page.tsx
import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { WholesaleFeedSkeleton } from "@/components/wholesale/WholeSaleFeedSkeleton";
import { relativeTime } from "@/lib/relativeTime";
import {
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Clock,
  Package,
  TrendingDown,
} from "lucide-react";
import type { Metadata } from "next";
import { ProductList } from "@/components/wholesale/ProductList";

export const metadata: Metadata = {
  title: "New Arrivals — TextileHub Wholesale",
};

const LOW_STOCK = 20;

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isNew(date: Date): boolean {
  return Date.now() - date.getTime() < 24 * 60 * 60 * 1000; // < 24h
}

const now = Date.now();

async function NewArrivalsFeed() {
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const products = await db.products.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      imageUrl: true,
      wholesalePricePerYard: true,
      retailPricePerYard: true,
      totalYardsInStock: true,
      createdAt: true,
    },
  });

  // ── Empty state ────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        {/* Animated border box */}
        <div
          className="relative p-10 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(16,185,129,0.15)",
            boxShadow:
              "0 0 40px rgba(16,185,129,0.04), inset 0 0 40px rgba(16,185,129,0.02)",
          }}
        >
          {/* Corner accents */}
          {[
            "top-0 left-0",
            "top-0 right-0",
            "bottom-0 left-0",
            "bottom-0 right-0",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-3 h-3`}
              style={{
                borderColor: "rgba(16,185,129,0.4)",
                borderStyle: "solid",
                borderWidth:
                  i === 0
                    ? "1px 0 0 1px"
                    : i === 1
                      ? "1px 1px 0 0"
                      : i === 2
                        ? "0 0 1px 1px"
                        : "0 1px 1px 0",
                borderRadius:
                  i === 0
                    ? "2px 0 0 0"
                    : i === 1
                      ? "0 2px 0 0"
                      : i === 2
                        ? "0 0 0 2px"
                        : "0 0 2px 0",
              }}
            />
          ))}

          <div className="space-y-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <Package size={28} className="text-emerald-500/60" />
            </div>
            <div className="space-y-2">
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}
              >
                No new arrivals this week
              </h3>
              <p
                className="text-slate-500 text-sm max-w-xs mx-auto"
                style={{ lineHeight: "1.7" }}
              >
                Check back soon — new fabric stock is added regularly.
              </p>
            </div>
            <Link
              href="/wholesale/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                text-emerald-400 border border-emerald-500/20 bg-emerald-500/8
                hover:bg-emerald-500/15 hover:border-emerald-500/30
                transition-[background,border-color] duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              Browse full catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Feed ───────────────────────────────────────────────────
  return <ProductList products={products} />;
}

// ── Page ──────────────────────────────────────────────────────
export default async function NewArrivalsPage() {
  await requireRole(["WHOLESALER", "ADMIN"] as never);

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-4xl mx-auto">
      {/* Grain overlay */}
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <filter id="ws-grain">
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
          filter: "url(#ws-grain)",
          opacity: 0.025,
          pointerEvents: "none",
          zIndex: 999,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <h1
              className="text-3xl font-bold text-white"
              style={{
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.03em",
              }}
            >
              New Arrivals
            </h1>
          </div>
          <p className="text-slate-500 text-sm pl-10.5">
            Products added in the last 7 days — wholesale pricing shown
          </p>
        </div>

        {/* Live indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.15)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-400">
            Live feed
          </span>
        </div>
      </div>

      {/* Info bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-slate-500"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
          Wholesale-only pricing
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500/50" />
          Amber = low stock (&lt;20 yds)
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-300/50 animate-pulse" />
          Pulsing = added today
        </span>
      </div>

      {/* Feed with Suspense */}
      <Suspense fallback={<WholesaleFeedSkeleton />}>
        <NewArrivalsFeed />
      </Suspense>
    </div>
  );
}
