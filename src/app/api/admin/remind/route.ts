import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { createServerClient } from "@/lib/supabaseServer";
import { z } from "zod";
import {
  sendEventReminder,
  sendDepositReminder,
  sendWelcomeVolunteer,
  sendWelcomeOrganizer
} from "@/lib/mailer";

const RemindSchema = z.object({
  user_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  type: z.enum(["event_reminder", "deposit_reminder", "role_change", "welcome"]),
  message: z.string().max(500).optional()
});

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const body = await req.json();
  const parsed = RemindSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { user_id, event_id, type, message } = parsed.data;
  const supabase = await createServerClient();

  // Fetch recipient profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name, role")
    .eq("id", user_id)
    .single();

  if (!profile?.email) {
    return NextResponse.json({ error: "User has no email address on record" }, { status: 400 });
  }

  // Fetch event if provided
  let eventName: string | undefined;
  let eventLocation: string | undefined;
  if (event_id) {
    const { data: ev } = await supabase.from("events").select("name, location").eq("id", event_id).single();
    eventName = ev?.name;
    eventLocation = ev?.location;
  }

  const vars = {
    display_name: profile.display_name || undefined,
    email: profile.email,
    event_name: eventName,
    event_location: eventLocation,
    reminder_message: message
  };

  let result;
  switch (type) {
    case "event_reminder":
      result = await sendEventReminder(profile.email, user_id, vars);
      break;
    case "deposit_reminder":
      result = await sendDepositReminder(profile.email, user_id, vars);
      break;
    case "welcome":
      result = profile.role === "organizer"
        ? await sendWelcomeOrganizer(profile.email, user_id, vars)
        : await sendWelcomeVolunteer(profile.email, user_id, vars);
      break;
    default:
      result = { ok: false, error: "Unknown type" };
  }

  if (!result.ok && result.error !== "no_api_key") {
    return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    sent: result.ok,
    message: result.ok
      ? `Email sent to ${profile.email}`
      : "Email queued (RESEND_API_KEY not configured — set it in Vercel env vars)",
    user_id,
    type
  });
}
