// components/Navbar.tsx
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  LogIn,
  UserPlus,
  Package,
} from "lucide-react";

export default async function Navbar() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
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
            className="text-sm font-bold hidden sm:block"
            style={{ color: "var(--text-primary)" }}
          >
            TextileHub
          </span>
        </Link>

        {/* Center nav */}
        <div className="flex items-center gap-1">
          {/* Always visible */}
          <NavLink href="/">Browse</NavLink>

          {/* Wholesaler + Admin */}
          {(role === "WHOLESALER" || role === "ADMIN") && (
            <>
              <NavLink href="/wholesale/products" icon={<Package size={12} />}>
                Products
              </NavLink>
              <NavLink
                href="/wholesale/inquiries"
                icon={<MessageSquare size={12} />}
              >
                Inquiries
              </NavLink>
              <NavLink
                href="/wholesale/orders"
                icon={<ShoppingBag size={12} />}
              >
                My Orders
              </NavLink>
            </>
          )}

          {/* Admin only */}
          {role === "ADMIN" && (
            <>
              <NavLink
                href="/admin"
                icon={<LayoutDashboard size={12} />}
                highlight
              >
                Dashboard
              </NavLink>
              <NavLink
                href="/admin/orders"
                icon={<ShoppingBag size={12} />}
                highlight
              >
                Orders
              </NavLink>
            </>
          )}
        </div>

        {/* Right — auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {session?.user ? (
            <>
              {/* Avatar / profile link */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-[color,background] duration-150"
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
                    transition-[color,background] duration-150"
                  style={{
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
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
                  transition-[color,background] duration-150"
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
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-[transform] duration-150"
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
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Small helper to keep nav links DRY ───────────────────────────────────────
function NavLink({
  href,
  icon,
  highlight = false,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-[color,background] duration-150"
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
