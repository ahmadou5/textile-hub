// app/(wholesale)/wholesale/inquiries/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { MessageSquare, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "My Inquiries — TextileHub Wholesale",
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  OPEN: {
    background: "rgba(217,119,6,0.08)",
    color: "var(--status-pending)",
    border: "1px solid rgba(217,119,6,0.25)",
  },
  REPLIED: {
    background: "rgba(5,150,105,0.08)",
    color: "var(--status-confirmed)",
    border: "1px solid rgba(5,150,105,0.25)",
  },
  CLOSED: {
    background: "var(--bg-subtle)",
    color: "var(--text-faint)",
    border: "1px solid var(--border)",
  },
};

const STATUS_DOT: Record<string, React.CSSProperties> = {
  OPEN: { background: "var(--status-pending)" },
  REPLIED: {
    background: "var(--status-confirmed)",
    boxShadow: "0 0 6px rgba(5,150,105,0.5)",
  },
  CLOSED: { background: "var(--text-faint)" },
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
    where: { wholesalerId: session?.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      products: {
        select: { id: true, name: true, category: true, imageUrl: true },
      },
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
    <div className="p-6 lg:p-8 space-y-6 lg:max-w-7xl w-[90%] mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1
          className="text-3xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.03em",
          }}
        >
          My Inquiries
        </h1>
        <p
          className="text-sm"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {inquiries.length} total
          {repliedCount > 0 && (
            <span
              className="ml-2 font-medium"
              style={{ color: "var(--status-confirmed)" }}
            >
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
            background: "rgba(5,150,105,0.07)",
            border: "1px solid rgba(5,150,105,0.18)",
          }}
        >
          <CheckCircle2
            size={15}
            className="flex-shrink-0"
            style={{ color: "var(--status-confirmed)" }}
          />
          <p
            className="text-sm font-medium"
            style={{
              color: "var(--status-confirmed)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
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
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <MessageSquare
            size={28}
            className="mb-4"
            style={{ color: "var(--text-faint)" }}
          />
          <p
            className="font-bold text-lg"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
            }}
          >
            No inquiries yet
          </p>
          <p
            className="text-sm mt-1 max-w-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Browse new arrivals and message admin about products you&apos;re
            interested in.
          </p>
          <Link
            href="/wholesale/new-arrivals"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              hover:-translate-y-0.5 active:translate-y-0
              transition-[background,transform] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              color: "var(--brand-hex)",
              border: "1px solid var(--border-brand)",
              background: "var(--brand-glow)",
              outlineColor: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Browse New Arrivals
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => {
            const lastMsg = inquiry.messages[0];
            const isReplied = inquiry.status === "REPLIED";
            const statusDot = STATUS_DOT[inquiry.status] ?? STATUS_DOT.CLOSED;
            const statusStyle =
              STATUS_STYLES[inquiry.status] ?? STATUS_STYLES.CLOSED;

            return (
              <Link
                key={inquiry.id}
                href={`/wholesale/inquiries/${inquiry.id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl
                  hover:-translate-y-0.5
                  transition-[transform,border-color,box-shadow,background] duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: isReplied
                    ? "rgba(5,150,105,0.04)"
                    : "var(--bg-card)",
                  border: `1px solid ${isReplied ? "rgba(5,150,105,0.18)" : "var(--border-brand)"}`,
                  boxShadow: "var(--shadow-card)",
                  outlineColor: "var(--brand-hex)",
                }}
              >
                {/* Status dot */}
                <div className="shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={statusDot} />
                </div>

                {/* Product icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {inquiry.products.imageUrl ? (
                    <Image
                      src={inquiry.products.imageUrl}
                      alt={inquiry.products.name}
                      className="w-full h-full object-cover rounded-xl"
                      width={36}
                      height={36}
                    />
                  ) : (
                    <span className="text-sm">🧵</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-syne, sans-serif)",
                      }}
                    >
                      {inquiry.products.name}
                    </span>
                    {isReplied && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-semibold flex-shrink-0"
                        style={{ color: "var(--status-confirmed)" }}
                      >
                        <CheckCircle2 size={10} />
                        Replied
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs truncate"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {lastMsg
                      ? `${lastMsg?.users.role === "ADMIN" ? "Admin: " : "You: "}${lastMsg.body}`
                      : inquiry.subject}
                  </p>
                </div>

                {/* Right meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Status badge */}
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:flex"
                    style={{
                      ...statusStyle,
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
                    <Clock size={10} />
                    {timeAgo(inquiry.updatedAt)}
                  </span>

                  <ChevronRight
                    size={14}
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
