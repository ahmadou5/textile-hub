// app/(public)/layout.tsx
import Link from "next/link";
import { Scissors } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

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
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
