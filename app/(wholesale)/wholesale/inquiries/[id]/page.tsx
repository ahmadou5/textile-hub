// app/(wholesale)/wholesale/inquiries/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
} from "lucide-react";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import ThreadRefreshButton from "@/components/ThreadRefreshButton";
import WholesalerReplyBox from "@/components/wholesale/WholeSalerReplyBox";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

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
          users: {
            select: { id: true, name: true, role: true, imageUrl: true },
          },
        },
      },
    },
  });

  if (!inquiry) notFound();

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
    <div className="flex flex-col h-screen max-h-screen max-w-7xl w-[99%] ml-auto mr-auto overflow-hidden p-6 lg:p-8 space-y-4">
      {/* Back + Refresh */}
      <div className="flex items-center justify-between shrink-0">
        <Link
          href="/wholesale/inquiries"
          className="inline-flex items-center gap-2 text-sm group
            transition-[color] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            color: "var(--text-muted)",
            outlineColor: "var(--brand-hex)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
          />
          My Inquiries
        </Link>
        <ThreadRefreshButton />
      </div>

      {/* Thread header */}
      <div
        className="flex items-start justify-between gap-4 p-5 rounded-2xl shrink-0"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-brand)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-xl font-bold leading-snug"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.02em",
              }}
            >
              {inquiry.subject}
            </h1>
            {/* Status badge */}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{
                ...(STATUS_STYLES[inquiry.status] ?? STATUS_STYLES.CLOSED),
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {inquiry.status}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              <Package size={11} />
              <span
                style={{ color: "var(--text-secondary)" }}
                className="font-medium"
              >
                {inquiry.products.name}
              </span>
              <span
                style={{ color: "var(--text-faint)" }}
                className="hidden sm:block"
              >
                — {inquiry.products.category}
              </span>
            </div>

            <span
              className="hidden sm:block"
              style={{ color: "var(--border)", fontSize: "10px" }}
            >
              |
            </span>

            <span
              className=" items-center gap-1 text-xs lg:hidden flex"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              <Clock size={10} />
              {inquiry.createdAt.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span
              className="hidden sm:block"
              style={{ color: "var(--border)", fontSize: "10px" }}
            >
              |
            </span>

            <span
              className="text-xs hidden sm:block"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
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
          className="flex items-center gap-3 px-4 py-3 rounded-2xl shrink-0"
          style={{
            background: "rgba(5,150,105,0.08)",
            border: "1px solid rgba(5,150,105,0.2)",
          }}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "var(--status-confirmed)" }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ background: "var(--status-confirmed)" }}
            />
          </span>
          <CheckCircle2
            size={14}
            style={{ color: "var(--status-confirmed)" }}
            className="shrink-0"
          />
          <p
            className="text-sm font-semibold"
            style={{
              color: "var(--status-confirmed)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Admin has responded — {adminReplies.length}{" "}
            {adminReplies.length !== 1 ? "replies" : "reply"} in this thread
          </p>
        </div>
      )}

      {/* Messages thread */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-1 pb-4 pr-2">
          {inquiry.messages.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p
                className="text-sm"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
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
              const senderImageUrl = msg.users?.imageUrl ?? "";
              window.alert(senderImageUrl);
              const initials = senderName
                .split(" ")
                .map((n) => n[0] ?? "")
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const alignRight = isOwnMsg;

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDateSep && (
                    <div className="flex items-center gap-3 py-4">
                      <div
                        className="flex-1 h-px"
                        style={{ background: "var(--border)" }}
                      />
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider px-2 shrink-0"
                        style={{
                          color: "var(--text-faint)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleDateString("en-NG", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{ background: "var(--border)" }}
                      />
                    </div>
                  )}

                  <div
                    className={`flex gap-3 mb-3 ${alignRight ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 self-end"
                      style={{
                        background: isAdminMsg
                          ? "var(--brand-glow)"
                          : "rgba(5,150,105,0.1)",
                        color: isAdminMsg
                          ? "var(--brand-hex)"
                          : "var(--status-confirmed)",
                        border: isAdminMsg
                          ? "1px solid var(--border-brand)"
                          : "1px solid rgba(5,150,105,0.2)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {senderImageUrl ? (
                        <Image
                          src={senderImageUrl}
                          alt={senderName}
                          width={32}
                          height={32}
                          className="rounded-xl h-full w-full  object-cover"
                        />
                      ) : (
                        <p>{initials}</p>
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] space-y-1 flex flex-col ${alignRight ? "items-end" : "items-start"}`}
                    >
                      {/* Sender + time */}
                      <div
                        className={`flex items-center gap-2 text-[11px] ${alignRight ? "flex-row-reverse" : "flex-row"}`}
                        style={{
                          color: "var(--text-faint)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {isAdminMsg ? "TextileHub Admin" : "You"}
                        </span>
                        {isAdminMsg && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                            style={{
                              background: "var(--brand-glow)",
                              color: "var(--brand-hex)",
                              border: "1px solid var(--border-brand)",
                            }}
                          >
                            Admin
                          </span>
                        )}
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>

                      {/* Message body */}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm ${isAdminMsg ? "rounded-tl-sm" : "rounded-tr-sm"}`}
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                          lineHeight: "1.75",
                          background: isAdminMsg
                            ? "var(--brand-glow)"
                            : "var(--bg-subtle)",
                          border: isAdminMsg
                            ? "1px solid var(--border-brand)"
                            : "1px solid var(--border)",
                          boxShadow: isAdminMsg
                            ? "var(--shadow-brand)"
                            : "var(--shadow-card)",
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

      {/* Footer reply area */}
      <div className="shrink-0 space-y-3">
        <div className="h-px" style={{ background: "var(--border)" }} />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "var(--brand-glow)",
                border: "1px solid var(--border-brand)",
              }}
            >
              <span
                className="text-[9px] font-bold"
                style={{
                  color: "var(--brand-hex)",
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

          {!isClosed && (
            <Link
              href={`/wholesale/products/${inquiry.products.id}`}
              className="inline-flex items-center gap-2 text-xs transition-[color] duration-150"
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
