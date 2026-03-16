"use client";

// components/CartDrawer.tsx
import { useCart } from "@/context/cartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  LogIn,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef } from "react";

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQty,
    clearCart,
    totalPrice,
    isOpen,
    closeCart,
  } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeCart();
      }
    }
    if (isOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen, closeCart]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleCheckout() {
    if (!session?.user) {
      closeCart();
      router.push("/login?from=cart");
    } else {
      closeCart();
      router.push("/wholesale/orders/new");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm flex flex-col
          transition-transform duration-300 ease-out"
        style={{
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-brand)",
          boxShadow: "var(--shadow-lg)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} style={{ color: "var(--brand-hex)" }} />
            <h2
              className="text-sm font-bold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              Your Cart
            </h2>
            {items.length > 0 && (
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--brand-hex)" }}
              >
                {items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] px-2 py-1 rounded-lg transition-colors duration-150"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-subtle)",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-16">
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
                  className="text-sm font-medium"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-syne, sans-serif)",
                  }}
                >
                  Your cart is empty
                </p>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Browse fabrics and add them here.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="text-xs font-medium px-4 py-2 rounded-xl transition-colors duration-150"
                style={{
                  color: "var(--brand-hex)",
                  border: "1px solid var(--border-brand)",
                  background: "var(--brand-glow)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Continue browsing
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-2xl"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Thumbnail */}
                <div
                  className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: "var(--bg-card)" }}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl opacity-20">
                      🧵
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-syne, sans-serif)",
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--brand-hex)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {formatPrice(item.retailPricePerYard)} / yd
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-1 rounded-lg overflow-hidden"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center transition-colors duration-150"
                        style={{
                          color: "var(--text-muted)",
                          background: "var(--bg-card)",
                        }}
                      >
                        <Minus size={10} />
                      </button>
                      <span
                        className="px-2 text-xs font-bold min-w-[28px] text-center"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center transition-colors duration-150"
                        style={{
                          color: "var(--text-muted)",
                          background: "var(--bg-card)",
                        }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-dm-sans, sans-serif)",
                        }}
                      >
                        {formatPrice(item.retailPricePerYard * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors duration-150"
                        style={{ color: "var(--text-faint)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color =
                            "var(--status-cancelled)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--text-faint)")
                        }
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="flex-shrink-0 px-5 py-4 space-y-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {/* Total */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} yds)
              </span>
              <span
                className="text-base font-bold"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Guest notice */}
            {!session?.user && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: "var(--brand-glow)",
                  border: "1px solid var(--border-brand)",
                  color: "var(--brand-hex)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                <LogIn size={12} />
                You&apos;ll need to sign in to complete your order.
              </div>
            )}

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white
                hover:-translate-y-0.5 active:translate-y-0 transition-[transform] duration-150"
              style={{
                background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
                boxShadow: "var(--shadow-brand)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {session?.user ? (
                <>
                  <ArrowRight size={14} /> Place Order
                </>
              ) : (
                <>
                  <LogIn size={14} /> Sign in to Order
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
