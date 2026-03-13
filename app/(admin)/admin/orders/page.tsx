// app/(admin)/admin/orders/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight } from "lucide-react";
import AdminOrderStatusSelect from "@/components/admin/AdminOrderStatusSelect";

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

const STATUS_STYLES = {
  PENDING: {
    bg: "rgba(251,191,36,0.08)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.2)",
  },
  CONFIRMED: {
    bg: "rgba(5,150,105,0.08)",
    text: "#34d399",
    border: "rgba(52,211,153,0.2)",
  },
  SHIPPED: {
    bg: "rgba(96,165,250,0.08)",
    text: "#60a5fa",
    border: "rgba(96,165,250,0.2)",
  },
  DELIVERED: {
    bg: "rgba(74,222,128,0.08)",
    text: "#4ade80",
    border: "rgba(74,222,128,0.2)",
  },
  CANCELLED: {
    bg: "rgba(248,113,113,0.08)",
    text: "#f87171",
    border: "rgba(248,113,113,0.2)",
  },
} as const;

export default async function AdminOrdersPage() {
  noStore();
  await requireRole("ADMIN");

  const orders = await db.orders.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: { select: { name: true, category: true, imageUrl: true } },
      users: { select: { name: true, email: true } },
    },
  });

  const counts = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
  };

  return (
    <div className="px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className="text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Admin
          </p>
          <h1
            className="text-3xl font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Orders
          </h1>
        </div>
        <span
          className="text-sm font-semibold px-3 py-1.5 rounded-xl"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {orders.length} total
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(counts).map(([status, count]) => {
          const style = STATUS_STYLES[status as keyof typeof STATUS_STYLES];
          return (
            <div
              key={status}
              className="px-4 py-3 rounded-2xl"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{
                  color: style.text,
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {count}
              </p>
              <p
                className="text-xs font-medium"
                style={{
                  color: style.text,
                  opacity: 0.8,
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {status}
              </p>
            </div>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {orders.map((order) => {
          const style =
            STATUS_STYLES[order.status as keyof typeof STATUS_STYLES] ??
            STATUS_STYLES.PENDING;
          return (
            <div
              key={order.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Image */}
              <div
                className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: "var(--bg-subtle)" }}
              >
                {order.products.imageUrl ? (
                  <Image
                    src={order.products.imageUrl}
                    alt={order.products.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={16} style={{ color: "var(--text-faint)" }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p
                  className="text-sm font-semibold truncate"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {order.products.name}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {order.users.name ?? order.users.email} · {order.yardsOrdered}{" "}
                  yds · {formatPrice(order.totalAmountInCents)}
                </p>
                <p
                  className="text-[10px] font-mono"
                  style={{ color: "var(--text-faint)" }}
                >
                  {order.id}
                </p>
              </div>

              {/* Payment method badge */}
              <span
                className="text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 hidden sm:block"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {
                  {
                    PAYSTACK: "Paystack",
                    BANK_TRANSFER: "Bank",
                    CASH_ON_DELIVERY: "COD",
                  }[order.paymentMethod]
                }
              </span>

              {/* Status select — client component */}
              <AdminOrderStatusSelect
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
