import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";

const CO2_PER_LANYARD_G = 25;
const KARMA_PER_LANYARD = 10;

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const supabase = await createServerClient();

  const [checkInsRes, gradesRes] = await Promise.all([
    supabase
      .from("check_ins")
      .select("id, event_id, lat, lng, accuracy_m, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("lanyard_grades")
      .select("id, event_id, grade, quantity, material, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  const checkIns = checkInsRes.data ?? [];
  const grades = gradesRes.data ?? [];

  // Enrich with event details
  const eventIds = [
    ...new Set([
      ...checkIns.map((c) => c.event_id),
      ...grades.map((g) => g.event_id)
    ].filter(Boolean))
  ];

  const eventsRes = eventIds.length
    ? await supabase.from("events").select("id, name, location").in("id", eventIds)
    : { data: [] };

  const eventMap = Object.fromEntries(
    (eventsRes.data ?? []).map((e) => [e.id, e])
  );

  const enrichedCheckIns = checkIns.map((c) => ({
    ...c,
    event: c.event_id ? (eventMap[c.event_id] ?? null) : null
  }));

  const enrichedGrades = grades.map((g) => ({
    ...g,
    event: g.event_id ? (eventMap[g.event_id] ?? null) : null
  }));

  // Calculate stats
  const totalLanyards = grades.reduce((sum, g) => sum + (g.quantity ?? 0), 0);
  const karmaPoints = totalLanyards * KARMA_PER_LANYARD;
  const co2SavedKg = Math.round((totalLanyards * CO2_PER_LANYARD_G) / 1000 * 100) / 100;

  const byGrade = grades.reduce<Record<string, number>>((acc, g) => {
    acc[g.grade] = (acc[g.grade] ?? 0) + (g.quantity ?? 0);
    return acc;
  }, {});

  return NextResponse.json({
    check_ins: enrichedCheckIns,
    grades: enrichedGrades,
    stats: {
      total_checkins: checkIns.length,
      total_lanyards: totalLanyards,
      karma_points: karmaPoints,
      co2_saved_kg: co2SavedKg,
      by_grade: byGrade
    }
  });
}
