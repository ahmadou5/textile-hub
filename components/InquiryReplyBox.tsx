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
      router.refresh(); // ✅ re-fetches server component — shows new message instantly
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isClosed) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{
          background: "rgba(0,0,0,0.02)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <Lock size={13} className="text-slate-400 flex-shrink-0" />
        <p
          className="text-sm text-slate-400"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
          className="w-full px-4 py-3 rounded-xl text-sm text-black/70 resize-none
            bg-white border border-slate-200 placeholder:text-slate-400
            focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]/20
            disabled:opacity-60
            transition-[border-color,box-shadow] duration-200"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
        <span
          className="absolute bottom-3 right-3 text-[11px] text-slate-400"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {body.length}/2000
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p
          className="text-xs text-slate-400"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Replying marks inquiry as{" "}
          <span className="font-semibold text-sky-500">REPLIED</span>
        </p>
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:-translate-y-0.5 active:translate-y-0
            transition-[transform,background] duration-150"
          style={{
            background: "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
            boxShadow: "0 2px 8px rgba(212,168,83,0.25)",
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
