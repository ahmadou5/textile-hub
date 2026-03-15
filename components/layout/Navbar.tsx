// components/Navbar.tsx
"use client";

import { signOut } from "@/lib/auth";
import Link from "next/link";
import { useSession } from "next-auth/react";
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

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;

  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  // Close on route change / resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = (
    <>
      <NavLink href="/" onClick={() => setMobileOpen(false)}>
        Browse
      </NavLink>

      {role === "WHOLESALER" && (
        <>
          <NavLink
            href="/wholesale/products"
            icon={<Package size={12} />}
            onClick={() => setMobileOpen(false)}
          >
            Products
          </NavLink>
          <NavLink
            href="/wholesale/inquiries"
            icon={<MessageSquare size={12} />}
            onClick={() => setMobileOpen(false)}
          >
            Inquiries
          </NavLink>
          <NavLink
            href="/wholesale/orders"
            icon={<ShoppingBag size={12} />}
            onClick={() => setMobileOpen(false)}
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
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            href="/admin/products"
            icon={<Package size={12} />}
            onClick={() => setMobileOpen(false)}
          >
            Products
          </NavLink>
          <NavLink
            href="/admin/inquiries"
            icon={<MessageSquare size={12} />}
            onClick={() => setMobileOpen(false)}
          >
            Inquiries
          </NavLink>
          <NavLink
            href="/admin/upgrade-requests"
            icon={<MessageSquare size={12} />}
            onClick={() => setMobileOpen(false)}
          >
            Upgrade Requests
          </NavLink>
          <NavLink
            href="/admin/low-stock"
            icon={<MessageSquare size={12} />}
            onClick={() => setMobileOpen(false)}
          >
            Low Stocks
          </NavLink>
          <NavLink
            href="/admin/orders"
            icon={<ShoppingBag size={12} />}
            highlight
            onClick={() => setMobileOpen(false)}
          >
            Orders
          </NavLink>
        </>
      )}
    </>
  );

  const authLinks = session?.user ? (
    <>
      <Link
        href="/profile"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-[color,background] duration-150"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            }}
          >
            {(session.user.name ?? session.user.email ?? "U")[0].toUpperCase()}
          </div>
        )}
        <span>{session.user.name?.split(" ")[0] ?? "Profile"}</span>
      </Link>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
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
        onClick={() => setMobileOpen(false)}
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
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white hover:-translate-y-0.5 active:translate-y-0 transition-[transform] duration-150"
        style={{
          background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
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
    <nav
      ref={menuRef}
      className="sticky top-0 z-50 w-full"
      style={{
        background: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* ── Top bar ── */}
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
              background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
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

        {/* Right — auth (desktop) + hamburger (mobile) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Auth links — desktop only */}
          <div className="hidden md:flex items-center gap-2">{authLinks}</div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-[background] duration-150"
            style={{ color: "var(--text-muted)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          className="md:hidden w-full px-4 pb-4 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Nav links */}
          <div className="flex flex-col gap-0.5 pt-2">{navLinks}</div>

          {/* Divider */}
          <div
            className="my-2"
            style={{ borderTop: "1px solid var(--border)" }}
          />

          {/* Auth links */}
          <div className="flex flex-col gap-0.5">{authLinks}</div>
        </div>
      )}
    </nav>
  );
}

// ── NavLink helper ─────────────────────────────────────────────────────────────
function NavLink({
  href,
  icon,
  highlight = false,
  onClick,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-[color,background] duration-150"
      style={{
        color: highlight ? "var(--brand-hex)" : "var(--text-muted)",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
