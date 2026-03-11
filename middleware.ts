import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    // ✅ Auth.js v5 uses different cookie names
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  console.log("[MIDDLEWARE] token:", JSON.stringify(token));
  console.log("[MIDDLEWARE] role:", token?.role);

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "ADMIN")
      return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/wholesale")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "WHOLESALER" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wholesale/:path*", "/admin/:path*"],
};
