import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/authz";
import { createServerClient } from "@/lib/supabaseServer";

const ActivitySchema = z.object({
  period_month: z.string().regex(/^\d{4}-\d{2}$/),
  scope: z.union([z.literal(1), z.literal(2)]),
  source_type: z.string().min(2).max(100),
  source_name: z.string().min(2).max(120),
  activity_value: z.number().min(0),
  activity_unit: z.string().min(1).max(40),
  emission_factor_location: z.number().min(0).optional(),
  emission_factor_market: z.number().min(0).optional(),
  data_quality: z.enum(["measured", "estimated", "assumed"]).optional(),
  notes: z.string().max(2000).optional()
});

function monthToDate(month: string) {
  return `${month}-01`;
}

export async function GET(req: Request) {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  const limit = Number(url.searchParams.get("limit") ?? "200");
  const supabase = await createServerClient();

  let query = supabase
    .from("emission_activity_logs")
    .select("*")
    .order("period_month", { ascending: false })
    .order("scope", { ascending: true })
    .order("source_type", { ascending: true })
    .limit(Number.isFinite(limit) ? Math.min(limit, 500) : 200);

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    query = query.eq("period_month", monthToDate(month));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  let userId: string | undefined;
  try {
    const auth = await requireRole(["admin"]);
    userId = auth.user.id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ActivitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerClient();
  const payload = parsed.data;
  const { data, error } = await supabase
    .from("emission_activity_logs")
    .upsert({
      period_month: monthToDate(payload.period_month),
      scope: payload.scope,
      source_type: payload.source_type,
      source_name: payload.source_name,
      activity_value: payload.activity_value,
      activity_unit: payload.activity_unit,
      emission_factor_location: payload.emission_factor_location ?? null,
      emission_factor_market: payload.emission_factor_market ?? null,
      data_quality: payload.data_quality ?? "measured",
      notes: payload.notes ?? null,
      created_by: userId
    }, { onConflict: "period_month,scope,source_type,source_name" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
