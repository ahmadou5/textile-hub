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
      db.product.count(),
      db.inquiry.count({ where: { status: "OPEN" } }),
      db.product.findMany({
        where: { totalYardsInStock: { lt: 20 } },
        orderBy: { totalYardsInStock: "asc" },
        select: { id: true, name: true, totalYardsInStock: true },
      }),
      db.product.findMany({
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
    (p) => p.totalYardsInStock < 10,
  ).length;

  const stats = [
    {
      label: "Total Products",
      value: productCount,
      icon: Package,
      sub: "in catalogue",
      color: "#D4A853",
      href: "/admin/products",
    },
    {
      label: "Open Inquiries",
      value: openInquiries,
      icon: MessageSquare,
      sub: openInquiries === 0 ? "all clear" : "awaiting reply",
      color: openInquiries > 0 ? "#f59e0b" : "#10b981",
      href: "/admin/inquiries",
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      sub: criticalCount > 0 ? `${criticalCount} critical` : "< 20 yards",
      color: lowStockProducts.length > 0 ? "#ef4444" : "#10b981",
      href: "/admin/low-stock",
      alert: lowStockProducts.length > 0,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <p
          className="text-xs font-semibold tracking-[0.12em] uppercase text-[#D4A853]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Admin Console
        </p>
        <h1
          className="text-3xl font-bold text-slate-800"
          style={{
            fontFamily: "var(--font-playfair, serif)",
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
            className="group relative p-5 rounded-2xl bg-white
              hover:-translate-y-1
              transition-[transform,box-shadow,border-color] duration-200
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]"
            style={{
              border: stat.alert
                ? `1px solid rgba(239,68,68,0.2)`
                : "1px solid rgba(0,0,0,0.07)",
              boxShadow: stat.alert
                ? "0 2px 8px rgba(239,68,68,0.06), 0 8px 24px rgba(0,0,0,0.04)"
                : "0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.03)",
            }}
          >
            {/* Alert pulse for low stock */}
            {stat.alert && (
              <span className="absolute top-4 right-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              </span>
            )}

            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `${stat.color}12`,
                  border: `1px solid ${stat.color}22`,
                }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <ArrowUpRight
                size={14}
                className="text-slate-300 group-hover:text-[#D4A853] transition-[color] duration-200 mt-0.5"
              />
            </div>

            <p
              className="text-3xl font-bold text-slate-800 tabular-nums"
              style={{ fontFamily: "var(--font-playfair, serif)" }}
            >
              {stat.value}
            </p>
            <p
              className="text-sm text-slate-500 mt-0.5"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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

      {/* Low stock mini-list (only if there are affected products) */}
      {lowStockProducts.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(239,68,68,0.15)",
            background: "rgba(239,68,68,0.015)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid rgba(239,68,68,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <TrendingDown size={14} className="text-red-400" />
              <span
                className="text-sm font-semibold text-slate-700"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                Requires immediate attention
              </span>
            </div>
            <Link
              href="/admin/low-stock"
              className="text-xs text-[#D4A853] hover:text-slate-800 font-medium
                transition-[color] duration-150
                focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D4A853]"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-red-50">
            {lowStockProducts.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <span
                  className="text-sm text-slate-700 font-medium"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {p.name}
                </span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    p.totalYardsInStock < 10 ? "text-red-500" : "text-amber-500"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {p.totalYardsInStock} yds
                </span>
              </div>
            ))}
            {lowStockProducts.length > 3 && (
              <div className="px-5 py-2.5">
                <Link
                  href="/admin/low-stock"
                  className="text-xs text-slate-400 hover:text-red-500 transition-[color] duration-150"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
            className="text-base font-bold text-slate-700"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Recent Products
          </h2>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              bg-[#D4A853] text-white
              shadow-[0_2px_6px_rgba(212,168,83,0.3)]
              hover:brightness-105 hover:-translate-y-0.5
              active:translate-y-0
              transition-[filter,transform] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            <Plus size={12} />
            Add Product
          </Link>
        </div>

        <div className="space-y-2">
          {recentProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white"
              style={{
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#F1EDE4" }}
              >
                <span className="text-sm">🧵</span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-slate-800 truncate"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {product.name}
                </p>
                <p
                  className="text-xs text-slate-400 mt-0.5"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {product.category} · {formatPrice(product.retailPricePerYard)}
                  /yd
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    product.totalYardsInStock < 10
                      ? "text-red-500"
                      : product.totalYardsInStock < 20
                        ? "text-amber-500"
                        : "text-slate-400"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {product.totalYardsInStock} yds
                </span>
                <span
                  className="text-xs text-slate-300"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {timeAgo(product.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
