"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function UpgradeRequestActions({
  requestId,
}: {
  requestId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVE" | "REJECT" | null>(null);

  async function handleAction(action: "APPROVE" | "REJECT") {
    setLoading(action);
    try {
      const res = await fetch(`/api/upgrade-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Action failed");
        return;
      }
      toast.success(data.message);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* Approve */}
      <button
        onClick={() => handleAction("APPROVE")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-[background,border-color] duration-150"
        style={{
          color: "var(--status-confirmed)",
          border: "1px solid rgba(5,150,105,0.25)",
          background: "rgba(5,150,105,0.08)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(5,150,105,0.14)";
          e.currentTarget.style.borderColor = "rgba(5,150,105,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(5,150,105,0.08)";
          e.currentTarget.style.borderColor = "rgba(5,150,105,0.25)";
        }}
      >
        {loading === "APPROVE" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <CheckCircle size={12} />
        )}
        Approve
      </button>

      {/* Reject */}
      <button
        onClick={() => handleAction("REJECT")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-[background,border-color] duration-150"
        style={{
          color: "var(--status-cancelled)",
          border: "1px solid rgba(220,38,38,0.25)",
          background: "rgba(220,38,38,0.06)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(220,38,38,0.12)";
          e.currentTarget.style.borderColor = "rgba(220,38,38,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(220,38,38,0.06)";
          e.currentTarget.style.borderColor = "rgba(220,38,38,0.25)";
        }}
      >
        {loading === "REJECT" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <XCircle size={12} />
        )}
        Reject
      </button>
    </div>
  );
}
