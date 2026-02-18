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

  const [usersRes, eventsRes, checkInsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id, name, location, created_at, created_by"),
    supabase.from("check_ins").select("event_id")
  ]);

  const userCount = usersRes.count ?? 0;
  const events = eventsRes.data ?? [];
  const checkIns = checkInsRes.data ?? [];

  const checkInsByEvent = checkIns.reduce<Record<string, number>>((acc, c) => {
    const eid = (c as { event_id?: string }).event_id ?? "none";
    acc[eid] = (acc[eid] ?? 0) + 1;
    return acc;
  }, {});

  const eventsWithStats = events.map((e) => ({
    ...e,
    check_in_count: checkInsByEvent[e.id] ?? 0
  }));

  return NextResponse.json({
    user_count: userCount,
    event_count: events.length,
    events: eventsWithStats
  });
}
