import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";

const ApplySchema = z.object({
  message: z.string().max(500).optional()
});

// POST /api/events/[id]/applications — volunteer applies to an event
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerClient();

  // Check event exists
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("event_applications")
    .insert({
      event_id: eventId,
      volunteer_id: user.id,
      status: "pending",
      message: parsed.data.message ?? null
    })
    .select()
    .single();

  if (error) {
    // Unique violation = already applied
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already applied to this event" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

// GET /api/events/[id]/applications — organiser or admin lists applications
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const supabase = await createServerClient();

  // Verify caller is organiser of this event or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: event } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const isAdmin = profile?.role === "admin";
  const isOrganiser = event.created_by === user.id;

  if (!isAdmin && !isOrganiser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch applications
  const { data: applications, error } = await supabase
    .from("event_applications")
    .select("id, volunteer_id, status, message, organizer_reply, organizer_notes, created_at, updated_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Enrich with volunteer profiles
  const volunteerIds = (applications ?? []).map((a) => a.volunteer_id).filter(Boolean);
  const { data: profiles } = volunteerIds.length
    ? await supabase
        .from("profiles")
        .select("id, email, display_name, phone, city, availability, motivation")
        .in("id", volunteerIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const enriched = (applications ?? []).map((a) => ({
    ...a,
    volunteer: profileMap[a.volunteer_id] ?? null
  }));

  return NextResponse.json(enriched);
}
