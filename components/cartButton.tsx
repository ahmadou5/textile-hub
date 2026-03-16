"use client";

// components/CartButton.tsx
import { useCart } from "@/context/cartContext";
import { ShoppingBag } from "lucide-react";

export default function CartButton() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-[background] duration-150"
      style={{ color: "var(--text-muted)" }}
      aria-label="Open cart"
    >
      <ShoppingBag size={16} />
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
          style={{ background: "var(--brand-hex)" }}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
