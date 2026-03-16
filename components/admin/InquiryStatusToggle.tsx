// components/admin/InquiryStatusToggle.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, RotateCcw, Loader2 } from "lucide-react";

interface Props {
  inquiryId: string;
  currentStatus: string;
}

export default function InquiryStatusToggle({
  inquiryId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isClosed = currentStatus === "CLOSED";

  async function toggle() {
    setLoading(true);
    await fetch(`/api/inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isClosed ? "OPEN" : "CLOSED" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
        border transition-[background,border-color,color] duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        fontFamily: "var(--font-dm-sans, sans-serif)",
        // Reopen = confirmed/green, Close = faint/neutral → red on hover (handled via onMouseEnter)
        color: isClosed ? "var(--status-confirmed)" : "var(--text-faint)",
        background: isClosed ? "rgba(5,150,105,0.08)" : "var(--bg-subtle)",
        borderColor: isClosed ? "rgba(5,150,105,0.25)" : "var(--border)",
        outlineColor: isClosed ? "var(--status-confirmed)" : "var(--border)",
      }}
      onMouseEnter={(e) => {
        if (!isClosed) {
          const btn = e.currentTarget;
          btn.style.color = "var(--status-cancelled)";
          btn.style.background = "rgba(220,38,38,0.08)";
          btn.style.borderColor = "rgba(220,38,38,0.25)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isClosed) {
          const btn = e.currentTarget;
          btn.style.color = "var(--text-faint)";
          btn.style.background = "var(--bg-subtle)";
          btn.style.borderColor = "var(--border)";
        }
      }}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isClosed ? (
        <RotateCcw size={12} />
      ) : (
        <CheckCircle size={12} />
      )}
      {isClosed ? "Reopen" : "Close Inquiry"}
    </button>
  );
}
