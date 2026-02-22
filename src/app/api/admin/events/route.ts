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

  const [eventsRes, checkInsRes, gradesRes] = await Promise.all([
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase.from("check_ins").select("event_id, user_id"),
    supabase.from("lanyard_grades").select("event_id, grade, quantity, material, created_at")
  ]);

  const events = eventsRes.data ?? [];
  const checkIns = checkInsRes.data ?? [];
  const grades = gradesRes.data ?? [];

  // Aggregate check-ins per event
  const checkInsByEvent = checkIns.reduce<Record<string, number>>((acc, c) => {
    const eid = String((c as { event_id?: string }).event_id ?? "");
    if (eid) acc[eid] = (acc[eid] ?? 0) + 1;
    return acc;
  }, {});

  // Aggregate grades per event
  type GradeStat = { total: number; A: number; B: number; C: number };
  const gradesByEvent = grades.reduce<Record<string, GradeStat>>((acc, g) => {
    const eid = String((g as { event_id?: string }).event_id ?? "");
    if (!eid) return acc;
    if (!acc[eid]) acc[eid] = { total: 0, A: 0, B: 0, C: 0 };
    const qty = Number((g as { quantity?: number }).quantity ?? 1);
    const gr = String((g as { grade?: string }).grade ?? "") as "A" | "B" | "C";
    acc[eid].total += qty;
    if (gr in acc[eid]) acc[eid][gr] += qty;
    return acc;
  }, {});

  const result = events.map((e) => ({
    ...e,
    check_in_count: checkInsByEvent[e.id] ?? 0,
    grades: gradesByEvent[e.id] ?? { total: 0, A: 0, B: 0, C: 0 }
  }));

  return NextResponse.json(result);
}
