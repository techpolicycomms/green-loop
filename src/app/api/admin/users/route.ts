import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET() {
  await requireRole(["admin"]);

  const supabase = await createServerClient();
  const { data, error } = await supabase.from("profiles").select("id,email,role").order("email");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
