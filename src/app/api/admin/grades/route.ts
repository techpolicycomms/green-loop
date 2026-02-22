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

  const { data, error } = await supabase
    .from("lanyard_grades")
    .select("id, user_id, event_id, grade, quantity, material, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const grades = data ?? [];

  // Collect unique IDs for lookup
  const userIds = [...new Set(grades.map((g) => g.user_id).filter(Boolean))];
  const eventIds = [...new Set(grades.map((g) => g.event_id).filter(Boolean))];

  const [profilesRes, eventsRes] = await Promise.all([
    userIds.length
      ? supabase.from("profiles").select("id, email, display_name").in("id", userIds)
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

  const enriched = grades.map((g) => ({
    ...g,
    profile: profileMap[g.user_id] ?? null,
    event: g.event_id ? (eventMap[g.event_id] ?? null) : null
  }));

  // Aggregate stats
  const totalLanyards = grades.reduce((sum, g) => sum + (g.quantity ?? 0), 0);
  const byGrade = grades.reduce<Record<string, number>>((acc, g) => {
    acc[g.grade] = (acc[g.grade] ?? 0) + (g.quantity ?? 0);
    return acc;
  }, {});
  const byMaterial = grades.reduce<Record<string, number>>((acc, g) => {
    const m = g.material ?? "unknown";
    acc[m] = (acc[m] ?? 0) + (g.quantity ?? 0);
    return acc;
  }, {});

  return NextResponse.json({
    grades: enriched,
    stats: { totalLanyards, byGrade, byMaterial }
  });
}
