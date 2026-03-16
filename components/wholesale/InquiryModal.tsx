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
          className="w-full flex items-center justify-center gap-2.5
            py-3.5 px-6 rounded-2xl font-semibold text-sm text-white
            hover:-translate-y-0.5 active:translate-y-0 active:brightness-95
            transition-[background,transform,box-shadow] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            boxShadow: "var(--shadow-brand)",
            outlineColor: "var(--brand-hex)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          <MessageSquare size={16} />
          Message Admin About This Product
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-lg rounded-2xl border-0 p-0 overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-brand)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <DialogHeader
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--brand-glow)",
                border: "1px solid var(--border-brand)",
              }}
            >
              <MessageSquare size={16} style={{ color: "var(--brand-hex)" }} />
            </div>
            <div>
              <DialogTitle
                className="font-bold text-base leading-snug"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                Message Admin
              </DialogTitle>
              <DialogDescription
                className="text-xs mt-0.5"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
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
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none
                transition-[border-color,background,box-shadow] duration-200"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--brand-hex)";
                e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Product tag */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "var(--brand-glow)",
              border: "1px solid var(--border-brand)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "var(--brand-hex)" }}
            />
            <span
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Product:
            </span>
            <span
              className="font-medium truncate"
              style={{
                color: "var(--brand-hex)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {productName}
            </span>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="e.g. I'd like to order 200 yards. Can you confirm availability and discuss pricing for this quantity?"
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none
                transition-[border-color,background,box-shadow] duration-200"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
                lineHeight: "1.7",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--brand-hex)";
                e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
            <p
              className="text-[11px] text-right"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {message.length} chars{" "}
              {message.length < 10 && message.length > 0 && (
                <span style={{ color: "var(--status-pending)" }}>· min 10</span>
              )}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--status-cancelled)" }}
              />
              <p
                style={{
                  color: "var(--status-cancelled)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background: "rgba(5,150,105,0.08)",
                border: "1px solid rgba(5,150,105,0.2)",
              }}
            >
              <CheckCircle2
                size={14}
                className="flex-shrink-0"
                style={{ color: "var(--status-confirmed)" }}
              />
              <p
                className="font-medium"
                style={{
                  color: "var(--status-confirmed)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Inquiry sent! Redirecting to your inquiries…
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {/* Cancel */}
          <button
            onClick={() => handleOpenChange(false)}
            disabled={loading || success}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium
              active:scale-[0.98]
              transition-[color,background,border-color,transform] duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
              focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              background: "var(--bg-subtle)",
              outlineColor: "var(--border)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "var(--bg-subtle)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            Cancel
          </button>

          {/* Send */}
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="flex-[2] flex items-center justify-center gap-2
              py-2.5 rounded-xl text-sm font-semibold text-white
              hover:-translate-y-0.5 active:translate-y-0 active:brightness-95
              transition-[background,transform,box-shadow] duration-150
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
              focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
              boxShadow: "var(--shadow-brand)",
              outlineColor: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Sending…
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={14} /> Sent!
              </>
            ) : (
              <>
                <Send size={14} /> Send Inquiry
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
