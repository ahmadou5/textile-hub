// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function focusIn(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--brand-hex)";
    e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
  }

  function focusOut(e: React.FocusEvent<HTMLInputElement>, hasError: boolean) {
    e.target.style.borderColor = hasError
      ? "var(--status-cancelled)"
      : "var(--border)";
    e.target.style.boxShadow = "none";
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-56px)]">
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-brand)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: "var(--brand-glow)",
              border: "1px solid var(--border-brand)",
            }}
          >
            <UserPlus size={18} style={{ color: "var(--brand-hex)" }} />
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
            }}
          >
            Create Account
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Register as a Guest — upgrade to Wholesale from your profile.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Adewale"
              {...register("name")}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-[border-color,box-shadow] duration-150"
              style={{
                background: "var(--bg-subtle)",
                border: `1px solid ${errors.name ? "var(--status-cancelled)" : "var(--border)"}`,
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
              onFocus={focusIn}
              onBlur={(e) => focusOut(e, !!errors.name)}
            />
            {errors.name && (
              <p
                className="text-xs"
                style={{
                  color: "var(--status-cancelled)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="you@business.com"
              {...register("email")}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-[border-color,box-shadow] duration-150"
              style={{
                background: "var(--bg-subtle)",
                border: `1px solid ${errors.email ? "var(--status-cancelled)" : "var(--border)"}`,
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
              onFocus={focusIn}
              onBlur={(e) => focusOut(e, !!errors.email)}
            />
            {errors.email && (
              <p
                className="text-xs"
                style={{
                  color: "var(--status-cancelled)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Min 6 characters"
                {...register("password")}
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none transition-[border-color,box-shadow] duration-150"
                style={{
                  background: "var(--bg-subtle)",
                  border: `1px solid ${errors.password ? "var(--status-cancelled)" : "var(--border)"}`,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
                onFocus={focusIn}
                onBlur={(e) => focusOut(e, !!errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: "var(--text-faint)" }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p
                className="text-xs"
                style={{
                  color: "var(--status-cancelled)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                placeholder="Repeat your password"
                {...register("confirmPassword")}
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none transition-[border-color,box-shadow] duration-150"
                style={{
                  background: "var(--bg-subtle)",
                  border: `1px solid ${errors.confirmPassword ? "var(--status-cancelled)" : "var(--border)"}`,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
                onFocus={focusIn}
                onBlur={(e) => focusOut(e, !!errors.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: "var(--text-faint)" }}
              >
                {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                className="text-xs"
                style={{
                  color: "var(--status-cancelled)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white
            disabled:opacity-60 disabled:cursor-not-allowed
            hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0
            transition-[opacity,transform] duration-150 mt-2"
            style={{
              background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
              boxShadow: "var(--shadow-brand)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Creating account…
              </>
            ) : (
              <>
                <UserPlus size={15} /> Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-xs text-center mt-6"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--brand-hex)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
