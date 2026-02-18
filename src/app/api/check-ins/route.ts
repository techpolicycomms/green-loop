import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";

const CheckInSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy_m: z.number().positive().optional(),
  event_id: z.string().uuid().optional()
});

export async function POST(req: Request) {
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
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
