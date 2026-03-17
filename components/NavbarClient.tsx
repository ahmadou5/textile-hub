"use client";

// components/NavbarClient.tsx
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  LogIn,
  UserPlus,
  Package,
  Menu,
  X,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";
import CartButton from "@/components/cartButton";
import CartDrawer from "@/components/cartDrawer";
import type { Session } from "next-auth";
import Image from "next/image";

interface Badges {
  inquiries: number;
  orders: number;
  upgradeRequests: number;
}

interface NavbarClientProps {
  session: Session | null;
  imageUrl?: string;
  badges?: Badges;
}

export default function NavbarClient({
  session,
  imageUrl,
  badges = { inquiries: 0, orders: 0, upgradeRequests: 0 },
}: NavbarClientProps) {
  const role = session?.user?.role as string | undefined;
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const close = () => setMobileOpen(false);

  const navLinks = (
    <>
      {role === "GUEST" && (
        <NavLink href="/" onClick={close}>
          Browse
        </NavLink>
      )}

      {role === "WHOLESALER" && (
        <>
          <NavLink
            href="/wholesale"
            icon={<LayoutDashboard size={12} />}
            highlight
            onClick={close}
          >
            Dashboard
          </NavLink>
          <NavLink
            href="/wholesale/products"
            icon={<Package size={12} />}
            onClick={close}
          >
            Products
          </NavLink>
          <NavLink
            href="/wholesale/inquiries"
            icon={<MessageSquare size={12} />}
            badge={badges.inquiries}
            onClick={close}
          >
            Chats
          </NavLink>
          <NavLink
            href="/wholesale/orders"
            icon={<ShoppingBag size={12} />}
            badge={badges.orders}
            onClick={close}
          >
            My Orders
          </NavLink>
        </>
      )}

      {role === "ADMIN" && (
        <>
          <NavLink
            href="/admin"
            icon={<LayoutDashboard size={12} />}
            highlight
            onClick={close}
          >
            Dashboard
          </NavLink>
          <NavLink
            href="/admin/products"
            icon={<Package size={12} />}
            onClick={close}
          >
            Products
          </NavLink>
          <NavLink
            href="/admin/inquiries"
            icon={<MessageSquare size={12} />}
            badge={badges.inquiries}
            onClick={close}
          >
            Chats
          </NavLink>
          <NavLink
            href="/admin/upgrade-requests"
            icon={<MessageSquare size={12} />}
            badge={badges.upgradeRequests}
            onClick={close}
          >
            Upgrade Requests
          </NavLink>
          <NavLink
            href="/admin/low-stock"
            icon={<MessageSquare size={12} />}
            onClick={close}
          >
            Low Stocks
          </NavLink>
          <NavLink
            href="/admin/orders"
            icon={<ShoppingBag size={12} />}
            badge={badges.orders}
            highlight
            onClick={close}
          >
            Orders
          </NavLink>
        </>
      )}
    </>
  );

  const avatarSrc = imageUrl || session?.user?.image || null;
  const avatarInitial = (session?.user?.name ??
    session?.user?.email ??
    "U")[0].toUpperCase();

  const authLinks = session?.user ? (
    <>
      <Link
        href="/profile"
        onClick={close}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-[color,background] duration-150"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)",
            }}
          >
            {avatarInitial}
          </div>
        )}
        <span>{session.user.name?.split(" ")[0] ?? "Profile"}</span>
      </Link>

      <form action={signOutAction}>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-[color,background] duration-150"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link
        href="/login"
        onClick={close}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-[color,background] duration-150"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <LogIn size={12} />
        Sign In
      </Link>
      <Link
        href="/register"
        onClick={close}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white hover:-translate-y-0.5 active:translate-y-0 transition-[transform] duration-150"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)",
          boxShadow: "var(--shadow-brand)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <UserPlus size={12} />
        Register
      </Link>
    </>
  );

  return (
    <>
      <nav
        ref={menuRef}
        className="sticky top-0 z-50 w-full"
        style={{
          background: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="w-[90%] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)",
              }}
            >
              T
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              TextileHub
            </span>
          </Link>

          {/* Center nav — desktop only */}
          <div className="hidden md:flex items-center gap-1">{navLinks}</div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <CartButton />
            <div className="hidden md:flex items-center gap-2">{authLinks}</div>
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="md:hidden w-full px-4 pb-4 flex flex-col gap-1"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 49,
              borderTop: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--bg-card) 97%, transparent)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            <div className="flex flex-col gap-0.5 pt-2">{navLinks}</div>
            <div
              className="my-2"
              style={{ borderTop: "1px solid var(--border)" }}
            />
            <div className="flex flex-col gap-0.5">{authLinks}</div>
          </div>
        )}
      </nav>

      <CartDrawer />
    </>
  );
}

// ── NavLink with optional badge ─────────────────────────────────────────────
function NavLink({
  href,
  icon,
  highlight = false,
  badge = 0,
  onClick,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  badge?: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-[color,background] duration-150"
      style={{
        color: highlight ? "var(--brand-hex)" : "var(--text-muted)",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      {icon}
      {children}
      {badge > 0 && (
        <span
          className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white"
          style={{ background: "var(--brand-hex)" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
