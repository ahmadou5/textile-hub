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
      className="min-h-screen max-w-5xl mx-auto "
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      <Navbar />

      {/* Main content */}
      <main
        className="flex-1 flex flex-col min-h-screen "
        style={{ backgroundColor: "var(--bg)" }}
      >
        {children}
      </main>
    </div>
  );
}
