// components/wholesale/WholesaleSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sparkles,
  MessageSquare,
  Package,
  LogOut,
  Menu,
  Scissors,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/wholesale",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "New Arrivals",
    href: "/wholesale/new-arrivals",
    icon: Sparkles,
    exact: false,
  },
  {
    label: "All Products",
    href: "/wholesale/products",
    icon: Package,
    exact: false,
  },
  {
    label: "My Inquiries",
    href: "/wholesale/inquiries",
    icon: MessageSquare,
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
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
        transition-[background,color] duration-200
        ${
          isActive
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
        }
      `}
    >
      <item.icon
        size={16}
        className={`flex-shrink-0 transition-[transform] duration-200 group-hover:scale-110 ${
          isActive ? "text-emerald-400" : ""
        }`}
      />
      {item.label}
    </Link>
  );
}

function SidebarContent({
  userName,
  onNavClick,
}: {
  userName: string;
  onNavClick?: () => void;
}) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <Scissors size={15} className="text-white rotate-45" />
          </div>
          <div>
            <p
              className="text-white font-bold text-sm leading-none"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              TextileHub
            </p>
            <p className="text-[10px] text-emerald-400 tracking-widest uppercase mt-0.5">
              Wholesale Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Profile */}
      <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="w-8 h-8 border border-emerald-500/30">
            <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-500">Wholesale Account</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
            text-slate-400 hover:text-red-400 hover:bg-red-400/8
            transition-[background,color] duration-200 group
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-400"
        >
          <LogOut
            size={15}
            className="group-hover:scale-110 transition-[transform] duration-200"
          />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function WholesaleSidebar({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex w-60 flex-shrink-0 flex-col min-h-screen sticky top-0"
        style={{
          background: "linear-gradient(180deg, #0A0E16 0%, #0D1117 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <SidebarContent userName={userName} />
      </aside>

      {/* Mobile header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
        style={{
          background: "#0A0E16",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Scissors size={13} className="text-white rotate-45" />
          </div>
          <span
            className="text-white font-bold text-sm"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            TextileHub
          </span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-[color,background] duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-500">
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 p-0 border-r-0"
            style={{
              background: "linear-gradient(180deg, #0A0E16 0%, #0D1117 100%)",
              borderRight: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <SidebarContent
              userName={userName}
              onNavClick={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
      <div className="lg:hidden h-14 flex-shrink-0" />
    </>
  );
}
