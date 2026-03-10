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
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
        border transition-[background,border-color,color] duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-1
        ${
          isClosed
            ? "border-emerald-500/25 text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/15 focus-visible:outline-emerald-500"
            : "border-slate-600/50 text-slate-400 bg-white/[0.03] hover:border-red-500/25 hover:text-red-400 hover:bg-red-500/8 focus-visible:outline-slate-500"
        }
      `}
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
