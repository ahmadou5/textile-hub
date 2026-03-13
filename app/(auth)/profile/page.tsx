// app/(auth)/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import ProfileForm from "@/components/ProfileForm";
import UpgradeRequestSection from "@/components/UpgradeRequestSection";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import BankDetailsForm from "@/components/admin/BankDetailsForm";
import { ShieldCheck, Calendar, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = { title: "My Profile — TextileHub" };

const ROLE_BADGE: Record<
  string,
  { label: string; bg: string; color: string; border: string }
> = {
  GUEST: {
    label: "Guest",
    bg: "var(--bg-subtle)",
    color: "var(--text-muted)",
    border: "var(--border)",
  },
  WHOLESALER: {
    label: "Wholesaler",
    bg: "var(--brand-glow)",
    color: "var(--brand-bright)",
    border: "var(--border-strong)",
  },
  ADMIN: {
    label: "Admin",
    bg: "rgba(212,168,83,0.1)",
    color: "#D4A853",
    border: "rgba(212,168,83,0.25)",
  },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, bankDetails] = await Promise.all([
    db.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        createdAt: true,
        upgradeRequest: {
          select: { id: true, status: true, message: true, createdAt: true },
        },
      },
    }),
    // Only fetch bank details for admin — returns null for others
    session.user.role === "ADMIN"
      ? db.admin_bank_details.findUnique({ where: { id: "singleton" } })
      : Promise.resolve(null),
  ]);

  if (!user) redirect("/login");

  const badge = ROLE_BADGE[user.role] ?? ROLE_BADGE.GUEST;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="w-[90%] mx-auto px-4 py-10 space-y-8">
        {/* ── Profile header ── */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name ?? ""}
                  className="w-16 h-16 rounded-2xl object-cover"
                  style={{ border: "2px solid var(--border-strong)" }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
                  }}
                >
                  {(user.name ?? user.email)[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl font-bold"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-syne, sans-serif)",
                  letterSpacing: "-0.02em",
                }}
              >
                {user.name ?? "Unnamed User"}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  <Mail size={11} />
                  {user.email}
                </span>
                <span style={{ color: "var(--border)" }}>·</span>
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  <ShieldCheck size={10} />
                  {badge.label}
                </span>
              </div>
              <p
                className="flex items-center gap-1 text-xs mt-1"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                <Calendar size={10} />
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-NG", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Upgrade request — GUEST only ── */}
        {user.role === "GUEST" && (
          <UpgradeRequestSection existingRequest={user.upgradeRequest} />
        )}

        {/* ── Edit profile form ── */}
        <ProfileForm
          user={{
            id: user.id,
            name: user.name ?? "",
            email: user.email,
            imageUrl: user.imageUrl ?? "",
          }}
        />

        {/* ── Admin: bank account settings ── */}
        {user.role === "ADMIN" && (
          <BankDetailsForm
            initial={
              bankDetails
                ? {
                    bankName: bankDetails.bankName,
                    accountNumber: bankDetails.accountNumber,
                    accountName: bankDetails.accountName,
                  }
                : null
            }
          />
        )}

        {/* ── Appearance / Theme toggle — all roles ── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="text-sm font-semibold mb-4"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Preferences
          </p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
