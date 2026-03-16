"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Loader2, Lock } from "lucide-react";

interface InquiryReplyBoxProps {
  inquiryId: string;
  isClosed: boolean;
}

export default function InquiryReplyBox({
  inquiryId,
  isClosed,
}: InquiryReplyBoxProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send reply");
        return;
      }

      toast.success("Reply sent!");
      setBody("");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isClosed) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
        }}
      >
        <Lock
          size={13}
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
          This inquiry is closed and cannot receive new replies.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply to the wholesaler…"
          rows={3}
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none
            disabled:opacity-60
            transition-[border-color,box-shadow] duration-200"
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
        <span
          className="absolute bottom-3 right-3 text-[11px]"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {body.length}/2000
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p
          className="text-xs"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Replying marks inquiry as{" "}
          <span
            className="font-semibold"
            style={{ color: "var(--status-shipped)" }}
          >
            REPLIED
          </span>
        </p>
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:-translate-y-0.5 active:translate-y-0
            transition-[transform] duration-150"
          style={{
            background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            boxShadow: "var(--shadow-brand)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send size={14} /> Send Reply
            </>
          )}
        </button>
      </div>
    </form>
  );
}
