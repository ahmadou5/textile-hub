import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const isWholesalePath = pathname.startsWith("/wholesale");
  const isAdminPath = pathname.startsWith("/admin");

  // ── Admin routes: ADMIN only ──────────────────────────────
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ── Wholesale routes: WHOLESALER or ADMIN ─────────────────
  if (isWholesalePath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token.role !== "WHOLESALER" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wholesale/:path*", "/admin/:path*"],
};
