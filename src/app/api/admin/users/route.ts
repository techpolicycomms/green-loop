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
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, role, display_name, phone, city, organization_name, " +
      "onboarding_complete, availability, motivation, website, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Count check-ins per user
  const { data: checkIns } = await supabase.from("check_ins").select("user_id");
  const checkInCounts = (checkIns ?? []).reduce<Record<string, number>>((acc, c) => {
    const uid = String((c as { user_id?: string }).user_id ?? "");
    if (uid) acc[uid] = (acc[uid] ?? 0) + 1;
    return acc;
  }, {});

  const enriched = (data ?? []).map((u) => {
    const row = u as unknown as Record<string, unknown>;
    return {
      ...row,
      check_in_count: checkInCounts[String(row.id ?? "")] ?? 0
    };
  });

  return NextResponse.json(enriched);
}
