// app/(admin)/admin/inquiries/[id]/page.tsx
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Package, User, Clock } from "lucide-react";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import InquiryReplyBox from "@/components/admin/InquiryReplyBox";
import InquiryStatusToggle from "@/components/admin/InquiryStatusToggle";
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
      ? `${inquiry.subject} — Admin | TextileHub`
      : "Inquiry Not Found",
  };
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminInquiryThreadPage({ params }: PageProps) {
  noStore();

  const session = await requireRole("ADMIN");
  const { id } = await params;

  const inquiry = await db.inquiries.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, imageUrl: true } },
      products: {
        select: {
          id: true,
          name: true,
          category: true,
          wholesalePricePerYard: true,
          totalYardsInStock: true,
        },
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

  const isClosed = inquiry.status === "CLOSED";

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-6 lg:p-8 space-y-4">
      {/* Back */}
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-2 text-sm group flex-shrink-0
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
        All Inquiries
      </Link>

      {/* Thread header */}
      <div
        className="flex items-start justify-between gap-4 p-5 rounded-2xl flex-shrink-0"
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
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                ...(STATUS_STYLES[inquiry.status] ?? STATUS_STYLES.CLOSED),
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {inquiry.status}
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Wholesaler */}
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              <User size={12} />
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {inquiry.users.name ?? inquiry.users.email}
              </span>
              <span
                className="hidden sm:block"
                style={{ color: "var(--text-faint)" }}
              >
                {inquiry.users.email}
              </span>
            </div>

            <span
              className="hidden sm:block h-3 w-px"
              style={{ background: "var(--border)" }}
            />

            {/* Product */}
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              <Package size={12} />
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {inquiry.products.name}
              </span>
              <span
                className="hidden sm:block"
                style={{ color: "var(--text-faint)" }}
              >
                — {inquiry.products.category}
              </span>
            </div>

            <span
              className="hidden sm:block h-3 w-px"
              style={{ background: "var(--border)" }}
            />

            <span
              className="hidden sm:flex items-center gap-1 text-xs"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              <Clock size={10} />
              {inquiry.messages.length} message
              {inquiry.messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Status toggle */}
        <InquiryStatusToggle
          inquiryId={inquiry.id}
          currentStatus={inquiry.status}
        />
      </div>

      {/* Messages thread */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-1 pb-4 pr-2">
          {inquiry.messages.map((msg, index) => {
            const isAdmin = msg.users?.role === "ADMIN";
            const prevMsg = index > 0 ? inquiry.messages[index - 1] : null;

            const showDateSep =
              !prevMsg ||
              new Date(msg.createdAt).toDateString() !==
                new Date(prevMsg.createdAt).toDateString();

            const senderName = msg.users?.name ?? "?";
            const senderImageUrl = msg.users?.imageUrl ?? "";
            const initials = senderName
              .split(" ")
              .map((n) => n[0] ?? "")
              .join("")
              .toUpperCase()
              .slice(0, 2);

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
                      className="text-[10px] font-medium uppercase tracking-wider px-2 flex-shrink-0"
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
                  className={`flex gap-3 mb-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0 self-end"
                    style={{
                      background: isAdmin
                        ? "var(--brand-glow)"
                        : "var(--bg-subtle)",
                      color: isAdmin ? "var(--brand-hex)" : "var(--text-muted)",
                      border: isAdmin
                        ? "1px solid var(--border-brand)"
                        : "1px solid var(--border)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {senderImageUrl ? (
                      <Image
                        src={senderImageUrl}
                        alt={senderName}
                        width={32}
                        height={32}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[72%] space-y-1 flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    {/* Sender + time */}
                    <div
                      className={`flex items-center gap-2 text-[11px] ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                      style={{
                        color: "var(--text-faint)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      <span
                        className="font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {msg.users?.name ?? "Unknown"}
                      </span>
                      {isAdmin && (
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
                      className={`px-4 py-3 rounded-2xl text-sm ${isAdmin ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                        lineHeight: "1.7",
                        background: isAdmin
                          ? "var(--brand-glow)"
                          : "var(--bg-subtle)",
                        border: isAdmin
                          ? "1px solid var(--border-brand)"
                          : "1px solid var(--border)",
                        boxShadow: isAdmin
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
          })}
        </div>
      </ScrollArea>

      {/* Reply box */}
      <div className="flex-shrink-0 space-y-3">
        <div className="h-px" style={{ background: "var(--border)" }} />

        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
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
              {(session?.user.name ?? "A").charAt(0).toUpperCase()}
            </span>
          </div>
          <span
            className="text-xs font-medium"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Reply as Admin
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
            {inquiry.messages.length !== 1 ? "s" : ""} in thread
          </span>
        </div>

        <InquiryReplyBox inquiryId={inquiry.id} isClosed={isClosed} />
      </div>
    </div>
  );
}
