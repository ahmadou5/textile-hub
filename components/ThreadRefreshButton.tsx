"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function ThreadRefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
        text-slate-500 border border-white/[0.07] bg-white/[0.03]
        hover:text-white hover:border-white/[0.15] hover:bg-white/[0.06]
        transition-[color,border-color,background] duration-150
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      <RefreshCw size={12} className={spinning ? "animate-spin" : ""} />
      Refresh
    </button>
  );
}
