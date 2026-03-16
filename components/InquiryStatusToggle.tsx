"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["OPEN", "REPLIED", "CLOSED"] as const;
type InquiryStatus = (typeof STATUS_OPTIONS)[number];

// Uses CSS variables so both light and dark mode work automatically
const STATUS_STYLES: Record<InquiryStatus, React.CSSProperties> = {
  OPEN: {
    background: "rgba(217,119,6,0.08)",
    color: "var(--status-pending)",
    borderColor: "rgba(217,119,6,0.2)",
  },
  REPLIED: {
    background: "rgba(37,99,235,0.08)",
    color: "var(--status-shipped)",
    borderColor: "rgba(37,99,235,0.2)",
  },
  CLOSED: {
    background: "var(--bg-subtle)",
    color: "var(--text-faint)",
    borderColor: "var(--border)",
  },
};

interface InquiryStatusToggleProps {
  inquiryId: string;
  currentStatus: string;
}

export default function InquiryStatusToggle({
  inquiryId,
  currentStatus,
}: InquiryStatusToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<InquiryStatus>(
    currentStatus as InquiryStatus,
  );

  async function handleChange(newStatus: InquiryStatus) {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update status");
        return;
      }

      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex-shrink-0">
      <div className="relative">
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as InquiryStatus)}
          disabled={loading}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold border
            cursor-pointer disabled:opacity-60
            focus:outline-none
            transition-[background,border-color] duration-150"
          style={{
            ...STATUS_STYLES[status],
            fontFamily: "var(--font-dm-sans, sans-serif)",
            boxShadow: `0 0 0 0px var(--brand-glow)`,
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        >
          {STATUS_OPTIONS.map((s) => (
            <option
              key={s}
              value={s}
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
            >
              {s}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 size={11} className="animate-spin opacity-60" />
          ) : (
            <ChevronDown size={11} className="opacity-60" />
          )}
        </div>
      </div>
    </div>
  );
}
