import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/authz";
import { createServerClient } from "@/lib/supabaseServer";

const OffsetSchema = z.object({
  period_month: z.string().regex(/^\d{4}-\d{2}$/),
  provider: z.string().min(2).max(120),
  project_name: z.string().min(2).max(200),
  registry_name: z.string().max(120).optional(),
  credit_type: z.string().min(2).max(80).optional(),
  quantity_kg: z.number().min(0),
  vintage_year: z.number().int().min(1990).max(2100).optional(),
  retirement_reference: z.string().max(180).optional(),
  certificate_url: z.string().url().optional(),
  status: z.enum(["planned", "purchased", "retired"]).optional(),
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
    .from("emission_offsets")
    .select("*")
    .order("period_month", { ascending: false })
    .order("created_at", { ascending: false })
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
  const parsed = OffsetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("emission_offsets")
    .insert({
      period_month: monthToDate(payload.period_month),
      provider: payload.provider,
      project_name: payload.project_name,
      registry_name: payload.registry_name ?? null,
      credit_type: payload.credit_type ?? "carbon_credit",
      quantity_kg: payload.quantity_kg,
      vintage_year: payload.vintage_year ?? null,
      retirement_reference: payload.retirement_reference ?? null,
      certificate_url: payload.certificate_url ?? null,
      status: payload.status ?? "planned",
      notes: payload.notes ?? null,
      created_by: userId
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
