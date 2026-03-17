// app/(wholesale)/wholesale/orders/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Truck,
  Copy,
  ShieldCheck,
} from "lucide-react";
import CopyButton from "@/components/orders/CopyButton";

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
    text: "#34d399",
    border: "rgba(52,211,153,0.25)",
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

const PAYMENT_ICONS = {
  PAYSTACK: CreditCard,
  BANK_TRANSFER: Building2,
  CASH_ON_DELIVERY: Truck,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WholesaleOrderDetailPage({ params }: PageProps) {
  noStore();
  const session = await requireRole(["WHOLESALER", "ADMIN"] as never);
  const { id } = await params;

  const [order, bankDetails] = await Promise.all([
    db.orders.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            category: true,
            imageUrl: true,
            wholesalePricePerYard: true,
          },
        },
        users: { select: { id: true } },
      },
    }),
    db.admin_bank_details.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!order) notFound();
  if (order.users.id !== session?.user.id && session?.user.role !== "ADMIN") {
    redirect("/wholesale/orders");
  }

  const statusStyle =
    STATUS_STYLES[order.status as keyof typeof STATUS_STYLES] ??
    STATUS_STYLES.PENDING;
  const PaymentIcon =
    PAYMENT_ICONS[order.paymentMethod as keyof typeof PAYMENT_ICONS] ??
    CreditCard;

  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";
  const isPending = order.status === "PENDING";
  const showBankCard = isBankTransfer && isPending && bankDetails;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/wholesale/orders"
        className="inline-flex items-center gap-2 text-sm group transition-[color] duration-150"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <ArrowLeft
          size={13}
          className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
        />
        My Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p
            className="text-[10px] font-semibold tracking-wider uppercase"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Order Details
          </p>
          <h1
            className="text-2xl font-bold break-all"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
              letterSpacing: "-0.02em",
            }}
          >
            {order.id}
          </h1>
          <p
            className="text-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{
            background: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {order.status}
        </span>
      </div>

      {/* Product card */}
      <div
        className="flex gap-4 p-4 rounded-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
          style={{ background: "var(--bg-subtle)" }}
        >
          {order.products.imageUrl ? (
            <Image
              src={order.products.imageUrl}
              alt={order.products.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">
              🧵
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p
            className="font-semibold"
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
            {order.products.category}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span
              className="text-sm"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {order.yardsOrdered} yd{order.yardsOrdered !== 1 ? "s" : ""} ×{" "}
              {formatPrice(order.products.wholesalePricePerYard)}
            </span>
          </div>
          <p
            className="text-xl font-bold pt-1"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-syne, sans-serif)",
            }}
          >
            {formatPrice(order.totalAmountInCents)}
          </p>
        </div>
      </div>

      {/* Payment method */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--brand-glow)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <PaymentIcon size={15} style={{ color: "var(--brand-bright)" }} />
        </div>
        <div>
          <p
            className="text-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Payment Method
          </p>
          <p
            className="text-sm font-semibold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {
              {
                PAYSTACK: "Card / Paystack",
                BANK_TRANSFER: "Bank Transfer",
                CASH_ON_DELIVERY: "Cash on Delivery",
              }[order.paymentMethod]
            }
          </p>
        </div>
        {order.paymentRef && (
          <div className="ml-auto text-right">
            <p
              className="text-xs"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Ref
            </p>
            <p
              className="text-xs font-mono font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {order.paymentRef}
            </p>
          </div>
        )}
      </div>

      {/* ── Bank Transfer card — shown while pending ── */}
      {showBankCard && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              background: "var(--brand-glow)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <ShieldCheck size={14} style={{ color: "var(--brand-bright)" }} />
            <p
              className="text-xs font-bold"
              style={{
                color: "var(--brand-bright)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Complete your payment — Transfer to this account
            </p>
          </div>

          <div
            className="p-5 space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            {[
              { label: "Bank", value: bankDetails!.bankName, key: "bank" },
              {
                label: "Account Name",
                value: bankDetails!.accountName,
                key: "name",
              },
              {
                label: "Account Number",
                value: bankDetails!.accountNumber,
                key: "acct",
              },
            ].map(({ label, value, key }) => (
              <div key={key} className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {label}
                </span>
                <CopyButton value={value} copyKey={key} />
              </div>
            ))}

            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <span
                className="text-sm"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Amount
              </span>
              <span
                className="text-xl font-bold"
                style={{
                  color: "var(--brand-hex)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {formatPrice(order.totalAmountInCents)}
              </span>
            </div>

            {/* Order ID as transfer reference */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Transfer Description / Narration
              </p>
              <p
                className="text-xs"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Use this as your transfer description so we can identify your
                payment:
              </p>
              <CopyButton value={order.id} copyKey="orderid" prominent />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Notes
          </p>
          <p
            className="text-sm"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
}
