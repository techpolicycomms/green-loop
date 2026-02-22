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
    .select("role, email, created_at")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({ user: data.user, profile: profile ?? null });
}
