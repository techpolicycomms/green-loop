import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createServerClient();

  // Exchange code for session and set auth cookies
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login`);

  return NextResponse.redirect(`${origin}/volunteer`);
}
