"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Save, Eye, EyeOff, Upload, X, Camera } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-client";

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
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.imageUrl || null,
  );
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    currentPassword: "",
    newPassword: "",
  });

  const { startUpload } = useUploadThing("profileImage", {
    onUploadBegin: () => setImageUploading(true),
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) {
        setForm((prev) => ({ ...prev, imageUrl: url }));
        setImagePreview(url);
        toast.success("Photo uploaded!");
      }
      setImageUploading(false);
    },
    onUploadError: (err) => {
      toast.error(err.message ?? "Upload failed");
      setImageUploading(false);
    },
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate type + size client-side first
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to UploadThing
    await startUpload([file]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }

  function removeImage() {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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

      {/* ── Profile Photo Upload ── */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-2"
          style={labelStyle}
        >
          Profile Photo
        </label>

        <div className="flex items-start gap-4">
          {/* Avatar preview */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-brand)",
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <Camera size={20} style={{ color: "var(--text-faint)" }} />
                  <span
                    className="text-[9px]"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    No photo
                  </span>
                </div>
              )}
              {/* Upload loading overlay */}
              {imageUploading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <Loader2 size={18} className="animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Remove button */}
            {imagePreview && !imageUploading && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ background: "var(--status-cancelled)" }}
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* Drop zone */}
          <div
            className="flex-1 rounded-xl flex flex-col items-center justify-center gap-2 py-5 px-4 cursor-pointer
              transition-[border-color,background] duration-150"
            style={{
              border: `2px dashed ${dragOver ? "var(--brand-hex)" : "var(--border)"}`,
              background: dragOver ? "var(--brand-glow)" : "var(--bg-subtle)",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {imageUploading ? (
              <div className="flex items-center gap-2">
                <Loader2
                  size={14}
                  className="animate-spin"
                  style={{ color: "var(--brand-hex)" }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: "var(--brand-hex)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Uploading…
                </span>
              </div>
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--brand-glow)",
                    border: "1px solid var(--border-brand)",
                  }}
                >
                  <Upload size={14} style={{ color: "var(--brand-hex)" }} />
                </div>
                <div className="text-center">
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    Drop image here or{" "}
                    <span style={{ color: "var(--brand-hex)" }}>browse</span>
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                  >
                    PNG, JPG, WEBP — max 2MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
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
        disabled={loading || imageUploading}
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
        ) : imageUploading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Uploading photo…
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
