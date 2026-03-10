// app/(wholesale)/wholesale/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  Package,
  ArrowUpRight,
  Bell,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — TextileHub Wholesale",
};

export default async function WholesaleDashboardPage() {
  const session = await requireRole(["WHOLESALER", "ADMIN"] as never);
  const now = new Date();
  const [inquiries, recentProducts] = await Promise.all([
    db.inquiries.findMany({
      where: { wholesalerId: session.user.id },
      include: {
        products: { select: { name: true } },
        messages: { select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.products.findMany({
      where: {
        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
    }),
  ]);

  const repliedCount = inquiries.filter(
    (i: { status: string }) => i.status === "REPLIED",
  ).length;
  const openCount = inquiries.filter(
    (i: { status: string }) => i.status === "OPEN",
  ).length;
  const totalMessages = inquiries.reduce(
    (sum: number, i: { messages: { id: string }[] }) => sum + i.messages.length,
    0,
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Grain */}
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

      {/* Greeting */}
      <div className="space-y-1">
        <p
          className="text-xs font-semibold tracking-[0.15em] uppercase text-emerald-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Welcome back
        </p>
        <h1
          className="text-4xl font-bold text-white"
          style={{
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.03em",
          }}
        >
          {session.user.name?.split(" ")[0] ?? "Wholesaler"}
        </h1>
        <p
          className="text-slate-500 text-sm"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Your wholesale portal — track inquiries and discover new stock.
        </p>
      </div>

      {/* Replied notification banner */}
      {repliedCount > 0 && (
        <div
          className="flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
            boxShadow: "0 0 24px rgba(16,185,129,0.06)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <Bell size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-semibold text-emerald-300"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              {repliedCount}{" "}
              {repliedCount === 1 ? "inquiry has" : "inquiries have"} been
              replied to
            </p>
            <p
              className="text-xs text-slate-500 mt-0.5"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Admin has responded to your messages — tap to view
            </p>
          </div>
          <Link
            href="/wholesale/inquiries"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
              text-emerald-400 border border-emerald-500/25 bg-emerald-500/8
              hover:bg-emerald-500/15 hover:border-emerald-500/35
              transition-[background,border-color] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500
              flex-shrink-0"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            View replies
            <ArrowUpRight size={12} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: "New Arrivals",
            value: recentProducts.length,
            sub: "this week",
            icon: Sparkles,
            color: "#10b981",
            href: "/wholesale/new-arrivals",
          },
          {
            label: "My Inquiries",
            value: inquiries.length,
            sub: `${openCount} open`,
            icon: MessageSquare,
            color: "#D4A853",
            href: "/wholesale/inquiries",
          },
          {
            label: "Messages Sent",
            value: totalMessages,
            sub: "across all threads",
            icon: Package,
            color: "#94a3b8",
            href: "/wholesale/inquiries",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-4 rounded-2xl border
              hover:-translate-y-0.5
              transition-[transform,border-color,box-shadow] duration-200
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            style={{
              background: "rgba(255,255,255,0.025)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                `${stat.color}30`;
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                `0 4px 20px ${stat.color}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}25`,
                }}
              >
                <stat.icon size={15} style={{ color: stat.color }} />
              </div>
              <ArrowUpRight
                size={13}
                className="text-slate-600 group-hover:text-slate-400 transition-[color] duration-150"
              />
            </div>
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs text-slate-500 mt-0.5"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {stat.label}
            </p>
            <p
              className="text-[11px] mt-0.5"
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

      {/* Quick links */}
      <div className="space-y-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Quick Access
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Browse New Arrivals",
              desc: "Products added in the last 7 days",
              icon: Sparkles,
              href: "/wholesale/new-arrivals",
              accent: "#10b981",
            },
            {
              label: "My Inquiries",
              desc:
                repliedCount > 0
                  ? `${repliedCount} awaiting your attention`
                  : "Track your messages",
              icon: MessageSquare,
              href: "/wholesale/inquiries",
              accent: "#D4A853",
              badge: repliedCount > 0 ? repliedCount : undefined,
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-4 p-4 rounded-2xl border
                hover:-translate-y-0.5
                transition-[transform,border-color,box-shadow] duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${item.accent}12`,
                  border: `1px solid ${item.accent}20`,
                }}
              >
                <item.icon size={17} style={{ color: item.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-[color] duration-150"
                    style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                  >
                    {item.label}
                  </p>
                  {item.badge && (
                    <span
                      className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
                      style={{ background: item.accent }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs text-slate-500 mt-0.5 truncate"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {item.desc}
                </p>
              </div>
              <ArrowUpRight
                size={14}
                className="text-slate-600 group-hover:text-slate-300 transition-[color] duration-200 flex-shrink-0"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
