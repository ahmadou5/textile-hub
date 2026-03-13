// components/theme/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  if (typeof window === "undefined") return <ThemeToggleSkeleton />;

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ] as const;

  return (
    <div className="space-y-2">
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        Appearance
      </p>

      <div
        className="inline-flex rounded-xl p-1 gap-1"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
        }}
      >
        {options.map(({ value, icon: Icon, label }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-[background,color,box-shadow] duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                fontFamily: "var(--font-dm-sans, sans-serif)",
                background: active ? "var(--brand-hex)" : "transparent",
                color: active ? "var(--text-inverse)" : "var(--text-muted)",
                boxShadow: active ? "var(--shadow-brand)" : "none",
                outlineColor: "var(--brand-hex)",
              }}
              aria-pressed={active}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeToggleSkeleton() {
  return (
    <div className="space-y-2">
      <div
        className="h-4 w-20 rounded animate-pulse"
        style={{ background: "var(--border)" }}
      />
      <div
        className="h-10 w-40 rounded-xl animate-pulse"
        style={{ background: "var(--border)" }}
      />
    </div>
  );
}
