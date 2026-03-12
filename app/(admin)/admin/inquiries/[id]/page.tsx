// app/(admin)/admin/inquiries/[id]/page.tsx
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, User, Clock } from "lucide-react";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import InquiryReplyBox from "@/components/admin/InquiryReplyBox";
import InquiryStatusToggle from "@/components/admin/InquiryStatusToggle";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STYLES = {
  OPEN: "bg-amber-500/10 text-amber-600 border-amber-500/25",
  REPLIED: "bg-sky-500/10 text-sky-600 border-sky-500/25",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
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
  // ✅ always fresh — no stale cache
  noStore();

  const session = await requireRole("ADMIN");
  const { id } = await params;

  const inquiry = await db.inquiries.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true } },
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
          users: { select: { id: true, name: true, role: true } },
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
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800
          transition-[color] duration-150 group flex-shrink-0"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
        />
        All Inquiries
      </Link>

      {/* Thread header */}
      <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-xl font-bold text-slate-800 leading-snug"
              style={{ fontFamily: "var(--font-playfair, serif)" }}
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

          <div className="flex items-center gap-4 flex-wrap">
            {/* Wholesaler */}
            <div
              className="flex items-center gap-1.5 text-xs text-slate-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              <User size={12} />
              <span className="font-medium text-slate-700">
                {inquiry.users.name ?? inquiry.users.email}
              </span>
              <span className="text-slate-400 hidden sm:block">
                {inquiry.users.email}
              </span>
            </div>

            <Separator orientation="vertical" className="h-3 hidden sm:block" />

            {/* Product */}
            <div
              className="flex items-center gap-1.5 text-xs text-slate-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              <Package size={12} />
              <span className="font-medium text-slate-600">
                {inquiry.products.name}
              </span>
              <span className="text-slate-400 hidden sm:block">
                — {inquiry.products.category}
              </span>
            </div>

            <Separator orientation="vertical" className="h-3 hidden sm:block" />

            <span
              className="flex items-center gap-1 text-xs text-slate-400 hidden sm:flex"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
            const initials = senderName
              .split(" ")
              .map((n) => n[0] ?? "")
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="flex items-center gap-3 py-4">
                    <Separator className="flex-1 bg-slate-100" />
                    <span
                      className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2 flex-shrink-0"
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      {new Date(msg.createdAt).toLocaleDateString("en-NG", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <Separator className="flex-1 bg-slate-100" />
                  </div>
                )}

                <div
                  className={`flex gap-3 mb-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 self-end ${
                      isAdmin
                        ? "bg-[#D4A853]/15 text-[#D4A853]"
                        : "bg-slate-100 text-slate-600"
                    }`}
                    style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                  >
                    {initials}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[72%] space-y-1 flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`flex items-center gap-2 text-[11px] text-slate-400 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      <span className="font-medium text-slate-500">
                        {msg.users?.name ?? "Unknown"}
                      </span>
                      {isAdmin && (
                        <span className="text-[#D4A853] font-semibold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#D4A853]/10">
                          Admin
                        </span>
                      )}
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>

                    <div
                      className={`px-4 py-3 rounded-2xl text-sm ${
                        isAdmin
                          ? "bg-[#D4A853]/10 text-slate-800 border border-[#D4A853]/15 rounded-tr-sm"
                          : "bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                      }`}
                      style={{
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                        lineHeight: "1.7",
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
        <Separator className="bg-slate-100" />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-[#D4A853]/15 flex items-center justify-center">
            <span
              className="text-[9px] font-bold text-[#D4A853]"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {(session?.user.name ?? "A").charAt(0).toUpperCase()}
            </span>
          </div>
          <span
            className="text-xs font-medium text-slate-500"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Reply as Admin
          </span>
          <span className="text-slate-300 text-xs">·</span>
          <span
            className="text-xs text-slate-400"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
