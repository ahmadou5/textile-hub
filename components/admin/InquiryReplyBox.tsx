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
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
        }}
      >
        <Lock
          size={15}
          className="flex-shrink-0"
          style={{ color: "var(--text-faint)" }}
        />
        <p
          className="text-sm"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          This inquiry is closed. Reopen it to send more messages.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border-brand)" }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        placeholder="Type your reply… (Ctrl+Enter to send)"
        disabled={loading}
        className="w-full px-5 py-4 text-sm resize-none outline-none disabled:opacity-50"
        style={{
          background: "var(--bg-subtle)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
          lineHeight: "1.7",
          border: 0,
        }}
      />

      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div className="flex items-center gap-3">
          {error && (
            <p
              className="text-xs"
              style={{
                color: "var(--status-cancelled)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {error}
            </p>
          )}
          {success && (
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--status-confirmed)" }}
            >
              <CheckCircle2 size={12} />
              Sent!
            </span>
          )}
          {!error && !success && (
            <p
              className="text-xs"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
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
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white
            hover:brightness-105 hover:-translate-y-0.5
            active:translate-y-0 active:brightness-95
            transition-[filter,transform] duration-150
            disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0
            focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            boxShadow: "var(--shadow-brand)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
            outlineColor: "var(--brand-hex)",
          }}
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
