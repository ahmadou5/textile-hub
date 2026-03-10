// app/(wholesale)/wholesale/inquiries/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { User } from "next-auth";

export const metadata: Metadata = {
  title: "My Inquiries — TextileHub Wholesale",
};

const STATUS_STYLES = {
  OPEN: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  REPLIED: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  CLOSED: "bg-slate-500/12 text-slate-500 border-slate-600/25",
};

const STATUS_DOT = {
  OPEN: "bg-amber-400",
  REPLIED: "bg-emerald-400",
  CLOSED: "bg-slate-600",
};

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

export default async function WholesaleInquiriesPage() {
  const session = await requireRole(["WHOLESALER", "ADMIN"] as never);

  const inquiries = await db.inquiries.findMany({
    where: { wholesalerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      products: { select: { id: true, name: true, category: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { users: { select: { name: true, role: true } } },
      },
    },
  });

  const repliedCount = inquiries.filter(
    (i: { status: string }) => i.status === "REPLIED",
  ).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1
          className="text-3xl font-bold text-white"
          style={{
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.03em",
          }}
        >
          My Inquiries
        </h1>
        <p
          className="text-slate-500 text-sm"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {inquiries.length} total
          {repliedCount > 0 && (
            <span className="ml-2 text-emerald-400 font-medium">
              · {repliedCount} replied
            </span>
          )}
        </p>
      </div>

      {/* Replied banner */}
      {repliedCount > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(16,185,129,0.07)",
            border: "1px solid rgba(16,185,129,0.18)",
          }}
        >
          <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
          <p
            className="text-sm text-emerald-300 font-medium"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {repliedCount}{" "}
            {repliedCount === 1 ? "inquiry has" : "inquiries have"} been replied
            to by admin
          </p>
        </div>
      )}

      {/* Empty state */}
      {inquiries.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <MessageSquare size={28} className="text-slate-600 mb-4" />
          <p
            className="text-white font-bold text-lg"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            No inquiries yet
          </p>
          <p
            className="text-slate-500 text-sm mt-1 max-w-xs"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Browse new arrivals and message admin about products you&apos;re
            interested in.
          </p>
          <Link
            href="/wholesale/new-arrivals"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              text-emerald-400 border border-emerald-500/20 bg-emerald-500/8
              hover:bg-emerald-500/15 transition-[background] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Browse New Arrivals
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => {
            const lastMsg = inquiry.messages[0];
            const isReplied = inquiry.status === "REPLIED";

            return (
              <Link
                key={inquiry.id}
                href={`/wholesale/inquiries/${inquiry.id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl border
                  hover:-translate-y-0.5
                  transition-[transform,border-color,box-shadow] duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                style={{
                  background: isReplied
                    ? "rgba(16,185,129,0.04)"
                    : "rgba(255,255,255,0.025)",
                  borderColor: isReplied
                    ? "rgba(16,185,129,0.18)"
                    : "rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    isReplied ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.2)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 4px 20px rgba(16,185,129,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    isReplied
                      ? "rgba(16,185,129,0.18)"
                      : "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "none";
                }}
              >
                {/* Status dot */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[inquiry.status as keyof typeof STATUS_DOT]}`}
                    style={
                      isReplied
                        ? { boxShadow: "0 0 6px rgba(16,185,129,0.6)" }
                        : {}
                    }
                  />
                </div>

                {/* Product icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-sm">🧵</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold text-white truncate"
                      style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                    >
                      {inquiry.products.name}
                    </span>
                    {isReplied && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 flex-shrink-0">
                        <CheckCircle2 size={10} />
                        Replied
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs text-slate-500 truncate"
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    {lastMsg
                      ? `${lastMsg?.users.role === "ADMIN" ? "Admin: " : "You: "}${lastMsg.body}`
                      : inquiry.subject}
                  </p>
                </div>

                {/* Right meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold border h-auto py-0.5 px-2 hidden sm:flex ${
                      STATUS_STYLES[
                        inquiry.status as keyof typeof STATUS_STYLES
                      ]
                    }`}
                  >
                    {inquiry.status}
                  </Badge>
                  <span
                    className="flex items-center gap-1 text-xs text-slate-600"
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    <Clock size={10} />
                    {timeAgo(inquiry.updatedAt)}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-[color,transform] duration-200"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
