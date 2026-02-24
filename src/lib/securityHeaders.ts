import type { NextResponse } from "next/server";

export function securityHeaders(res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(self), camera=(self)");

  const csp = [
    "default-src 'self'",
    "img-src 'self' blob: data: https:",
    "connect-src 'self' https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.pagesense.io https://www.googletagmanager.com https://www.google-analytics.com",
    "frame-src 'self' https://accounts.google.com"
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
}
