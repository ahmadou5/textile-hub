// components/checkout/OrderButton.tsx
// Thin client wrapper — holds yards state, opens CheckoutModal
// Kept separate so the product detail page stays a server component
"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import CheckoutModal from "@/components/checkout/CheckoutModal";

interface Product {
  id: string;
  name: string;
  category: string;
  wholesalePricePerYard: number;
  totalYardsInStock: number;
}

export default function OrderButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  // Default yards to 1; CheckoutModal can expose a yards selector internally
  // or you can wire YardageCalculator's value here via lifted state
  const [yards] = useState(1);

  if (product.totalYardsInStock === 0) {
    return (
      <div
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-not-allowed"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          color: "var(--text-faint)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <ShoppingBag size={15} />
        Out of Stock
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white
          hover:-translate-y-0.5 active:translate-y-0
          transition-[transform] duration-150"
        style={{
          background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
          boxShadow: "var(--shadow-brand)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <ShoppingBag size={15} />
        Place Order
      </button>

      {open && (
        <CheckoutModal
          product={product}
          yardsOrdered={yards}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
