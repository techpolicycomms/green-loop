import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";
import { rateLimit } from "@/lib/rateLimit";
import { sendEventCreated } from "@/lib/mailer";

const CreateEvent = z.object({
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120)
});

export async function GET() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`events:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  let user;
  try {
    user = await requireUser();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const body = await req.json();
  const parsed = CreateEvent.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const { data, error } = await supabase.from("events").insert({
    name: parsed.data.name,
    location: parsed.data.location,
    created_by: userId
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Fire confirmation email to the organizer (non-blocking)
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name")
    .eq("id", user.id)
    .single();

  const email = profile?.email || user.email || "";
  if (email) {
    sendEventCreated(email, user.id, {
      display_name: profile?.display_name || undefined,
      email,
      event_name: parsed.data.name,
      event_location: parsed.data.location
    }).catch(console.error);
  }

  return NextResponse.json(data);
}
