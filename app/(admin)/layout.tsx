// app/(admin)/admin/layout.tsx
import { requireRole } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Navbar from "@/components/layout/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen  "
      style={{
        fontFamily: "var(--font-dm-sans, sans-serif)",
        backgroundColor: "var(--bg)",
      }}
    >
      <Navbar />

      {/* Main content */}
      <main
        className="flex-1 max-w-5xl mx-auto flex flex-col min-h-screen "
        style={{ backgroundColor: "var(--bg)" }}
      >
        {children}
      </main>
    </div>
  );
}
