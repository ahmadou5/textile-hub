// components/admin/BankDetailsForm.tsx
// Embed in /admin/settings or /profile for ADMIN role
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, Loader2, Save, Check } from "lucide-react";

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface BankDetailsFormProps {
  initial?: BankDetails | null;
}

export default function BankDetailsForm({ initial }: BankDetailsFormProps) {
  const [form, setForm] = useState<BankDetails>({
    bankName: initial?.bankName ?? "",
    accountNumber: initial?.accountNumber ?? "",
    accountName: initial?.accountName ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof BankDetails, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bank-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const fieldErrors = data.details?.fieldErrors;
        const msg = fieldErrors
          ? Object.values(fieldErrors).flat().join(", ")
          : (data.error ?? "Failed to save");
        toast.error(msg);
        return;
      }
      setSaved(true);
      toast.success("Bank details updated!");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--bg-subtle)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-dm-sans, sans-serif)",
  };

  const labelStyle = {
    color: "var(--text-muted)",
    fontFamily: "var(--font-dm-sans, sans-serif)",
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{
          background: "var(--bg-subtle)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "var(--brand-glow)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <Building2 size={14} style={{ color: "var(--brand-bright)" }} />
        </div>
        <div>
          <p
            className="text-sm font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Receiving Account
          </p>
          <p
            className="text-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Shown to wholesalers on bank transfer checkout
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-5 space-y-4" style={{ background: "var(--bg-card)" }}>
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-wider"
            style={labelStyle}
          >
            Bank Name
          </label>
          <input
            type="text"
            value={form.bankName}
            onChange={(e) => set("bankName", e.target.value)}
            placeholder="e.g. Guaranty Trust Bank"
            className="w-full px-4 py-2.5 rounded-xl text-sm
              focus:outline-none transition-[border-color] duration-150"
            style={inputStyle}
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-wider"
            style={labelStyle}
          >
            Account Number
          </label>
          <input
            type="text"
            value={form.accountNumber}
            onChange={(e) =>
              set(
                "accountNumber",
                e.target.value.replace(/\D/g, "").slice(0, 10),
              )
            }
            placeholder="10-digit NUBAN"
            maxLength={10}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-mono
              focus:outline-none transition-[border-color] duration-150"
            style={inputStyle}
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-wider"
            style={labelStyle}
          >
            Account Name
          </label>
          <input
            type="text"
            value={form.accountName}
            onChange={(e) => set("accountName", e.target.value)}
            placeholder="As it appears on the account"
            className="w-full px-4 py-2.5 rounded-xl text-sm
              focus:outline-none transition-[border-color] duration-150"
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:-translate-y-0.5 active:translate-y-0
            transition-[transform] duration-150"
          style={{
            background: saved
              ? "rgba(52,211,153,0.15)"
              : `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            color: saved ? "var(--brand-bright)" : "white",
            border: saved ? "1px solid var(--border-strong)" : "none",
            boxShadow: saved ? "none" : "var(--shadow-brand)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <Check size={14} /> Saved
            </>
          ) : (
            <>
              <Save size={14} /> Save Account Details
            </>
          )}
        </button>
      </div>
    </div>
  );
}
