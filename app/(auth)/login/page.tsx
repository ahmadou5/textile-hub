"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      if (session.user.role === "ADMIN") router.replace("/admin");
      else if (session.user.role === "WHOLESALER") router.replace("/wholesale");
      else router.replace("/");
    }
  }, [status, session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Login successful!");
  }

  return (
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
          <LogIn size={18} style={{ color: "var(--brand-hex)" }} />
        </div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
          }}
        >
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-[border-color,box-shadow] duration-150"
            style={{
              background: "var(--bg-subtle)",
              border: `1px solid ${errors.email ? "var(--status-cancelled)" : "var(--border)"}`,
              color: "var(--text-primary)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--brand-hex)";
              e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.email
                ? "var(--status-cancelled)"
                : "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
          {errors.email && (
            <p className="text-xs" style={{ color: "var(--status-cancelled)" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-[border-color,box-shadow] duration-150"
            style={{
              background: "var(--bg-subtle)",
              border: `1px solid ${errors.password ? "var(--status-cancelled)" : "var(--border)"}`,
              color: "var(--text-primary)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--brand-hex)";
              e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.password
                ? "var(--status-cancelled)"
                : "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
          {errors.password && (
            <p className="text-xs" style={{ color: "var(--status-cancelled)" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {error && (
          <div
            className="px-3 py-2 rounded-lg text-xs"
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "var(--status-cancelled)",
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-[opacity,transform] duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{
            background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            boxShadow: "var(--shadow-brand)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
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
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium hover:underline"
          style={{ color: "var(--brand-hex)" }}
        >
          Register
        </Link>
      </p>
    </div>
  );
}
