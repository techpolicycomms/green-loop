import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";

const UpdateSchema = z.object({
  status: z.enum(["approved", "rejected", "pending", "withdrawn"]),
  organizer_reply: z.string().max(1000).optional(),
  organizer_notes: z.string().max(500).optional()
});

// PATCH /api/events/applications/[id] — organiser or admin updates an application
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params;

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerClient();

  // Check caller's role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Fetch application + event to verify ownership
  const { data: application } = await supabase
    .from("event_applications")
    .select("id, event_id, volunteer_id, status")
    .eq("id", applicationId)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", application.event_id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOrganiser = event?.created_by === user.id;
  const isVolunteerOwner = application.volunteer_id === user.id;

  // Volunteers may only withdraw their own application
  if (!isAdmin && !isOrganiser) {
    if (isVolunteerOwner && parsed.data.status === "withdrawn") {
      const { data, error } = await supabase
        .from("event_applications")
        .update({ status: "withdrawn", updated_at: new Date().toISOString() })
        .eq("id", applicationId)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
    updated_at: new Date().toISOString()
  };
  if (parsed.data.organizer_reply !== undefined) updates.organizer_reply = parsed.data.organizer_reply;
  if (parsed.data.organizer_notes !== undefined) updates.organizer_notes = parsed.data.organizer_notes;

  const { data, error } = await supabase
    .from("event_applications")
    .update(updates)
    .eq("id", applicationId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
