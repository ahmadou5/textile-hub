// app/(admin)/admin/orders/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import { Package } from "lucide-react";
import AdminOrderStatusSelect from "@/components/admin/AdminOrderStatusSelect";

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

// All colours now use CSS variables — adapts to light and dark automatically
const STATUS_STYLES = {
  PENDING: {
    bg: "rgba(217,119,6,0.08)",
    text: "var(--status-pending)",
    border: "rgba(217,119,6,0.2)",
  },
  CONFIRMED: {
    bg: "rgba(5,150,105,0.08)",
    text: "var(--status-confirmed)",
    border: "rgba(5,150,105,0.2)",
  },
  SHIPPED: {
    bg: "rgba(37,99,235,0.08)",
    text: "var(--status-shipped)",
    border: "rgba(37,99,235,0.2)",
  },
  DELIVERED: {
    bg: "rgba(22,163,74,0.08)",
    text: "var(--status-delivered)",
    border: "rgba(22,163,74,0.2)",
  },
  CANCELLED: {
    bg: "rgba(220,38,38,0.08)",
    text: "var(--status-cancelled)",
    border: "rgba(220,38,38,0.2)",
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
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
          const s = STATUS_STYLES[status as keyof typeof STATUS_STYLES];
          return (
            <div
              key={status}
              className="px-4 py-3 rounded-2xl"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{
                  color: s.text,
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {count}
              </p>
              <p
                className="text-xs font-medium"
                style={{
                  color: s.text,
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
        {orders.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
            }}
          >
            <Package
              size={28}
              className="mb-4"
              style={{ color: "var(--text-faint)" }}
            />
            <p
              className="font-medium"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              No orders yet
            </p>
          </div>
        )}

        {orders.map((order) => {
          const s =
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
              {/* Product image */}
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

              {/* Status select */}
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
