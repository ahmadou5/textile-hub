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
  Lock,
  MessageSquarePlus,
  Clock,
} from "lucide-react";
import type { Metadata } from "next";

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
  const inquiry = await db.inquiry.findUnique({
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
  const session = await requireRole(["WHOLESALER", "ADMIN"] as never);
  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      wholesaler: { select: { id: true } },
      product: {
        select: { id: true, name: true, category: true, imageUrl: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  if (!inquiry) notFound();

  // Wholesalers can only see their own inquiries
  if (
    session.user.role === "WHOLESALER" &&
    inquiry.wholesaler.id !== session.user.id
  ) {
    redirect("/wholesale/inquiries");
  }

  const isReplied = inquiry.status === "REPLIED";
  const isClosed = inquiry.status === "CLOSED";

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-6 lg:p-8 space-y-4">
      {/* Back */}
      <Link
        href="/wholesale/inquiries"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200
          transition-[color] duration-150 group flex-shrink-0
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
        />
        My Inquiries
      </Link>

      {/* Thread header */}
      <div
        className="flex items-start justify-between gap-4 p-5 rounded-2xl flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px_8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-xl font-bold text-white leading-snug"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
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

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 text-xs text-slate-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              <Package size={11} />
              <span className="text-slate-400 font-medium">
                {inquiry.product.name}
              </span>
              <span className="text-slate-600 hidden sm:block">
                — {inquiry.product.category}
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
          </div>
        </div>
      </div>

      {/* Admin replied banner */}
      {isReplied && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-shrink-0"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            boxShadow: "0 0 20px rgba(16,185,129,0.05)",
          }}
        >
          {/* Pulse dot */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <p
            className="text-sm font-semibold text-emerald-300"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Admin has responded to your inquiry
          </p>
        </div>
      )}

      {/* Messages thread */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-1 pb-4 pr-2">
          {inquiry.messages.map((msg: unknown, index: number) => {
            const isAdminMsg =
              (msg as { sender: { role: string } }).sender.role === "ADMIN";
            const isOwnMsg =
              (msg as { sender: { id: string } }).sender.id === session.user.id;
            const prevMsg = index > 0 ? inquiry.messages[index - 1] : null;
            const showDateSep =
              !prevMsg ||
              new Date(
                (msg as { createdAt: Date }).createdAt,
              ).toDateString() !==
                new Date(
                  (prevMsg as { createdAt: Date }).createdAt,
                ).toDateString();

            const initials =
              (msg as { sender: { name: string } }).sender.name ??
              "?"
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

            // Own messages (wholesaler) on right, admin on left
            const alignRight = isOwnMsg;

            return (
              <div key={(msg as { id: string }).id}>
                {showDateSep && (
                  <div className="flex items-center gap-3 py-4">
                    <Separator className="flex-1 bg-white/[0.06]" />
                    <span
                      className="text-[10px] font-medium text-slate-600 uppercase tracking-wider px-2 flex-shrink-0"
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      {new Date(
                        (msg as { createdAt: Date }).createdAt,
                      ).toLocaleDateString("en-NG", {
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
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
                        {formatDate((msg as { createdAt: Date }).createdAt)}
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
                      {(msg as { body: string }).body}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Read-only footer */}
      <div className="flex-shrink-0 space-y-3">
        <Separator className="bg-white/[0.06]" />

        <div
          className="flex items-start gap-4 px-5 py-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Lock size={13} className="text-slate-500" />
          </div>
          <div className="flex-1 space-y-2">
            <p
              className="text-sm font-medium text-slate-400"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {isClosed
                ? "This inquiry is closed."
                : "Replies are read-only in v1."}{" "}
              To follow up, please submit a new inquiry.
            </p>
            <Link
              href={`/wholesale/products/${inquiry.product.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                text-emerald-400 border border-emerald-500/20 bg-emerald-500/8
                hover:bg-emerald-500/15 hover:border-emerald-500/30
                transition-[background,border-color] duration-150
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              <MessageSquarePlus size={13} />
              Start New Inquiry for {inquiry.product.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
