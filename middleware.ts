import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { securityHeaders } from "@/lib/securityHeaders";

const PROTECTED_PREFIXES = ["/admin", "/organizer", "/volunteer", "/onboarding"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  securityHeaders(res);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  // Refresh session if it exists (keeps auth cookies valid for API routes)
  await supabase.auth.getUser();

  // Route protection
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return res;

  const hasAuthCookie = Array.from(req.cookies.getAll()).some((c) => c.name.includes("sb-"));

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
