// components/admin/AdminOrderStatusSelect.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronDown } from "lucide-react";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
type OrderStatus = (typeof STATUSES)[number];

// Maps each status to its --status-* CSS variable and a translucent bg/border
const STATUS_STYLES: Record<OrderStatus, React.CSSProperties> = {
  PENDING: {
    color: "var(--status-pending)",
    background: "rgba(217,119,6,0.08)",
    borderColor: "rgba(217,119,6,0.25)",
  },
  CONFIRMED: {
    color: "var(--status-confirmed)",
    background: "rgba(5,150,105,0.08)",
    borderColor: "rgba(5,150,105,0.25)",
  },
  SHIPPED: {
    color: "var(--status-shipped)",
    background: "rgba(37,99,235,0.08)",
    borderColor: "rgba(37,99,235,0.25)",
  },
  DELIVERED: {
    color: "var(--status-delivered)",
    background: "rgba(22,163,74,0.08)",
    borderColor: "rgba(22,163,74,0.25)",
  },
  CANCELLED: {
    color: "var(--status-cancelled)",
    background: "rgba(220,38,38,0.08)",
    borderColor: "rgba(220,38,38,0.25)",
  },
};

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function AdminOrderStatusSelect({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(
    currentStatus as OrderStatus,
  );
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: OrderStatus) {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update");
        return;
      }
      setStatus(newStatus);
      toast.success(`Order ${newStatus.toLowerCase()}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;

  return (
    <div className="relative flex-shrink-0">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        disabled={loading}
        className="appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-bold
          cursor-pointer disabled:opacity-60 outline-none
          transition-[background,border-color,box-shadow] duration-150"
        style={{
          ...style,
          border: `1px solid ${style.borderColor}`,
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
        onFocus={(e) =>
          (e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)")
        }
        onBlur={(e) => (e.target.style.boxShadow = "none")}
      >
        {STATUSES.map((s) => (
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
          <Loader2
            size={10}
            className="animate-spin"
            style={{ color: style.color }}
          />
        ) : (
          <ChevronDown size={10} style={{ color: style.color, opacity: 0.7 }} />
        )}
      </div>
    </div>
  );
}
