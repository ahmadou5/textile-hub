import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  console.log("[MIDDLEWARE]", { pathname, role, user: req.auth?.user });

  if (pathname.startsWith("/admin")) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "ADMIN")
      return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/wholesale")) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "WHOLESALER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/wholesale/:path*", "/admin/:path*"],
};
