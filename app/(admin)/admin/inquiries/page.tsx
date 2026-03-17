// app/(admin)/admin/inquiries/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { MessageSquare, ChevronRight, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inquiries — Admin | TextileHub" };

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  OPEN: {
    background: "rgba(217,119,6,0.08)",
    color: "var(--status-pending)",
    border: "1px solid rgba(217,119,6,0.25)",
  },
  REPLIED: {
    background: "rgba(37,99,235,0.08)",
    color: "var(--status-shipped)",
    border: "1px solid rgba(37,99,235,0.25)",
  },
  CLOSED: {
    background: "var(--bg-subtle)",
    color: "var(--text-faint)",
    border: "1px solid var(--border)",
  },
};

const STATUS_DOT: Record<string, React.CSSProperties> = {
  OPEN: {
    background: "var(--status-pending)",
    boxShadow: "0 0 6px rgba(217,119,6,0.5)",
  },
  REPLIED: {
    background: "var(--status-shipped)",
  },
  CLOSED: {
    background: "var(--text-faint)",
  },
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

export default async function AdminInquiriesPage() {
  await requireRole("ADMIN");

  const inquiries = await db.inquiries.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { name: true, email: true } },
      products: { select: { name: true, category: true } },
      messages: { select: { id: true }, orderBy: { createdAt: "desc" } },
    },
  });

  const openCount = inquiries.filter(
    (i: { status: string }) => i.status === "OPEN",
  ).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Inquiries
          </h1>
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {inquiries.length} total
            {openCount > 0 && (
              <span
                className="ml-2 font-medium"
                style={{ color: "var(--status-pending)" }}
              >
                · {openCount} open
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Status legend */}
      <div
        className="flex items-center gap-5 text-xs"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        {(["OPEN", "REPLIED", "CLOSED"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={STATUS_DOT[s]} />
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>

      {/* Empty state */}
      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageSquare
            size={32}
            className="mb-4"
            style={{ color: "var(--text-faint)" }}
          />
          <p
            className="font-medium"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            No inquiries yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => {
            const dotStyle = STATUS_DOT[inquiry.status] ?? STATUS_DOT.CLOSED;
            const badgeStyle =
              STATUS_STYLES[inquiry.status] ?? STATUS_STYLES.CLOSED;
            const isOpen = inquiry.status === "OPEN";

            return (
              <Link
                key={inquiry.id}
                href={`/admin/inquiries/${inquiry.id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl
                  hover:-translate-y-0.5
                  transition-[transform,box-shadow,border-color] duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-brand)",
                  boxShadow: "var(--shadow-card)",
                  outlineColor: "var(--brand-hex)",
                }}
              >
                {/* Status dot */}
                <div className="flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={dotStyle} />
                </div>

                {/* Avatar initials */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: "var(--bg-subtle)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {(inquiry.users.name ?? "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm truncate ${isOpen ? "font-bold" : "font-semibold"}`}
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {inquiry.users.name ?? inquiry.users.email}
                    </span>
                    <span
                      className="text-xs hidden sm:block"
                      style={{ color: "var(--border)" }}
                    >
                      ·
                    </span>
                    <span
                      className="text-xs truncate hidden sm:block"
                      style={{
                        color: "var(--text-faint)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {inquiry.products.name}
                    </span>
                  </div>
                  <p
                    className="text-sm truncate mt-0.5"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {inquiry.subject}
                  </p>
                </div>

                {/* Right meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="hidden sm:flex items-center gap-1 text-xs"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    <MessageSquare size={11} />
                    {inquiry.messages.length}
                  </span>

                  {/* Status badge */}
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:flex"
                    style={{
                      ...badgeStyle,
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {inquiry.status}
                  </span>

                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    <Clock size={11} />
                    {timeAgo(inquiry.createdAt)}
                  </span>

                  <ChevronRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-[color,transform] duration-200"
                    style={{ color: "var(--text-faint)" }}
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
