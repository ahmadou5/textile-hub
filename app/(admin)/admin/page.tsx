// app/(admin)/admin/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Package,
  MessageSquare,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Admin | TextileHub",
};

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [productCount, openInquiries, lowStockProducts, recentProducts] =
    await Promise.all([
      db.products.count(),
      db.inquiries.count({ where: { status: "OPEN" } }),
      db.products.findMany({
        where: { totalYardsInStock: { lt: 20 } },
        orderBy: { totalYardsInStock: "asc" },
        select: { id: true, name: true, totalYardsInStock: true },
      }),
      db.products.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          category: true,
          retailPricePerYard: true,
          totalYardsInStock: true,
          createdAt: true,
        },
      }),
    ]);

  const criticalCount = lowStockProducts.filter(
    (p: { totalYardsInStock: number }) => p.totalYardsInStock < 10,
  ).length;

  const stats = [
    {
      label: "Total Products",
      value: productCount,
      icon: Package,
      sub: "in catalogue",
      color: "var(--brand-hex)",
      bgColor: "var(--brand-glow)",
      borderColor: "var(--border-brand)",
      href: "/admin/products",
      alert: false,
    },
    {
      label: "Open Inquiries",
      value: openInquiries,
      icon: MessageSquare,
      sub: openInquiries === 0 ? "all clear" : "awaiting reply",
      color:
        openInquiries > 0 ? "var(--status-pending)" : "var(--status-confirmed)",
      bgColor:
        openInquiries > 0 ? "rgba(217,119,6,0.08)" : "rgba(5,150,105,0.08)",
      borderColor:
        openInquiries > 0 ? "rgba(217,119,6,0.2)" : "rgba(5,150,105,0.2)",
      href: "/admin/inquiries",
      alert: false,
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      sub: criticalCount > 0 ? `${criticalCount} critical` : "< 20 yards",
      color:
        lowStockProducts.length > 0
          ? "var(--status-cancelled)"
          : "var(--status-confirmed)",
      bgColor:
        lowStockProducts.length > 0
          ? "rgba(220,38,38,0.08)"
          : "rgba(5,150,105,0.08)",
      borderColor:
        lowStockProducts.length > 0
          ? "rgba(220,38,38,0.2)"
          : "rgba(5,150,105,0.2)",
      href: "/admin/low-stock",
      alert: lowStockProducts.length > 0,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p
          className="text-xs font-semibold tracking-[0.12em] uppercase"
          style={{
            color: "var(--brand-hex)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Admin Console
        </p>
        <h1
          className="text-3xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.02em",
          }}
        >
          Dashboard
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative p-5 rounded-2xl
              hover:-translate-y-1
              transition-[transform,box-shadow,border-color] duration-200
              focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${stat.alert ? "rgba(220,38,38,0.2)" : "var(--border-brand)"}`,
              boxShadow: stat.alert
                ? "0 2px 8px rgba(220,38,38,0.06), 0 8px 24px rgba(0,0,0,0.04)"
                : "var(--shadow-card)",
              outlineColor: "var(--brand-hex)",
            }}
          >
            {/* Alert pulse */}
            {stat.alert && (
              <span className="absolute top-4 right-4">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "var(--status-cancelled)" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: "var(--status-cancelled)" }}
                  />
                </span>
              </span>
            )}

            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: stat.bgColor,
                  border: `1px solid ${stat.borderColor}`,
                }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <ArrowUpRight
                size={14}
                className="transition-[color] duration-200 mt-0.5"
                style={{ color: "var(--text-faint)" }}
              />
            </div>

            <p
              className="text-3xl font-bold tabular-nums"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              {stat.value}
            </p>
            <p
              className="text-sm mt-0.5"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {stat.label}
            </p>
            <p
              className="text-xs mt-0.5 font-medium"
              style={{
                color: stat.color,
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {stat.sub}
            </p>
          </Link>
        ))}
      </div>

      {/* Low stock mini-list */}
      {lowStockProducts.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(220,38,38,0.15)",
            background: "rgba(220,38,38,0.015)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid rgba(220,38,38,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <TrendingDown
                size={14}
                style={{ color: "var(--status-cancelled)" }}
              />
              <span
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Requires immediate attention
              </span>
            </div>
            <Link
              href="/admin/low-stock"
              className="text-xs font-medium transition-[color] duration-150
                focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                color: "var(--brand-hex)",
                outlineColor: "var(--brand-hex)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              View all →
            </Link>
          </div>

          <div>
            {lowStockProducts
              .slice(0, 3)
              .map(
                (
                  p: { id: string; name: string; totalYardsInStock: number },
                  i: number,
                ) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      borderTop:
                        i === 0 ? "none" : "1px solid rgba(220,38,38,0.06)",
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{
                        color:
                          p.totalYardsInStock < 10
                            ? "var(--status-cancelled)"
                            : "var(--status-pending)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {p.totalYardsInStock} yds
                    </span>
                  </div>
                ),
              )}
            {lowStockProducts.length > 3 && (
              <div
                className="px-5 py-2.5"
                style={{ borderTop: "1px solid rgba(220,38,38,0.06)" }}
              >
                <Link
                  href="/admin/low-stock"
                  className="text-xs transition-[color] duration-150"
                  style={{
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  + {lowStockProducts.length - 3} more products
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-base font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
            }}
          >
            Recent Products
          </h2>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white
              hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0
              transition-[filter,transform] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
              boxShadow: "var(--shadow-brand)",
              outlineColor: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            <Plus size={12} />
            Add Product
          </Link>
        </div>

        <div className="space-y-2">
          {recentProducts.map(
            (product: {
              id: string;
              name: string;
              category: string;
              retailPricePerYard: number;
              totalYardsInStock: number;
              createdAt: Date;
            }) => (
              <div
                key={product.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-brand)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="text-sm">🧵</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {product.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {product.category} ·{" "}
                    {formatPrice(product.retailPricePerYard)}/yd
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{
                      color:
                        product.totalYardsInStock < 10
                          ? "var(--status-cancelled)"
                          : product.totalYardsInStock < 20
                            ? "var(--status-pending)"
                            : "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {product.totalYardsInStock} yds
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {timeAgo(product.createdAt)}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
