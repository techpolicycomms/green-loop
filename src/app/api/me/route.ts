import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ user: null, profile: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, extra_roles, active_mode, email, display_name, avatar_url, onboarding_complete, sustainability_score, badges, created_at")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({ user: data.user, profile: profile ?? null });
}
