// app/(admin)/admin/layout.tsx
import { requireRole } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role check — redirects if not ADMIN
  const session = await requireRole("ADMIN");

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      <AdminSidebar adminName={session?.user.name ?? "Admin"} />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#F7F4EF]">
        {children}
      </main>
    </div>
  );
}
