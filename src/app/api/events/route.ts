import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/authz";
import { rateLimit } from "@/lib/rateLimit";

const CreateEvent = z.object({
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120)
});

export async function GET() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`events:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  await requireRole(["organizer", "admin"]);

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
  return NextResponse.json(data);
}
