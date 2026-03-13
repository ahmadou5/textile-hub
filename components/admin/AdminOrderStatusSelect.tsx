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

const STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; color: string; border: string }
> = {
  PENDING: {
    bg: "rgba(251,191,36,0.1)",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
  },
  CONFIRMED: {
    bg: "rgba(5,150,105,0.1)",
    color: "#34d399",
    border: "rgba(52,211,153,0.3)",
  },
  SHIPPED: {
    bg: "rgba(96,165,250,0.1)",
    color: "#60a5fa",
    border: "rgba(96,165,250,0.3)",
  },
  DELIVERED: {
    bg: "rgba(74,222,128,0.1)",
    color: "#4ade80",
    border: "rgba(74,222,128,0.3)",
  },
  CANCELLED: {
    bg: "rgba(248,113,113,0.1)",
    color: "#f87171",
    border: "rgba(248,113,113,0.3)",
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
          cursor-pointer disabled:opacity-60 focus:outline-none
          transition-[background,border-color] duration-150"
        style={{
          background: style.bg,
          border: `1px solid ${style.border}`,
          color: style.color,
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
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
