"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["OPEN", "REPLIED", "CLOSED"] as const;
type InquiryStatus = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<InquiryStatus, string> = {
  OPEN: "bg-amber-50 text-amber-600 border-amber-200",
  REPLIED: "bg-sky-50 text-sky-600 border-sky-200",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
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
          className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold border
            cursor-pointer disabled:opacity-60
            focus:outline-none focus:ring-2 focus:ring-[#D4A853]/20
            transition-[background,border-color] duration-150
            ${STATUS_STYLES[status]}`}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2
              size={11}
              className="animate-spin text-current opacity-60"
            />
          ) : (
            <ChevronDown size={11} className="opacity-60" />
          )}
        </div>
      </div>
    </div>
  );
}
