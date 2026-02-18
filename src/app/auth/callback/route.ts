import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/volunteer";

  const redirectBase = `${requestUrl.protocol}//${requestUrl.host}`;

  if (!code) {
    return NextResponse.redirect(`${redirectBase}/login`);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${redirectBase}/login?error=auth_failed`);
  }

  const target = next.startsWith("/") ? next : `/${next}`;
  return NextResponse.redirect(`${redirectBase}${target}`);
}
