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

  const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm text-slate-800
    bg-white border border-slate-200 placeholder:text-slate-400
    focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]/20
    transition-[border-color,box-shadow] duration-200`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5`;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5"
    >
      <div>
        <h2
          className="text-base font-bold text-slate-800"
          style={{ fontFamily: "var(--font-playfair, serif)" }}
        >
          Edit Profile
        </h2>
        <p
          className="text-xs text-slate-400 mt-0.5"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Leave password fields empty to keep your current password.
        </p>
      </div>

      {/* Name */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Full Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          className={inputClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
      </div>

      {/* Email */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
          className={inputClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
      </div>

      {/* Photo URL */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Profile Photo URL
        </label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://..."
          className={inputClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="mt-2 w-12 h-12 rounded-xl object-cover border border-slate-200"
          />
        )}
      </div>

      {/* Password section */}
      <div className="pt-2 border-t border-slate-100 space-y-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider text-slate-400"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Change Password (optional)
        </p>

        {/* Current password */}
        <div>
          <label
            className={labelClass}
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPw ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => set("currentPassword", e.target.value)}
              placeholder="Enter current password"
              className={`${inputClass} pr-10`}
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label
            className={labelClass}
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPw ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => set("newPassword", e.target.value)}
              placeholder="Min 6 characters"
              className={`${inputClass} pr-10`}
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            />
            <button
              type="button"
              onClick={() => setShowNewPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:-translate-y-0.5 active:translate-y-0
          transition-[transform] duration-150"
        style={{
          background: "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
          boxShadow: "0 2px 8px rgba(212,168,83,0.3)",
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
