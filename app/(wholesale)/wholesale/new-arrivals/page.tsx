// app/(wholesale)/wholesale/new-arrivals/page.tsx
import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { WholesaleFeedSkeleton } from "@/components/wholesale/WholeSaleFeedSkeleton";
import { Sparkles, Package } from "lucide-react";
import type { Metadata } from "next";
import { ProductList } from "@/components/wholesale/ProductList";

export const metadata: Metadata = {
  title: "New Arrivals — TextileHub Wholesale",
};

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

  // ── Empty state ──────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div
          className="relative p-10 rounded-3xl"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-brand)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Corner accents */}
          {(
            [
              "top-0 left-0",
              "top-0 right-0",
              "bottom-0 left-0",
              "bottom-0 right-0",
            ] as const
          ).map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-3 h-3`}
              style={{
                borderColor: "var(--border-strong)",
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
                background: "var(--brand-glow)",
                border: "1px solid var(--border-brand)",
              }}
            >
              <Package
                size={28}
                style={{ color: "var(--brand-hex)", opacity: 0.6 }}
              />
            </div>

            <div className="space-y-2">
              <h3
                className="text-xl font-bold"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                No new arrivals this week
              </h3>
              <p
                className="text-sm max-w-xs mx-auto"
                style={{
                  color: "var(--text-muted)",
                  lineHeight: "1.7",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Check back soon — new fabric stock is added regularly.
              </p>
            </div>

            <Link
              href="/wholesale/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                hover:-translate-y-0.5 active:translate-y-0
                transition-[background,border-color,transform] duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                color: "var(--brand-hex)",
                border: "1px solid var(--border-brand)",
                background: "var(--brand-glow)",
                outlineColor: "var(--brand-hex)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Browse full catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProductList products={products} />;
}

// ── Page ─────────────────────────────────────────────────────
export default async function NewArrivalsPage() {
  await requireRole(["WHOLESALER", "ADMIN"] as never);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--brand-glow)",
                border: "1px solid var(--border-brand)",
              }}
            >
              <Sparkles size={16} style={{ color: "var(--brand-hex)" }} />
            </div>
            <h1
              className="text-3xl font-bold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.03em",
              }}
            >
              New Arrivals
            </h1>
          </div>
          <p
            className="text-sm pl-[42px]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Products added in the last 7 days — wholesale pricing shown
          </p>
        </div>

        {/* Live indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
          style={{
            background: "var(--brand-glow)",
            border: "1px solid var(--border-brand)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "var(--brand-bright)" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: "var(--brand-hex)" }}
            />
          </span>
          <span
            className="text-xs font-medium"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Live feed
          </span>
        </div>
      </div>

      {/* Info bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs flex-wrap"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          color: "var(--text-faint)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--brand-hex)", opacity: 0.5 }}
          />
          Wholesale-only pricing
        </span>
        <span className="w-px h-3" style={{ background: "var(--border)" }} />
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--status-pending)", opacity: 0.5 }}
          />
          Amber = low stock (&lt;20 yds)
        </span>
        <span className="w-px h-3" style={{ background: "var(--border)" }} />
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--brand-bright)", opacity: 0.5 }}
          />
          Pulsing = added today
        </span>
      </div>

      {/* Feed */}
      <Suspense fallback={<WholesaleFeedSkeleton />}>
        <NewArrivalsFeed />
      </Suspense>
    </div>
  );
}
