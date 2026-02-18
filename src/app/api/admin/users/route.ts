import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    const status = msg === "UNAUTHENTICATED" ? 401 : 403;
    return NextResponse.json({ error: msg }, { status });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.from("profiles").select("id,email,role").order("email");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}
