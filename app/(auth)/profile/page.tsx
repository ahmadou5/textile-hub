// app/(auth)/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import ProfileForm from "@/components/ProfileForm";
import UpgradeRequestSection from "@/components/UpgradeRequestSection";
import { ShieldCheck, Calendar, Mail } from "lucide-react";

export const metadata: Metadata = { title: "My Profile — TextileHub" };

const ROLE_BADGE: Record<string, { label: string; style: string }> = {
  GUEST: {
    label: "Guest",
    style: "bg-slate-100 text-slate-600 border-slate-200",
  },
  WHOLESALER: {
    label: "Wholesaler",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ADMIN: {
    label: "Admin",
    style: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.users.findUnique({
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
  });

  if (!user) redirect("/login");

  const badge = ROLE_BADGE[user.role] ?? ROLE_BADGE.GUEST;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name ?? ""}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
                  }}
                >
                  {(user.name ?? user.email)[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl font-bold text-slate-800"
                style={{ fontFamily: "var(--font-playfair, serif)" }}
              >
                {user.name ?? "Unnamed User"}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="flex items-center gap-1 text-xs text-slate-500"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  <Mail size={11} />
                  {user.email}
                </span>
                <span className="text-slate-300">·</span>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.style}`}
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  <ShieldCheck size={10} />
                  {badge.label}
                </span>
              </div>
              <p
                className="flex items-center gap-1 text-xs text-slate-400 mt-1"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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

        {/* Upgrade request section — only for GUEST */}
        {user.role === "GUEST" && (
          <UpgradeRequestSection existingRequest={user.upgradeRequest} />
        )}

        {/* Edit form */}
        <ProfileForm
          user={{
            id: user.id,
            name: user.name ?? "",
            email: user.email,
            imageUrl: user.imageUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
