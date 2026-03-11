// components/admin/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Package,
  MessageSquare,
  AlertTriangle,
  LogOut,
  Menu,
  LayoutDashboard,
  Scissors,
} from "lucide-react";
import { db } from "@/lib/db";
const openInquiries = db.inquiries.count({ where: { status: "OPEN" } });
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
    badge: openInquiries.toString(),
    exact: false,
  },
  {
    label: "Low Stock Alerts",
    href: "/admin/low-stock",
    icon: AlertTriangle,
    exact: false,
  },
];

function NavLink({
  item,
  onClick,
}: {
  item: (typeof navItems)[0];
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href) && item.href !== "/admin"
      ? true
      : pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
        transition-[background,color,transform] duration-200
        ${
          isActive
            ? "bg-[#D4A853]/15 text-[#D4A853] border border-[#D4A853]/20"
            : "text-slate-400 hover:text-[#F5F0E8] hover:bg-white/5"
        }
      `}
    >
      <item.icon
        size={18}
        className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
          isActive ? "text-[#D4A853]" : ""
        }`}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge className="text-xs px-1.5 py-0 h-5 bg-[#D4A853] text-slate-900 font-semibold">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

function SidebarContent({
  adminName,
  onNavClick,
}: {
  adminName: string;
  onNavClick?: () => void;
}) {
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
            <Scissors size={16} className="text-slate-900 rotate-45" />
          </div>
          <div>
            <p
              className="text-[#F5F0E8] font-semibold text-sm leading-none"
              style={{ fontFamily: "var(--font-playfair, serif)" }}
            >
              TextileHub
            </p>
            <p className="text-[10px] text-[#D4A853] tracking-widest uppercase mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-white/8 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onClick={onNavClick} />
        ))}
      </nav>

      <Separator className="bg-white/8 mx-4" />

      {/* Admin profile + logout */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="w-8 h-8 border border-[#D4A853]/30">
            <AvatarFallback className="bg-[#D4A853]/15 text-[#D4A853] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#F5F0E8] font-medium truncate">
              {adminName}
            </p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="
            w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
            text-slate-400 hover:text-red-400 hover:bg-red-400/8
            transition-[background,color] duration-200 group
          "
        >
          <LogOut
            size={16}
            className="group-hover:scale-110 transition-transform duration-200"
          />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        className="hidden lg:flex w-64 flex-shrink-0 flex-col min-h-screen sticky top-0"
        style={{
          background: "linear-gradient(180deg, #0F1117 0%, #131720 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Subtle fabric texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.5) 2px,
              rgba(255,255,255,0.5) 3px
            )`,
          }}
        />
        <div className="relative z-10 flex flex-col h-full">
          <SidebarContent adminName={adminName} />
        </div>
      </aside>

      {/* ── Mobile Header + Sheet ────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#0F1117] border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D4A853] flex items-center justify-center">
            <Scissors size={13} className="text-slate-900 rotate-45" />
          </div>
          <span
            className="text-[#F5F0E8] font-semibold text-sm"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            TextileHub
          </span>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg text-slate-400 hover:text-[#F5F0E8] hover:bg-white/8 transition-colors">
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 border-r-0"
            style={{
              background: "linear-gradient(180deg, #0F1117 0%, #131720 100%)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <SidebarContent
              adminName={adminName}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for mobile fixed header */}
      <div className="lg:hidden h-14" />
    </>
  );
}
