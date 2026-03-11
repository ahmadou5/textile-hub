"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="group p-4 rounded-2xl border hover:-translate-y-0.5 transition-[transform,border-color,box-shadow] duration-200"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}30`;
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
        <ArrowUpRight
          size={13}
          className="text-slate-600 group-hover:text-slate-400 transition-[color] duration-150"
        />
      </div>
      <p
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-syne, sans-serif)" }}
      >
        {value}
      </p>
      <p
        className="text-xs text-slate-500 mt-0.5"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        {label}
      </p>
      <p
        className="text-[11px] mt-0.5"
        style={{ color, fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        {sub}
      </p>
    </Link>
  );
}
