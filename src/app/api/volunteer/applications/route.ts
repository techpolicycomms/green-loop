import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";

// GET /api/volunteer/applications — list all applications for the current volunteer
export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const supabase = await createServerClient();

  const { data: applications, error } = await supabase
    .from("event_applications")
    .select("id, event_id, status, message, organizer_reply, created_at, updated_at")
    .eq("volunteer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Enrich with event details
  const eventIds = (applications ?? []).map((a) => a.event_id).filter(Boolean);
  const { data: events } = eventIds.length
    ? await supabase.from("events").select("id, name, location, created_at").in("id", eventIds)
    : { data: [] };

  const eventMap = Object.fromEntries((events ?? []).map((e) => [e.id, e]));

  const enriched = (applications ?? []).map((a) => ({
    ...a,
    event: eventMap[a.event_id] ?? null
  }));

  return NextResponse.json(enriched);
}
