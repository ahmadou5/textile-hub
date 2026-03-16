// components/admin/RestockButton.tsx
"use client";

import { toast } from "sonner";
import { Truck } from "lucide-react";

interface RestockButtonProps {
  productName: string;
}

export default function RestockButton({ productName }: RestockButtonProps) {
  return (
    <button
      onClick={() =>
        toast("Contact your supplier", {
          description: `Initiate a restock order for "${productName}".`,
          icon: "🚚",
          action: {
            label: "Dismiss",
            onClick: () => {},
          },
        })
      }
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
        hover:-translate-y-0.5 active:translate-y-0 active:brightness-95
        transition-[background,border-color,transform] duration-150
        focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        border: "1px solid var(--border-brand)",
        color: "var(--brand-hex)",
        background: "var(--brand-glow)",
        outlineColor: "var(--brand-hex)",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--border-brand)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--brand-glow)";
        e.currentTarget.style.borderColor = "var(--border-brand)";
      }}
    >
      <Truck size={11} />
      Restock
    </button>
  );
}
