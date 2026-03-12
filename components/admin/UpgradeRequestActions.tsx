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
      <button
        onClick={() => handleAction("APPROVE")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
          text-emerald-600 border border-emerald-500/25 bg-emerald-500/8
          hover:bg-emerald-500/15 hover:border-emerald-500/35
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-[background,border-color] duration-150"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        {loading === "APPROVE" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <CheckCircle size={12} />
        )}
        Approve
      </button>
      <button
        onClick={() => handleAction("REJECT")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
          text-red-500 border border-red-500/25 bg-red-500/[0.06]
          hover:bg-red-500/12 hover:border-red-500/35
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-[background,border-color] duration-150"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
