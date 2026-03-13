// app/(wholesale)/wholesale/layout.tsx
import { requireRole } from "@/lib/auth";
import WholesaleSidebar from "@/components/wholesale/WholeSaleSidebar";
import { Role } from "@prisma/client";
import Navbar from "@/components/layout/Navbar";

export default async function WholesaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["WHOLESALER", "ADMIN"] as unknown as Role);

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      <Navbar />
      <main
        className="flex-1 min-h-screen"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(16,185,129,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.03) 0%, transparent 50%), #0D1117",
        }}
      >
        {children}
      </main>
    </div>
  );
}
