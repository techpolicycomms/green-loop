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
  // Only honour an explicit `next` param; null means use role-based default
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

  // Look up the user's role to redirect to the right dashboard
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user?.id ?? "")
    .single();

  const roleTarget = ROLE_DEFAULTS[profile?.role ?? "volunteer"] ?? "/volunteer";
  const target = nextParam && ALLOWED_PATHS.includes(nextParam) ? nextParam : roleTarget;

  return NextResponse.redirect(`${redirectBase}${target}`);
}
