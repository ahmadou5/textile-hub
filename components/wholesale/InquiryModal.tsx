// components/wholesale/InquiryModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Loader2, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
interface InquiryModalProps {
  productId: string;
  productName: string;
}

export default function InquiryModal({
  productId,
  productName,
}: InquiryModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`Inquiry: ${productName}`);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!message.trim() || message.trim().length < 10) {
      setError("Please write a message of at least 10 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, subject, message }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to send inquiry. Please try again.");
      return;
    }

    setSuccess(true);
    toast.success("Inquiry submitted!", {
      description: "Admin will respond within 24 hours.",
      icon: "✉️",
    });
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
      setMessage("");
      setSubject(`Inquiry: ${productName}`);
      router.push("/wholesale/inquiries");
    }, 1800);
  }

  function handleOpenChange(val: boolean) {
    if (!loading) {
      setOpen(val);
      if (!val) {
        setError(null);
        setSuccess(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="
            w-full flex items-center justify-center gap-2.5
            py-3.5 px-6 rounded-2xl font-semibold text-sm
            bg-emerald-500 text-white
            shadow-[0_2px_12px_rgba(16,185,129,0.35),0_1px_3px_rgba(0,0,0,0.2)]
            hover:bg-emerald-400 hover:-translate-y-0.5
            hover:shadow-[0_4px_20px_rgba(16,185,129,0.45),0_2px_6px_rgba(0,0,0,0.2)]
            active:translate-y-0 active:brightness-95
            transition-[background,transform,box-shadow] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400
          "
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <MessageSquare size={16} />
          Message Admin About This Product
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-lg rounded-2xl border-0 p-0 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #161B25 0%, #0D1117 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1)",
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <MessageSquare size={16} className="text-emerald-400" />
            </div>
            <div>
              <DialogTitle
                className="text-white font-bold text-base leading-snug"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}
              >
                Message Admin
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-0.5">
                Your inquiry will be reviewed within 24 hours
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Subject */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-xl text-sm text-white font-medium
                bg-white/[0.04] border border-white/[0.08]
                focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06]
                transition-[border-color,background] duration-200
                placeholder:text-slate-600
              "
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            />
          </div>

          {/* Product tag */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.12)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-slate-400">Product:</span>
            <span className="text-emerald-400 font-medium truncate">
              {productName}
            </span>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="e.g. I'd like to order 200 yards. Can you confirm availability and discuss pricing for this quantity?"
              className="
                w-full px-4 py-3 rounded-xl text-sm text-white resize-none
                bg-white/[0.04] border border-white/[0.08]
                focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06]
                transition-[border-color,background] duration-200
                placeholder:text-slate-600
              "
              style={{
                fontFamily: "var(--font-dm-sans, sans-serif)",
                lineHeight: "1.7",
              }}
            />
            <p className="text-[11px] text-slate-600 text-right">
              {message.length} chars{" "}
              {message.length < 10 && message.length > 0 && (
                <span className="text-amber-500">· min 10</span>
              )}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <CheckCircle2
                size={14}
                className="text-emerald-400 flex-shrink-0"
              />
              <p className="text-emerald-400 font-medium">
                Inquiry sent! Redirecting to your inquiries…
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => handleOpenChange(false)}
            disabled={loading || success}
            className="
              flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400
              border border-white/[0.08] bg-white/[0.03]
              hover:text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.12]
              active:scale-[0.98]
              transition-[color,background,border-color,transform] duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-500
            "
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="
              flex-[2] flex items-center justify-center gap-2
              py-2.5 rounded-xl text-sm font-semibold text-white
              bg-emerald-500
              shadow-[0_2px_8px_rgba(16,185,129,0.3)]
              hover:bg-emerald-400 hover:-translate-y-0.5
              active:translate-y-0 active:brightness-95
              transition-[background,transform,box-shadow] duration-150
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-400
            "
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending…
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={14} />
                Sent!
              </>
            ) : (
              <>
                <Send size={14} />
                Send Inquiry
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
