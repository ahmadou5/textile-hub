// app/(admin)/admin/layout.tsx
import { requireRole } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  AlertTriangle,
  LayoutDashboard,
  MessageSquare,
  Package,
} from "lucide-react";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role check — redirects if not ADMIN
  const session = await requireRole("ADMIN");
  const count = await db.inquiries.count({ where: { status: "OPEN" } });
  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      exact: false,
    },
    {
      label: "Inquiries",
      href: "/admin/inquiries",
      icon: MessageSquare,
      badge: count.toString(),
      exact: false,
    },
    {
      label: "Low Stock Alerts",
      href: "/admin/low-stock",
      icon: AlertTriangle,
      exact: false,
    },
  ];
  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      <AdminSidebar
        adminName={session?.user.name ?? "Admin"}
        navbarItems={navItems}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#F7F4EF]">
        {children}
      </main>
    </div>
  );
}
