// app/(admin)/admin/upgrade-requests/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { UserCheck, Clock, Mail } from "lucide-react";
import UpgradeRequestActions from "@/components/admin/UpgradeRequestActions";

export const metadata: Metadata = {
  title: "Upgrade Requests — Admin | TextileHub",
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  PENDING: {
    background: "rgba(217,119,6,0.08)",
    color: "var(--status-pending)",
    border: "1px solid rgba(217,119,6,0.25)",
  },
  APPROVED: {
    background: "rgba(5,150,105,0.08)",
    color: "var(--status-confirmed)",
    border: "1px solid rgba(5,150,105,0.25)",
  },
  REJECTED: {
    background: "rgba(220,38,38,0.08)",
    color: "var(--status-cancelled)",
    border: "1px solid rgba(220,38,38,0.25)",
  },
};

export default async function UpgradeRequestsPage() {
  noStore();
  await requireRole("ADMIN");

  const requests = await db.upgradeRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true, name: true, email: true, createdAt: true } },
    },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const processed = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className="text-xs font-semibold tracking-[0.15em] uppercase mb-1"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Account Management
          </p>
          <h1
            className="text-3xl font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Upgrade Requests
          </h1>
        </div>

        {/* Pending live badge */}
        {pending.length > 0 && (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0"
            style={{
              background: "rgba(217,119,6,0.08)",
              color: "var(--status-pending)",
              border: "1px solid rgba(217,119,6,0.25)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "var(--status-pending)" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "var(--status-pending)" }}
              />
            </span>
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Pending requests */}
      {pending.length === 0 ? (
        <div
          className="flex flex-col items-center py-16 text-center rounded-2xl"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <UserCheck
            size={32}
            className="mb-3"
            style={{ color: "var(--text-faint)" }}
          />
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            No pending upgrade requests
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              color: "var(--text-faint)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Awaiting Review
          </p>
          {pending.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-brand)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(217,119,6,0.08)",
                  border: "1px solid rgba(217,119,6,0.2)",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    color: "var(--status-pending)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {(req.users.name ?? req.users.email)[0].toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {req.users.name ?? "Unnamed User"}
                </p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    <Mail size={10} />
                    {req.users.email}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    <Clock size={10} />
                    {new Date(req.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {req.message && (
                  <p
                    className="text-xs italic mt-1.5"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    {req.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <UpgradeRequestActions requestId={req.id} />
            </div>
          ))}
        </div>
      )}

      {/* Processed requests */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              color: "var(--text-faint)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Processed
          </p>
          {processed.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {(req.users.name ?? req.users.email)[0].toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {req.users.name ?? req.users.email}
                </p>
                <p
                  className="text-xs truncate"
                  style={{
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {req.users.email}
                </p>
              </div>

              {/* Status badge */}
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  ...(STATUS_STYLES[req.status] ?? STATUS_STYLES.PENDING),
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {req.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
