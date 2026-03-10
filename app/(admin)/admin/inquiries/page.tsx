// app/(admin)/admin/inquiries/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ChevronRight, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inquiries — Admin | TextileHub" };

const STATUS_STYLES = {
  OPEN: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  REPLIED: "bg-sky-500/12 text-sky-400 border-sky-500/25",
  CLOSED: "bg-slate-500/12 text-slate-500 border-slate-600/25",
};

const STATUS_DOT = {
  OPEN: "bg-amber-400",
  REPLIED: "bg-sky-400",
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
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-3xl font-bold text-slate-800 tracking-tight"
            style={{
              fontFamily: "var(--font-playfair, serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Inquiries
          </h1>
          <p
            className="text-slate-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {inquiries.length} total
            {openCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {openCount} open
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Status legend */}
      <div
        className="flex items-center gap-5 text-xs text-slate-500"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        {(["OPEN", "REPLIED", "CLOSED"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>

      {/* List */}
      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageSquare size={32} className="text-slate-300 mb-4" />
          <p
            className="text-slate-500 font-medium"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            No inquiries yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/admin/inquiries/${inquiry.id}`}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80
                hover:border-[#D4A853]/40 hover:shadow-[0_4px_16px_rgba(212,168,83,0.08),0_1px_4px_rgba(0,0,0,0.04)]
                hover:-translate-y-0.5
                transition-[transform,box-shadow,border-color] duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]"
            >
              {/* Status dot */}
              <div className="flex-shrink-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[inquiry.status as keyof typeof STATUS_DOT]}`}
                  style={{
                    boxShadow:
                      inquiry.status === "OPEN"
                        ? "0 0 6px rgba(251,191,36,0.6)"
                        : "none",
                  }}
                />
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-600"
                style={{
                  background: "#F1EDE4",
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
                    className={`text-sm font-semibold text-slate-800 truncate ${inquiry.status === "OPEN" ? "font-bold" : ""}`}
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    {inquiry.users.name ?? inquiry.users.email}
                  </span>
                  <span className="text-slate-300 text-xs hidden sm:block">
                    ·
                  </span>
                  <span
                    className="text-xs text-slate-400 truncate hidden sm:block"
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    {inquiry.products.name}
                  </span>
                </div>
                <p
                  className="text-sm text-slate-500 truncate mt-0.5"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  {inquiry.subject}
                </p>
              </div>

              {/* Right meta */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="hidden sm:flex items-center gap-1 text-xs text-slate-400"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  <MessageSquare size={11} />
                  {inquiry.messages.length}
                </span>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold border h-auto py-0.5 px-2 hidden sm:flex ${
                    STATUS_STYLES[inquiry.status as keyof typeof STATUS_STYLES]
                  }`}
                >
                  {inquiry.status}
                </Badge>

                <span
                  className="flex items-center gap-1 text-xs text-slate-400"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  <Clock size={11} />
                  {timeAgo(inquiry.createdAt)}
                </span>

                <ChevronRight
                  size={15}
                  className="text-slate-300 group-hover:text-[#D4A853] group-hover:translate-x-0.5 transition-[color,transform] duration-200"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
