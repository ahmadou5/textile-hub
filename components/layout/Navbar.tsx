// components/Navbar.tsx
import { auth } from "@/lib/auth";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import {
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Layers,
} from "lucide-react";

// ─── Sub-components per role ───────────────────────────────────────────

function PublicNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 h-16"
      style={{
        background: "rgba(250,247,242,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(201,145,58,0.12)",
        boxShadow: "0 1px 0 rgba(201,145,58,0.08), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group
          focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9913A] rounded-sm"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #C9913A 0%, #D4A853 100%)",
          }}
        >
          <Layers size={15} className="text-white" />
        </div>
        <span
          className="text-xl font-bold text-[#1C1410] tracking-tight"
          style={{
            fontFamily: "var(--font-cormorant, serif)",
            letterSpacing: "-0.02em",
          }}
        >
          TextileHub
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1">
        <Link
          href="/products"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-[#5C4A3A]
            hover:text-[#1C1410] hover:bg-[#C9913A]/8
            transition-[color,background] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Browse Fabrics
        </Link>

        <div className="w-px h-4 bg-[#C9913A]/20 mx-1" />

        <Link
          href="/login"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-[#5C4A3A]
            hover:text-[#1C1410] hover:bg-[#C9913A]/8
            transition-[color,background] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <LogIn size={14} />
          Login
        </Link>

        <Link
          href="/register"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
            text-white bg-[#C9913A]
            shadow-[0_2px_8px_rgba(201,145,58,0.3)]
            hover:brightness-105 hover:-translate-y-0.5
            active:translate-y-0 active:brightness-95
            transition-[filter,transform,box-shadow] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9913A]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <UserPlus size={14} />
          Register
        </Link>
      </div>
    </nav>
  );
}

function WholesaleNav({ userName }: { userName: string }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 h-14"
      style={{
        background: "rgba(10,14,22,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(16,185,129,0.1)",
        boxShadow: "0 1px 0 rgba(16,185,129,0.06), 0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Logo */}
      <Link
        href="/wholesale"
        className="flex items-center gap-2.5 group
          focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 rounded-sm"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <Layers size={13} className="text-emerald-400" />
        </div>
        <span
          className="text-base font-bold text-white tracking-tight"
          style={{
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.03em",
          }}
        >
          TextileHub
          <span className="text-emerald-500 ml-1 text-xs font-semibold tracking-wider uppercase opacity-80">
            Wholesale
          </span>
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1">
        <Link
          href="/wholesale/new-arrivals"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400
            hover:text-emerald-300 hover:bg-emerald-500/8
            transition-[color,background] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <Sparkles size={13} />
          New Arrivals
        </Link>

        <Link
          href="/wholesale/inquiries"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400
            hover:text-emerald-300 hover:bg-emerald-500/8
            transition-[color,background] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <MessageSquare size={13} />
          My Inquiries
        </Link>

        <div className="w-px h-3.5 bg-white/10 mx-1" />

        <span
          className="text-xs text-slate-600 hidden sm:block px-2"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {userName}
        </span>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500
              hover:text-red-400 hover:bg-red-500/8
              transition-[color,background] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}

function AdminNav({ userName }: { userName: string }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 h-14"
      style={{
        background: "rgba(15,17,23,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,168,83,0.12)",
        boxShadow: "0 1px 0 rgba(212,168,83,0.08), 0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* Logo */}
      <Link
        href="/admin"
        className="flex items-center gap-2.5 group
          focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A853] rounded-sm"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(212,168,83,0.12)",
            border: "1px solid rgba(212,168,83,0.2)",
          }}
        >
          <Layers size={13} className="text-[#D4A853]" />
        </div>
        <span
          className="text-base font-bold text-white tracking-tight"
          style={{ fontFamily: "var(--font-playfair, serif)" }}
        >
          TextileHub
          <span className="text-[#D4A853] ml-1 text-[10px] font-semibold tracking-widest uppercase opacity-90">
            Admin
          </span>
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400
            hover:text-[#D4A853] hover:bg-[#D4A853]/8
            transition-[color,background] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D4A853]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <LayoutDashboard size={13} />
          Dashboard
        </Link>

        <div className="w-px h-3.5 bg-white/10 mx-1" />

        <span
          className="text-xs text-slate-600 hidden sm:block px-2"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {userName}
        </span>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500
              hover:text-red-400 hover:bg-red-500/8
              transition-[color,background] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}

// ─── Main export: server component, role-aware ──────────────────────────

export default async function Navbar() {
  const session = await auth();
  const role = session?.user?.role;
  const name = session?.user?.name ?? session?.user?.email ?? "";

  if (role === "ADMIN") return <AdminNav userName={name} />;
  if (role === "WHOLESALER") return <WholesaleNav userName={name} />;
  return <PublicNav />;
}
