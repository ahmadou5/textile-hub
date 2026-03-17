// app/(wholesale)/wholesale/orders/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

const STATUS_STYLES = {
  PENDING: {
    bg: "rgba(251,191,36,0.1)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.25)",
  },
  CONFIRMED: {
    bg: "rgba(5,150,105,0.1)",
    text: "var(--brand-bright)",
    border: "var(--border-strong)",
  },
  SHIPPED: {
    bg: "rgba(96,165,250,0.1)",
    text: "#60a5fa",
    border: "rgba(96,165,250,0.25)",
  },
  DELIVERED: {
    bg: "rgba(74,222,128,0.1)",
    text: "#4ade80",
    border: "rgba(74,222,128,0.25)",
  },
  CANCELLED: {
    bg: "rgba(248,113,113,0.1)",
    text: "#f87171",
    border: "rgba(248,113,113,0.25)",
  },
} as const;

const PAYMENT_LABELS = {
  PAYSTACK: "Card / Paystack",
  BANK_TRANSFER: "Bank Transfer",
  CASH_ON_DELIVERY: "Cash on Delivery",
} as const;

export default async function WholesaleOrdersPage() {
  noStore();
  const session = await requireRole(["WHOLESALER", "ADMIN"] as never);

  const orders = await db.orders.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      products: {
        select: { id: true, name: true, category: true, imageUrl: true },
      },
    },
  });

  return (
    <div className=" w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p
          className="text-[10px] font-semibold tracking-[0.15em] uppercase"
          style={{
            color: "var(--brand-hex)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          My Account
        </p>
        <h1
          className="text-3xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.02em",
          }}
        >
          My Orders
        </h1>
        <p
          className="text-sm"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center gap-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
            }}
          >
            <ShoppingBag size={22} style={{ color: "var(--text-faint)" }} />
          </div>
          <div>
            <p
              className="font-semibold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              No orders yet
            </p>
            <p
              className="text-sm mt-1"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Browse the catalogue and place your first order.
            </p>
          </div>
          <Link
            href="/wholesale/products"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
              hover:-translate-y-0.5 transition-[transform] duration-150"
            style={{
              background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
              boxShadow: "var(--shadow-brand)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const style =
              STATUS_STYLES[order.status as keyof typeof STATUS_STYLES] ??
              STATUS_STYLES.PENDING;
            return (
              <Link
                key={order.id}
                href={`/wholesale/orders/${order.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl group
                  hover:-translate-y-0.5
                  transition-[transform,box-shadow,border-color] duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                  outlineColor: "var(--brand-hex)",
                }}
              >
                {/* Product image */}
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: "var(--bg-subtle)" }}
                >
                  {order.products.imageUrl ? (
                    <Image
                      src={order.products.imageUrl}
                      alt={order.products.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package
                        size={18}
                        style={{ color: "var(--text-faint)" }}
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold leading-snug truncate"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {order.products.name}
                    </p>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                      style={{
                        background: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-xs"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {order.yardsOrdered} yd
                      {order.yardsOrdered !== 1 ? "s" : ""}
                    </span>
                    <span style={{ color: "var(--border)" }}>·</span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: "var(--brand-hex)",
                        fontFamily: "var(--font-syne, sans-serif)",
                      }}
                    >
                      {formatPrice(order.totalAmountInCents)}
                    </span>
                    <span style={{ color: "var(--border)" }}>·</span>
                    <span
                      className="text-xs"
                      style={{
                        color: "var(--text-faint)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      {
                        PAYMENT_LABELS[
                          order.paymentMethod as keyof typeof PAYMENT_LABELS
                        ]
                      }
                    </span>
                  </div>

                  <p
                    className="text-[11px]"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {order.id} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="flex-shrink-0 group-hover:translate-x-0.5 transition-[transform] duration-150"
                  style={{ color: "var(--text-faint)" }}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
