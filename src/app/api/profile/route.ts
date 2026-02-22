import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";
import { z } from "zod";
import { sendWelcomeVolunteer, sendWelcomeOrganizer } from "@/lib/mailer";

const ProfileSchema = z.object({
  role: z.enum(["volunteer", "organizer"]).optional(), // users can't self-assign admin
  extra_roles: z.array(z.enum(["volunteer", "organizer"])).max(2).optional(),
  active_mode: z.enum(["volunteer", "organizer"]).nullable().optional(),
  display_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar_url: z.string().max(500).nullable().optional(),
  onboarding_complete: z.boolean().optional(),
  // Volunteer
  availability: z.enum(["weekdays", "weekends", "both"]).nullable().optional(),
  motivation: z.string().max(500).nullable().optional(),
  // Organizer
  organization_name: z.string().max(200).nullable().optional(),
  website: z.string().max(200).nullable().optional(),
  typical_event_size: z.string().max(20).nullable().optional()
});

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createServerClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return NextResponse.json({ user, profile: profile ?? null });
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  let user;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerClient();

  // Fetch current profile to detect onboarding completion transition
  const { data: existing } = await supabase
    .from("profiles")
    .select("email, display_name, onboarding_complete, role")
    .eq("id", user.id)
    .single();

  const updateData = { ...parsed.data, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Send welcome email when onboarding is newly completed
  const justCompleted = !existing?.onboarding_complete && parsed.data.onboarding_complete === true;
  if (justCompleted) {
    const email = existing?.email || user.email || "";
    const newRole = parsed.data.role ?? existing?.role ?? "volunteer";
    const vars = { display_name: parsed.data.display_name || existing?.display_name || undefined, email };
    if (newRole === "organizer") {
      sendWelcomeOrganizer(email, user.id, vars).catch(console.error);
    } else {
      sendWelcomeVolunteer(email, user.id, vars).catch(console.error);
    }
  }

  return NextResponse.json(data);
}
