// components/orders/CopyButton.tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  value: string;
  copyKey: string;
  prominent?: boolean;
}

export default function CopyButton({
  value,
  copyKey,
  prominent = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (prominent) {
    return (
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl font-bold text-sm
          transition-[background] duration-150"
        style={{
          background: copied ? "var(--brand-glow)" : "var(--bg-card)",
          border: "1px solid var(--border-strong)",
          color: "var(--brand-bright)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <span className="flex-1 text-left break-all">{value}</span>
        {copied ? (
          <Check size={14} />
        ) : (
          <Copy size={14} style={{ color: "var(--text-faint)" }} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-bold
        transition-[background] duration-150"
      style={{
        color: "var(--brand-bright)",
        background: copied ? "var(--brand-glow)" : "transparent",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      {value}
      {copied ? (
        <Check size={12} />
      ) : (
        <Copy size={12} style={{ color: "var(--text-faint)" }} />
      )}
    </button>
  );
}
