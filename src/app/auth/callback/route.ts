import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

const ROLE_DEFAULTS: Record<string, string> = {
  admin: "/admin",
  organizer: "/organizer",
  volunteer: "/volunteer"
};

const ALLOWED_PATHS = ["/volunteer", "/organizer", "/admin", "/"];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const redirectBase = `${requestUrl.protocol}//${requestUrl.host}`;

  if (!code) {
    return NextResponse.redirect(`${redirectBase}/login`);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${redirectBase}/login?error=auth_failed`);
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_complete")
    .eq("id", userData.user?.id ?? "")
    .single();

  // Admin users skip onboarding (managed out-of-band by super admins)
  const isAdmin = profile?.role === "admin";

  // New non-admin users who haven't completed onboarding → send there first
  if (!isAdmin && !profile?.onboarding_complete) {
    return NextResponse.redirect(`${redirectBase}/onboarding`);
  }

  const roleTarget = ROLE_DEFAULTS[profile?.role ?? "volunteer"] ?? "/volunteer";
  const target = nextParam && ALLOWED_PATHS.includes(nextParam) ? nextParam : roleTarget;

  return NextResponse.redirect(`${redirectBase}${target}`);
}
