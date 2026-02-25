import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/authz";
import { rateLimit } from "@/lib/rateLimit";

const GradeSchema = z.object({
  grade: z.enum(["A", "B", "C"]),
  material: z.string().max(50).nullable().optional(),
  quantity: z.number().int().min(1).max(10000),
  event_id: z.string().uuid(),
  check_in_id: z.string().uuid().nullable().optional()
});

// POST /api/grades — record lanyard grades without a photo (JSON body)
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`grades:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = GradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("lanyard_grades")
    .insert({
      user_id: user.id,
      event_id: parsed.data.event_id,
      check_in_id: parsed.data.check_in_id ?? null,
      photo_id: null,
      quantity: parsed.data.quantity,
      grade: parsed.data.grade,
      material: parsed.data.material ?? null
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
