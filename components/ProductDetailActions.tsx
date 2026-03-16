"use client";

// components/ProductDetailActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import { ShoppingBag, MessageSquare, Plus, Minus, LogIn } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    pricePerYard: number;
  };
  isLoggedIn: boolean;
  role?: string;
}

export default function ProductDetailActions({
  product,
  isLoggedIn,
  role,
}: Props) {
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const [yards, setYards] = useState(1);

  function decrement() {
    setYards((v) => Math.max(1, v - 1));
  }

  function increment() {
    setYards((v) => v + 1);
  }

  function handleAddToCart() {
    addItem(
      {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        retailPricePerYard: product.pricePerYard,
      },
      yards,
    );
    toast.success(`${yards} yd${yards > 1 ? "s" : ""} added to cart`, {
      description: product.name,
      icon: "🛍️",
    });
  }

  function handleInquiry() {
    if (!isLoggedIn) {
      router.push(`/login?from=/products/${product.id}`);
      return;
    }
    router.push(`/wholesale/inquiries/new?product=${product.id}`);
  }

  const totalPrice = product.pricePerYard * yards;

  function formatPrice(cents: number) {
    return `₦${(cents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="space-y-2">
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Quantity (yards)
        </label>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            <button
              onClick={decrement}
              disabled={yards <= 1}
              className="w-10 h-10 flex items-center justify-center transition-[background] duration-150 disabled:opacity-40"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text-muted)",
              }}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              min={1}
              value={yards}
              onChange={(e) =>
                setYards(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-14 text-center text-sm font-bold outline-none"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
                border: "none",
                height: "40px",
              }}
            />
            <button
              onClick={increment}
              className="w-10 h-10 flex items-center justify-center transition-[background] duration-150"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text-muted)",
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Running total */}
          <div>
            <p
              className="text-lg font-bold"
              style={{
                color: "var(--brand-hex)",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              {formatPrice(totalPrice)}
            </p>
            <p
              className="text-[11px]"
              style={{
                color: "var(--text-faint)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              total for {yards} yd{yards > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        {/* Add to Cart — available to everyone */}
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white
            hover:-translate-y-0.5 active:translate-y-0
            transition-[transform] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            boxShadow: "var(--shadow-brand)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
            outlineColor: "var(--brand-hex)",
          }}
        >
          <ShoppingBag size={15} />
          Add to Cart
        </button>

        {/* Inquiry / Order button */}
        {isLoggedIn ? (
          <button
            onClick={handleInquiry}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold
              hover:-translate-y-0.5 active:translate-y-0
              transition-[transform,border-color] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              color: "var(--brand-hex)",
              border: "1px solid var(--border-brand)",
              background: "var(--brand-glow)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
              outlineColor: "var(--brand-hex)",
            }}
          >
            <MessageSquare size={15} />
            Place Inquiry
          </button>
        ) : (
          <Link
            href={`/login?from=/products/${product.id}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold
              hover:-translate-y-0.5 active:translate-y-0
              transition-[transform] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              background: "var(--bg-subtle)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
              outlineColor: "var(--brand-hex)",
            }}
          >
            <LogIn size={15} />
            Sign in to Order
          </Link>
        )}
      </div>

      {/* Guest cart notice */}
      {!isLoggedIn && (
        <p
          className="text-xs"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Items are saved to your cart — you&apos;ll sign in at checkout.
        </p>
      )}
    </div>
  );
}
