// components/wholesale/WholesalerReplyBox.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Loader2, Lock } from "lucide-react";

interface WholesalerReplyBoxProps {
  inquiryId: string;
  isClosed: boolean;
}

export default function WholesalerReplyBox({
  inquiryId,
  isClosed,
}: WholesalerReplyBoxProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send message");
        return;
      }

      toast.success("Message sent!");
      setBody("");
      router.refresh(); // re-fetches server component — shows new message instantly
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
          style={{ color: "var(--text-faint)" }}
          className="flex-shrink-0"
        />
        <p
          className="text-sm"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          This inquiry is closed and cannot receive new messages.
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
          placeholder="Write a follow-up message to admin…"
          rows={3}
          disabled={loading}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl text-sm text-black/70 resize-none
            focus:outline-none transition-[border-color,box-shadow] duration-200
            disabled:opacity-60"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
            lineHeight: "1.7",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--brand-hex)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--brand-glow)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
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
          Your reply sets the inquiry back to{" "}
          <span className="font-semibold" style={{ color: "#fbbf24" }}>
            OPEN
          </span>{" "}
          so admin sees it
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
              <Send size={14} /> Send
            </>
          )}
        </button>
      </div>
    </form>
  );
}
