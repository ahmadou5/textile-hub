// app/(public)/layout.tsx
import Link from "next/link";
import { Scissors } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 0% 0%, rgba(201,145,58,0.06) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(201,145,58,0.04) 0%, transparent 50%), #FAF7F2",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      {/* Grain overlay */}
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <filter id="grain">
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
          filter: "url(#grain)",
          opacity: 0.025,
          pointerEvents: "none",
          zIndex: 999,
        }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#EDE8DF] bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1C1410] flex items-center justify-center group-hover:bg-[#C9913A] transition-[background] duration-200">
              <Scissors size={15} className="text-[#FAF7F2] rotate-45" />
            </div>
            <span
              className="text-[#1C1410] font-semibold text-lg"
              style={{ fontFamily: "var(--font-cormorant, serif)" }}
            >
              TextileHub
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-[#1C1410]/60 hover:text-[#1C1410] transition-[color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
            >
              Catalogue
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-xl bg-[#1C1410] text-[#FAF7F2]
                hover:bg-[#C9913A] active:scale-[0.97]
                transition-[background,transform] duration-150
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
            >
              Wholesale Login
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
