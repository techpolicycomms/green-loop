import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";
import { sendCheckInConfirmed } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

const CheckInSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy_m: z.number().positive().optional(),
  event_id: z.string().uuid().optional()
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`checkin:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = CheckInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("check_ins")
      .insert({
        user_id: user.id,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        accuracy_m: parsed.data.accuracy_m ?? null,
        event_id: parsed.data.event_id ?? null
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Fire confirmation email (non-blocking)
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("id", user.id)
      .single();

    let eventName: string | undefined;
    if (parsed.data.event_id) {
      const { data: ev } = await supabase.from("events").select("name").eq("id", parsed.data.event_id).single();
      eventName = ev?.name;
    }

    const email = profile?.email || user.email || "";
    if (email) {
      sendCheckInConfirmed(email, user.id, {
        display_name: profile?.display_name || undefined,
        email,
        event_name: eventName,
        lat: parsed.data.lat,
        lng: parsed.data.lng
      }).catch(console.error);
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
