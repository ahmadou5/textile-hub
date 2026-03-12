// app/(auth)/register/page.tsx
// Creates GUEST role by default — user must request upgrade to WHOLESALER
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
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

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

  const inputBase = `w-full px-4 py-3 rounded-xl text-sm text-slate-800
    bg-white border placeholder:text-slate-400
    focus:outline-none focus:ring-2
    transition-[border-color,box-shadow] duration-200`;

  const inputValid = `border-slate-200 focus:border-[#D4A853] focus:ring-[#D4A853]/15`;
  const inputErr = `border-red-300 focus:border-red-400 focus:ring-red-400/15`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white text-lg font-bold"
            style={{
              background: "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
            }}
          >
            T
          </div>
          <h1
            className="text-2xl font-bold text-slate-800"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Create Account
          </h1>
          <p
            className="text-sm text-slate-500"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Register as a Guest — upgrade to Wholesale from your profile.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-4"
        >
          {/* Name */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Adewale"
              {...register("name")}
              className={`${inputBase} ${errors.name ? inputErr : inputValid}`}
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            />
            {errors.name && (
              <p
                className="text-xs text-red-500 mt-1"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="you@business.com"
              {...register("email")}
              className={`${inputBase} ${errors.email ? inputErr : inputValid}`}
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            />
            {errors.email && (
              <p
                className="text-xs text-red-500 mt-1"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Min 6 characters"
                {...register("password")}
                className={`${inputBase} pr-10 ${errors.password ? inputErr : inputValid}`}
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p
                className="text-xs text-red-500 mt-1"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                placeholder="Repeat your password"
                {...register("confirmPassword")}
                className={`${inputBase} pr-10 ${errors.confirmPassword ? inputErr : inputValid}`}
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                className="text-xs text-red-500 mt-1"
                style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:-translate-y-0.5 active:translate-y-0
              transition-[transform] duration-150 mt-2"
            style={{
              background: "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
              boxShadow: "0 4px 12px rgba(212,168,83,0.3)",
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

        <p
          className="text-center text-xs text-slate-500"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#D4A853] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
