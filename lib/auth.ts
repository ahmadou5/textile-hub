import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { Role } from "@prisma/client";

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
          // ✅ use findUnique not findMany
          const user = await db.users.findUnique({
            where: { email },
          });

          console.log("[AUTH] User found:", user?.email ?? "NOT FOUND");

          if (!user?.password) return null;

          const isValid = await bcrypt.compare(password, user.password);
          console.log("[AUTH] Password valid:", isValid);

          if (!isValid) return null;

          // ✅ explicitly return all fields including role
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // Role enum value e.g. "WHOLESALER"
          };
        } catch (error) {
          console.error("[AUTH_AUTHORIZE_ERROR]", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // ✅ override callbacks here to ensure role is in JWT
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.role = user.role; // ✅ put role in token
      }
      console.log("[JWT CALLBACK] token:", token);
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // ✅ pull role from token
      }
      console.log("[SESSION CALLBACK] session:", session);
      return session;
    },
  },
});

// ─── requireRole ──────────────────────────────────────────────────────────
export async function requireRole(role: string | string[]) {
  const { redirect } = await import("next/navigation");
  const session = await auth();

  console.log("[REQUIRE_ROLE] session:", session?.user);

  //if (!session?.user) redirect("/login");

  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session?.user.role as string)) {
    redirect("/unauthorized");
  }

  return session;
}
