// app/(wholesale)/wholesale/inquiries/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  RefreshCw,
} from "lucide-react";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import ThreadRefreshButton from "@/components/ThreadRefreshButton";
import WholesalerReplyBox from "@/components/wholesale/WholeSalerReplyBox";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STYLES = {
  OPEN: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  REPLIED: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  CLOSED: "bg-slate-500/12 text-slate-500 border-slate-600/25",
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const inquiry = await db.inquiries.findUnique({
    where: { id },
    select: { subject: true },
  });
  return {
    title: inquiry
      ? `${inquiry.subject} — Wholesale | TextileHub`
      : "Inquiry Not Found",
  };
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function WholesaleInquiryThreadPage({
  params,
}: PageProps) {
  // ✅ noStore ensures latest messages always fetched — no stale cache
  noStore();

  const session = await requireRole(["WHOLESALER", "ADMIN"] as never);
  const { id } = await params;

  const inquiry = await db.inquiries.findUnique({
    where: { id },
    include: {
      users: { select: { id: true } },
      products: {
        select: { id: true, name: true, category: true, imageUrl: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          users: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  if (!inquiry) notFound();

  // Wholesalers can only see their own inquiries
  if (
    session?.user.role === "WHOLESALER" &&
    inquiry.users.id !== session?.user.id
  ) {
    redirect("/wholesale/inquiries");
  }

  const isReplied = inquiry.status === "REPLIED";
  const isClosed = inquiry.status === "CLOSED";
  const adminReplies = inquiry.messages.filter(
    (m) => m.users?.role === "ADMIN",
  );

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-6 lg:p-8 space-y-4">
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
      <div className="flex items-center justify-between flex-shrink-0">
        <Link
          href="/wholesale/inquiries"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200
            transition-[color] duration-150 group
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
          />
          My Inquiries
        </Link>
        {/* Refresh button — client component */}
        <ThreadRefreshButton />
      </div>

      {/* Thread header */}
      <div
        className="flex items-start justify-between gap-4 p-5 rounded-2xl flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-xl font-bold text-white leading-snug"
              style={{
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.02em",
              }}
            >
              {inquiry.subject}
            </h1>
            <Badge
              variant="outline"
              className={`text-[10px] font-bold border h-auto flex-shrink-0 ${
                STATUS_STYLES[inquiry.status as keyof typeof STATUS_STYLES]
              }`}
            >
              {inquiry.status}
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-1.5 text-xs text-slate-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              <Package size={11} />
              <span className="text-slate-400 font-medium">
                {inquiry.products.name}
              </span>
              <span className="text-slate-600 hidden sm:block">
                — {inquiry.products.category}
              </span>
            </div>
            <Separator
              orientation="vertical"
              className="h-3 bg-white/10 hidden sm:block"
            />
            <span
              className="flex items-center gap-1 text-xs text-slate-600 hidden sm:flex"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              <Clock size={10} />
              {inquiry.createdAt.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <Separator
              orientation="vertical"
              className="h-3 bg-white/10 hidden sm:block"
            />
            <span
              className="text-xs text-slate-600 hidden sm:block"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {inquiry.messages.length} message
              {inquiry.messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Admin replied banner */}
      {isReplied && adminReplies.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-shrink-0"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            boxShadow: "0 0 20px rgba(16,185,129,0.05)",
          }}
        >
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <p
            className="text-sm font-semibold text-emerald-300"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Admin has responded — {adminReplies.length} reply
            {adminReplies.length !== 1 ? "ies" : ""} in this thread
          </p>
        </div>
      )}

      {/* Messages thread — full history */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-1 pb-4 pr-2">
          {inquiry.messages.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p
                className="text-slate-600 text-sm"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                No messages yet
              </p>
            </div>
          ) : (
            inquiry.messages.map((msg, index) => {
              const isAdminMsg = msg.users?.role === "ADMIN";
              const isOwnMsg = msg.users?.id === session?.user.id;
              const prevMsg = index > 0 ? inquiry.messages[index - 1] : null;

              const showDateSep =
                !prevMsg ||
                new Date(msg.createdAt).toDateString() !==
                  new Date(prevMsg.createdAt).toDateString();

              const senderName = msg.users?.name ?? "?";
              const initials = senderName
                .split(" ")
                .map((n) => n[0] ?? "")
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const alignRight = isOwnMsg;

              return (
                <div key={msg.id}>
                  {showDateSep && (
                    <div className="flex items-center gap-3 py-4">
                      <Separator className="flex-1 bg-white/[0.06]" />
                      <span
                        className="text-[10px] font-medium text-slate-600 uppercase tracking-wider px-2 flex-shrink-0"
                        style={{
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleDateString("en-NG", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <Separator className="flex-1 bg-white/[0.06]" />
                    </div>
                  )}

                  <div
                    className={`flex gap-3 mb-3 ${alignRight ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 self-end ${
                        isAdminMsg
                          ? "bg-[#D4A853]/20 text-[#D4A853]"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      {initials}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] space-y-1 flex flex-col ${alignRight ? "items-end" : "items-start"}`}
                    >
                      {/* Sender + time */}
                      <div
                        className={`flex items-center gap-2 text-[11px] text-slate-500 ${alignRight ? "flex-row-reverse" : "flex-row"}`}
                        style={{
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        <span className="font-medium text-slate-400">
                          {isAdminMsg ? "TextileHub Admin" : "You"}
                        </span>
                        {isAdminMsg && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                            style={{
                              background: "rgba(212,168,83,0.12)",
                              color: "#D4A853",
                            }}
                          >
                            Admin
                          </span>
                        )}
                        <span className="text-slate-600">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>

                      {/* Message body */}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm ${
                          isAdminMsg
                            ? "rounded-tl-sm text-slate-200"
                            : "rounded-tr-sm text-slate-300"
                        }`}
                        style={{
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                          lineHeight: "1.75",
                          background: isAdminMsg
                            ? "rgba(212,168,83,0.08)"
                            : "rgba(255,255,255,0.05)",
                          border: isAdminMsg
                            ? "1px solid rgba(212,168,83,0.15)"
                            : "1px solid rgba(255,255,255,0.07)",
                          boxShadow: isAdminMsg
                            ? "0 2px 8px rgba(212,168,83,0.06)"
                            : "0 1px 4px rgba(0,0,0,0.15)",
                        }}
                      >
                        {msg.body}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer — wholesaler reply box */}
      <div className="flex-shrink-0 space-y-3">
        <Separator className="bg-white/[0.06]" />

        {/* Reply box — active when not closed */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--brand-glow)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <span
                className="text-[9px] font-bold"
                style={{
                  color: "var(--brand-bright)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {session?.user.name?.charAt(0).toUpperCase() ?? "W"}
              </span>
            </div>
            <span
              className="text-xs font-medium"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Reply to thread
            </span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span
              className="text-xs"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {inquiry.messages.length} message
              {inquiry.messages.length !== 1 ? "s" : ""}
            </span>
          </div>

          <WholesalerReplyBox inquiryId={inquiry.id} isClosed={isClosed} />

          {/* New inquiry link — always shown as secondary option */}
          {!isClosed && (
            <Link
              href={`/wholesale/products/${inquiry.products.id}`}
              className="inline-flex items-center gap-2 text-xs
                transition-[color] duration-150"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              <MessageSquarePlus size={12} />
              Or start a new inquiry for {inquiry.products.name}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
