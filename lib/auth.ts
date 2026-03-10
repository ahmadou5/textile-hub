import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { Role } from "./generated/prisma/enums";
import { auth as getAuth } from "@/lib/auth"; // for requireRole
import { ChevronsRightLeft } from "lucide-react";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        try {
          const user = await db.users.findUnique({
            where: { email },
          });

          console.log("[AUTH] User found:", user ? user.email : "NOT FOUND");

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(password, user.password);
          console.log("[AUTH] Password valid:", isValid);

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as string,
          };
        } catch (error) {
          console.error("[AUTH_AUTHORIZE_ERROR]", error);
          return null;
        }
      },
    }),
  ],
});

// ─── requireRole as a separate export ─────────────────────────────────────
export async function requireRole(role: Role | Role[]) {
  const { redirect } = await import("next/navigation"); // ✅ dynamic import
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session?.user.role as Role)) {
    redirect("/unauthorized");
  }

  return session;
}
