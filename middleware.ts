import { NextResponse, type NextRequest } from "next/server";
import { securityHeaders } from "@/lib/securityHeaders";

const PROTECTED_PREFIXES = ["/admin", "/organizer", "/volunteer"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply security headers to every response
  const res = NextResponse.next();
  securityHeaders(res);

  // Minimal route protection (real auth check happens server-side in pages)
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return res;

  // If no supabase auth cookies exist, redirect to /login
  const hasAuthCookie =
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb-refresh-token") ||
    // Supabase uses project-named cookies too; allow generic check:
    Array.from(req.cookies.getAll()).some((c) => c.name.includes("sb-"));

  if (!hasAuthCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
