// components/checkout/CheckoutModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  CreditCard,
  Building2,
  Truck,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

type PaymentMethod = "PAYSTACK" | "BANK_TRANSFER" | "CASH_ON_DELIVERY";

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  wholesalePricePerYard: number;
  totalYardsInStock: number;
}

interface CheckoutModalProps {
  product: Product;
  yardsOrdered: number;
  onClose: () => void;
}

export default function CheckoutModal({
  product,
  yardsOrdered,
  onClose,
}: CheckoutModalProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ id: string } | null>(null);

  const total = product.wholesalePricePerYard * yardsOrdered;

  // Fetch bank details for transfer card
  useEffect(() => {
    fetch("/api/admin/bank-details")
      .then((r) => r.json())
      .then((d) => setBankDetails(d.details ?? null))
      .catch(() => {});
  }, []);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Submit order ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          yardsOrdered,
          paymentMethod: method,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to place order");
        return;
      }

      setCreatedOrder(data.order);

      // If Paystack — open their popup
      if (method === "PAYSTACK") {
        initPaystack(data.order.id, total);
        return;
      }

      toast.success("Order placed successfully!");
      router.push(`/wholesale/orders/${data.order.id}`);
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ── Paystack inline popup ─────────────────────────────────────────────────
  function initPaystack(orderId: string, amountInCents: number) {
    // Paystack expects amount in kobo (same as cents for NGN)
    const handler = (
      window as unknown as {
        PaystackPop: {
          setup: (config: unknown) => { openIframe: () => void };
        };
      }
    ).PaystackPop?.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: "", // server already has user email — passed via metadata server-side ideally
      amount: amountInCents,
      currency: "NGN",
      ref: orderId, // ✅ order ID = Paystack reference = transfer description
      metadata: { orderId, product: product.name, yards: yardsOrdered },
      onSuccess: (transaction: { reference: string }) => {
        toast.success(`Payment confirmed! Ref: ${transaction.reference}`);
        router.push(`/wholesale/orders/${orderId}`);
        onClose();
      },
      onCancel: () => {
        toast.error("Payment cancelled. Your order is still pending.");
        router.push(`/wholesale/orders/${orderId}`);
        onClose();
      },
    });
    handler?.openIframe();
  }

  const METHODS = [
    {
      id: "BANK_TRANSFER" as const,
      icon: Building2,
      label: "Bank Transfer",
      desc: "Transfer directly to our account",
    },
    {
      id: "PAYSTACK" as const,
      icon: CreditCard,
      label: "Card / Paystack",
      desc: "Pay with debit card, USSD or bank",
    },
    {
      id: "CASH_ON_DELIVERY" as const,
      icon: Truck,
      label: "Cash on Delivery",
      desc: "Pay when goods arrive",
    },
  ];

  return (
    <>
      {/* Paystack inline script */}
      <script src="https://js.paystack.co/v1/inline.js" async />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div>
              <h2
                className="text-lg font-bold"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-syne, sans-serif)",
                  letterSpacing: "-0.02em",
                }}
              >
                Confirm Order
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {yardsOrdered} yd{yardsOrdered !== 1 ? "s" : ""} ·{" "}
                {product.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-[background] duration-150"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text-muted)",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Order summary */}
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex justify-between text-sm"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                <span style={{ color: "var(--text-muted)" }}>Product</span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {product.name}
                </span>
              </div>
              <div
                className="flex justify-between text-sm"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Yards ordered
                </span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {yardsOrdered}
                </span>
              </div>
              <div
                className="flex justify-between text-sm"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Price per yard
                </span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatPrice(product.wholesalePricePerYard)}
                </span>
              </div>
              <div
                className="flex justify-between pt-2 mt-2"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Total
                </span>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: "var(--brand-hex)",
                    fontFamily: "var(--font-syne, sans-serif)",
                  }}
                >
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="space-y-2">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Payment Method
              </p>

              <div className="space-y-2">
                {METHODS.map(({ id, icon: Icon, label, desc }) => {
                  const active = method === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMethod(id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                        transition-[background,border-color,box-shadow] duration-150"
                      style={{
                        background: active
                          ? "var(--brand-glow)"
                          : "var(--bg-subtle)",
                        border: `1px solid ${active ? "var(--brand-hex)" : "var(--border)"}`,
                        boxShadow: active ? "var(--shadow-brand)" : "none",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: active
                            ? "var(--brand-hex)"
                            : "var(--bg-card)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <Icon
                          size={15}
                          style={{
                            color: active ? "white" : "var(--text-muted)",
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: active
                              ? "var(--brand-bright)"
                              : "var(--text-primary)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          {desc}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        style={{
                          color: active
                            ? "var(--brand-bright)"
                            : "var(--text-faint)",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Bank Transfer Details Card ── */}
            {method === "BANK_TRANSFER" && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-subtle)",
                }}
              >
                {/* Card header */}
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{
                    background: "var(--brand-glow)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <ShieldCheck
                    size={14}
                    style={{ color: "var(--brand-bright)" }}
                  />
                  <p
                    className="text-xs font-bold"
                    style={{
                      color: "var(--brand-bright)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    Transfer to this account
                  </p>
                </div>

                {bankDetails ? (
                  <div className="p-4 space-y-3">
                    {/* Bank name */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        Bank
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {bankDetails.bankName}
                      </span>
                    </div>

                    {/* Account number with copy */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        Account Number
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(bankDetails.accountNumber, "acct")
                        }
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-bold
                          transition-[background] duration-150"
                        style={{
                          color: "var(--brand-bright)",
                          background:
                            copied === "acct"
                              ? "var(--brand-glow)"
                              : "transparent",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {bankDetails.accountNumber}
                        {copied === "acct" ? (
                          <Check size={12} />
                        ) : (
                          <Copy
                            size={12}
                            style={{ color: "var(--text-faint)" }}
                          />
                        )}
                      </button>
                    </div>

                    {/* Account name */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        Account Name
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {bankDetails.accountName}
                      </span>
                    </div>

                    {/* Amount */}
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border-subtle)" }}
                    >
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        Amount to Transfer
                      </span>
                      <span
                        className="text-base font-bold"
                        style={{
                          color: "var(--brand-hex)",
                          fontFamily: "var(--font-syne, sans-serif)",
                        }}
                      >
                        {formatPrice(total)}
                      </span>
                    </div>

                    {/* Transfer reference note — shown AFTER order is created */}
                    <div
                      className="rounded-xl p-3 space-y-1"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
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
                        Use your <strong>Order ID</strong> as the transfer
                        description so we can match your payment:
                      </p>
                      {createdOrder ? (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(createdOrder.id, "ref")
                          }
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-bold
                            transition-[background] duration-150"
                          style={{
                            background: "var(--brand-glow)",
                            border: "1px solid var(--border-strong)",
                            color: "var(--brand-bright)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          <span className="flex-1 text-left break-all">
                            {createdOrder.id}
                          </span>
                          {copied === "ref" ? (
                            <Check size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      ) : (
                        <p
                          className="text-xs italic"
                          style={{
                            color: "var(--text-faint)",
                            fontFamily: "var(--font-dm-sans, sans-serif)",
                          }}
                        >
                          Your Order ID will appear here after placing the
                          order.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-2">
                    <AlertCircle
                      size={14}
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-dm-sans, sans-serif)",
                      }}
                    >
                      Bank details not configured yet. Contact admin.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* COD note */}
            {method === "CASH_ON_DELIVERY" && (
              <div
                className="rounded-xl px-4 py-3 flex items-start gap-2"
                style={{
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.2)",
                }}
              >
                <Truck
                  size={14}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: "#fbbf24" }}
                />
                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Your order will be marked <strong>Pending</strong> until
                  delivery is confirmed by our team. Payment is collected at
                  delivery.
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions, special requests…"
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none
                  focus:outline-none transition-[border-color,box-shadow] duration-200"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold
                transition-[background,border-color] duration-150"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:-translate-y-0.5 active:translate-y-0
                transition-[transform] duration-150"
              style={{
                background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
                boxShadow: "var(--shadow-brand)",
                color: "white",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Placing…
                </>
              ) : method === "PAYSTACK" ? (
                <>
                  <CreditCard size={14} /> Pay {formatPrice(total)}
                </>
              ) : (
                <>Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
