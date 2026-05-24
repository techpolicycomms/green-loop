import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  const limit = Number(url.searchParams.get("limit") ?? "24");
  const supabase = await createServerClient();

  let query = supabase
    .from("emission_reports_monthly")
    .select("*")
    .order("period_month", { ascending: false })
    .limit(Number.isFinite(limit) ? Math.min(limit, 120) : 24);

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    query = query.eq("period_month", `${month}-01`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}
