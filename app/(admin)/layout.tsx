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
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Navbar />
      {/*
           - Remove items-center justify-center — those were centering the login/register
             cards but break full-width pages like profile
           - Let each child page handle its own width/centering
           - Keep px-4 so content never touches screen edges on mobile
         */}
      <main className="flex-1 w-full px-4 py-10">{children}</main>
    </div>
  );
}
