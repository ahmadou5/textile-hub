"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    currentPassword: "",
    newPassword: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, string | null> = {
        name: form.name,
        email: form.email,
        imageUrl: form.imageUrl || null,
      };

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update profile");
        return;
      }

      toast.success("Profile updated! Sign in again to see changes.");
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--brand-hex)";
    e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
  }

  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-subtle)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-dm-sans, sans-serif)",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-muted)",
    fontFamily: "var(--font-dm-sans, sans-serif)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-brand)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div>
        <h2
          className="text-base font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
          }}
        >
          Edit Profile
        </h2>
        <p className="text-xs mt-0.5" style={labelStyle}>
          Leave password fields empty to keep your current password.
        </p>
      </div>

      {/* Name */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Full Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-200"
          style={inputStyle}
          onFocus={focusInput}
          onBlur={blurInput}
        />
      </div>

      {/* Email */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-200"
          style={inputStyle}
          onFocus={focusInput}
          onBlur={blurInput}
        />
      </div>

      {/* Photo URL */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Profile Photo URL
        </label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-200"
          style={{
            ...inputStyle,
            color: form.imageUrl ? "var(--text-primary)" : undefined,
          }}
          onFocus={focusInput}
          onBlur={blurInput}
        />
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="mt-2 w-12 h-12 rounded-xl object-cover"
            style={{ border: "1px solid var(--border-brand)" }}
          />
        )}
      </div>

      {/* Password section */}
      <div
        className="pt-4 space-y-4"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{
            color: "var(--text-faint)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Change Password (optional)
        </p>

        {/* Current password */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={labelStyle}
          >
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPw ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => set("currentPassword", e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-200"
              style={inputStyle}
              onFocus={focusInput}
              onBlur={blurInput}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
              style={{ color: "var(--text-faint)" }}
            >
              {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={labelStyle}
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPw ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => set("newPassword", e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-200"
              style={inputStyle}
              onFocus={focusInput}
              onBlur={blurInput}
            />
            <button
              type="button"
              onClick={() => setShowNewPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
              style={{ color: "var(--text-faint)" }}
            >
              {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:-translate-y-0.5 active:translate-y-0
          transition-[transform] duration-150"
        style={{
          background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
          boxShadow: "var(--shadow-brand)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Save size={14} /> Save Changes
          </>
        )}
      </button>
    </form>
  );
}
