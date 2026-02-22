import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/authz";

export async function GET() {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const supabase = await createServerClient();

  // Fetch check-ins with user profiles and event details via separate queries (most reliable)
  const { data: checkIns, error } = await supabase
    .from("check_ins")
    .select("id, user_id, event_id, lat, lng, accuracy_m, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = checkIns ?? [];

  // Collect unique user and event IDs
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  const eventIds = [...new Set(rows.map((r) => r.event_id).filter(Boolean))];

  const [profilesRes, eventsRes] = await Promise.all([
    userIds.length
      ? supabase.from("profiles").select("id, email, display_name, role").in("id", userIds)
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? supabase.from("events").select("id, name, location").in("id", eventIds)
      : Promise.resolve({ data: [] })
  ]);

  const profileMap = Object.fromEntries(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  );
  const eventMap = Object.fromEntries(
    (eventsRes.data ?? []).map((e) => [e.id, e])
  );

  const enriched = rows.map((r) => ({
    ...r,
    profile: profileMap[r.user_id] ?? null,
    event: r.event_id ? (eventMap[r.event_id] ?? null) : null
  }));

  return NextResponse.json(enriched);
}
