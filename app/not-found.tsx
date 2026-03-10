// app/not-found.tsx
import Link from "next/link";
import { Home, Layers } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 40%, rgba(201,145,58,0.08) 0%, transparent 60%)," +
          "radial-gradient(ellipse at 75% 65%, rgba(28,20,16,0.4) 0%, transparent 55%)," +
          "#FAF7F2",
      }}
    >
      {/* SVG grain */}
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <filter id="nf-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: "fixed",
          inset: 0,
          filter: "url(#nf-grain)",
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Woven grid decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #C9913A 0px, #C9913A 1px, transparent 1px, transparent 40px)," +
            "repeating-linear-gradient(90deg, #C9913A 0px, #C9913A 1px, transparent 1px, transparent 40px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-6">
        {/* Brand mark */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
          style={{
            background: "linear-gradient(135deg, #C9913A 0%, #D4A853 100%)",
            boxShadow:
              "0 4px_16px rgba(201,145,58,0.25), 0 8px_32px rgba(201,145,58,0.12)",
          }}
        >
          <Layers size={24} className="text-white" />
        </div>

        {/* 404 display */}
        <div className="space-y-1">
          <p
            className="text-[120px] font-bold leading-none"
            style={{
              fontFamily: "var(--font-cormorant, serif)",
              letterSpacing: "-0.04em",
              color: "transparent",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              backgroundImage:
                "linear-gradient(135deg, #C9913A 0%, #D4A853 50%, #b8762a 100%)",
            }}
          >
            404
          </p>
        </div>

        <div className="space-y-2">
          <h1
            className="text-2xl font-bold text-[#1C1410]"
            style={{
              fontFamily: "var(--font-cormorant, serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Thread not found
          </h1>
          <p
            className="text-[#5C4A3A] text-base leading-relaxed"
            style={{
              fontFamily: "var(--font-dm-sans, sans-serif)",
              lineHeight: "1.7",
            }}
          >
            This page seems to have unraveled. The fabric you&apos;re looking
            for doesn&apos;t exist — it may have been moved or removed.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl
              font-semibold text-sm text-white
              shadow-[0_2px_12px_rgba(201,145,58,0.35),0_1px_3px_rgba(0,0,0,0.15)]
              hover:brightness-105 hover:-translate-y-0.5
              active:translate-y-0 active:brightness-95
              transition-[filter,transform,box-shadow] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
            style={{
              fontFamily: "var(--font-dm-sans, sans-serif)",
              background: "linear-gradient(135deg, #C9913A 0%, #D4A853 100%)",
            }}
          >
            <Home size={15} />
            Go Home
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl
              font-semibold text-sm text-[#5C4A3A]
              border border-[#C9913A]/25 bg-[#C9913A]/6
              hover:bg-[#C9913A]/12 hover:border-[#C9913A]/40 hover:text-[#1C1410]
              active:scale-[0.98]
              transition-[background,border-color,color,transform] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Browse Fabrics
          </Link>
        </div>
      </div>
    </div>
  );
}
