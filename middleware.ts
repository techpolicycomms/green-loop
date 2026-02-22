import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { securityHeaders } from "@/lib/securityHeaders";

// Paths that are always public (no auth required) even if they start with a protected prefix
const PUBLIC_OVERRIDES = ["/admin/login"];

// Paths that require authentication
const PROTECTED_PREFIXES = ["/admin", "/organizer", "/volunteer", "/onboarding"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  securityHeaders(res);

  const { pathname } = req.nextUrl;

  // Allow public override paths through without any auth check
  if (PUBLIC_OVERRIDES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return res;
  }

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

  // Refresh session (keeps auth cookies valid)
  const { data: { user } } = await supabase.auth.getUser();

  // Check if this path needs protection
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return res;

  // No user session — redirect to appropriate login page
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    url.searchParams.delete("reason");
    return NextResponse.redirect(url);
  }

  // Admin routes: enforce admin role (defense in depth on top of API-level checks)
  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("reason", "access_denied");
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
