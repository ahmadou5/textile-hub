"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowUpCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

interface ExistingRequest {
  id: string;
  status: string;
  message: string | null;
  createdAt: Date;
}

interface UpgradeRequestSectionProps {
  existingRequest: ExistingRequest | null;
}

const STATUS_INFO: Record<string, { icon: React.ReactNode; text: string; style: string }> = {
  PENDING: {
    icon: <Clock size={14} className="text-amber-500" />,
    text: "Your request is pending admin review.",
    style: "bg-amber-50 border-amber-200 text-amber-700",
  },
  APPROVED: {
    icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    text: "Your account has been upgraded to Wholesaler! Please sign out and back in.",
    style: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  REJECTED: {
    icon: <XCircle size={14} className="text-red-500" />,
    text: "Your upgrade request was rejected. Contact support for more info.",
    style: "bg-red-50 border-red-200 text-red-600",
  },
};

export default function UpgradeRequestSection({ existingRequest }: UpgradeRequestSectionProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/upgrade-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to submit request");
        return;
      }
      toast.success("Upgrade request submitted! Admin will review shortly.");
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Show status if request exists
  if (existingRequest || submitted) {
    const status = existingRequest?.status ?? "PENDING";
    const info = STATUS_INFO[status];
    return (
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${info.style}`}>
        <div className="flex-shrink-0 mt-0.5">{info.icon}</div>
        <div>
          <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}>
            Wholesale Upgrade Request
          </p>
          <p className="text-xs mt-0.5 opacity-80" style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}>
            {info.text}
          </p>
          {existingRequest?.createdAt && (
            <p className="text-xs mt-1 opacity-60" style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}>
              Submitted {new Date(existingRequest.createdAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show request form
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center flex-shrink-0">
          <ArrowUpCircle size={18} className="text-[#D4A853]" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-800"
            style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Upgrade to Wholesale Account
          </h3>
          <p className="text-xs text-slate-500 mt-0.5"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}>
            Get access to wholesale pricing, new arrivals feed, and direct admin messaging.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}>
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your business…"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-800 resize-none
              bg-white border border-slate-200 placeholder:text-slate-400
              focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]/20
              transition-[border-color,box-shadow] duration-200"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          />
          <p className="text-xs text-slate-400 text-right mt-1">{message.length}/500</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:-translate-y-0.5 active:translate-y-0
            transition-[transform] duration-150"
          style={{
            background: "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
            boxShadow: "0 2px 8px rgba(212,168,83,0.25)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Submitting…</>
          ) : (
            <><ArrowUpCircle size={14} /> Request Upgrade</>
          )}
        </button>
      </form>
    </div>
  );
}