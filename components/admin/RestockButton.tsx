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
        border border-[#D4A853]/30 text-[#D4A853] bg-[#D4A853]/5
        hover:bg-[#D4A853]/12 hover:border-[#D4A853]/50 hover:-translate-y-0.5
        active:translate-y-0 active:brightness-95
        transition-[background,border-color,transform] duration-150
        focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D4A853]"
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      <Truck size={11} />
      Restock
    </button>
  );
}
