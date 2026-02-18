import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return NextResponse.json({ user: data.user ?? null });
}
