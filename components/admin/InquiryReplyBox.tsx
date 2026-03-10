// components/admin/InquiryReplyBox.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
interface InquiryReplyBoxProps {
  inquiryId: string;
  isClosed: boolean;
}

export default function InquiryReplyBox({
  inquiryId,
  isClosed,
}: InquiryReplyBoxProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/inquiries/${inquiryId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to send reply");
      return;
    }

    setSuccess(true);
    setMessage("");
    toast.success("Reply sent.", {
      description: "Status updated to Replied.",
      icon: "💬",
    });
    setTimeout(() => {
      setSuccess(false);
      router.refresh();
    }, 800);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isClosed) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Lock size={15} className="text-slate-600 flex-shrink-0" />
        <p
          className="text-sm text-slate-600"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          This inquiry is closed. Reopen it to send more messages.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        placeholder="Type your reply… (Ctrl+Enter to send)"
        disabled={loading}
        className="
          w-full px-5 py-4 text-sm text-white resize-none
          bg-white/[0.03] border-0 outline-none
          placeholder:text-slate-600
          disabled:opacity-50
        "
        style={{
          fontFamily: "var(--font-dm-sans, sans-serif)",
          lineHeight: "1.7",
        }}
      />

      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-center gap-3">
          {error && (
            <p
              className="text-xs text-red-400"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {error}
            </p>
          )}
          {success && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 size={12} />
              Sent!
            </span>
          )}
          {!error && !success && (
            <p
              className="text-xs text-slate-600"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              {message.length > 0
                ? `${message.length} chars`
                : "Ctrl+Enter to send"}
            </p>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="
            flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
            bg-[#D4A853] text-slate-900
            shadow-[0_2px_8px_rgba(212,168,83,0.25)]
            hover:brightness-105 hover:-translate-y-0.5
            active:translate-y-0 active:brightness-95
            transition-[filter,transform,box-shadow] duration-150
            disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]
          "
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send size={13} /> Send Reply
            </>
          )}
        </button>
      </div>
    </div>
  );
}
