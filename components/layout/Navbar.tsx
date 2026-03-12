// components/Navbar.tsx
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  Package,
  LogOut,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";

export default async function Navbar() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0"
          style={{ fontFamily: "var(--font-playfair, serif)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
            }}
          >
            T
          </div>
          <span className="text-sm font-bold text-slate-800 hidden sm:block">
            TextileHub
          </span>
        </Link>

        {/* Center nav links */}
        <div className="flex items-center gap-1">
          {/* Public always */}
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600
              hover:text-slate-900 hover:bg-slate-100
              transition-[color,background] duration-150"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Browse
          </Link>

          {/* Wholesaler nav */}
          {(role === "WHOLESALER" || role === "ADMIN") && (
            <>
              <Link
                href="/wholesale/new-arrivals"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600
                  hover:text-emerald-600 hover:bg-emerald-50
                  transition-[color,background] duration-150"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                <Sparkles size={12} />
                New Arrivals
              </Link>
              <Link
                href="/wholesale/inquiries"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600
                  hover:text-emerald-600 hover:bg-emerald-50
                  transition-[color,background] duration-150"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                <MessageSquare size={12} />
                Inquiries
              </Link>
            </>
          )}

          {/* Admin nav */}
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600
                hover:text-[#D4A853] hover:bg-amber-50
                transition-[color,background] duration-150"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              <LayoutDashboard size={12} />
              Dashboard
            </Link>
          )}
        </div>

        {/* Right — auth actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {session?.user ? (
            <>
              {/* Profile link */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600
                  hover:text-slate-900 hover:bg-slate-100
                  transition-[color,background] duration-150"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
                    }}
                  >
                    {(session.user.name ??
                      session.user.email ??
                      "U")[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block">
                  {session.user.name?.split(" ")[0] ?? "Profile"}
                </span>
              </Link>

              {/* Sign out */}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    text-slate-500 hover:text-red-500 hover:bg-red-50
                    transition-[color,background] duration-150"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  <LogOut size={12} />
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  text-slate-600 hover:text-slate-900 hover:bg-slate-100
                  transition-[color,background] duration-150"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                <LogIn size={12} />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-[transform] duration-150"
                style={{
                  background:
                    "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
                  boxShadow: "0 2px 6px rgba(212,168,83,0.3)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                <UserPlus size={12} />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
