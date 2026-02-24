import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_FACTORS,
  estimateDigitalKwh,
  getDefaultFactor,
  getMonthBounds,
  getPreviousMonth,
  GREEN_ICT_METHODOLOGY_VERSION
} from "@/lib/greenIct";

type ActivityRow = {
  scope: number;
  source_type: string;
  source_name: string;
  activity_value: number;
  activity_unit: string;
  emission_factor_location: number | null;
  emission_factor_market: number | null;
  data_quality: string;
  notes: string | null;
};

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function fmt(num: number): number {
  return Number(num.toFixed(4));
}

function buildArchiveMarkdown(params: {
  month: string;
  generatedAtIso: string;
  scope1Kg: number;
  scope2LocationKg: number;
  scope2MarketKg: number;
  offsetsKg: number;
  residualLocationKg: number;
  residualMarketKg: number;
  activities: ActivityRow[];
  assumptions: Record<string, unknown>;
}) {
  const lines = [
    `# Green ICT Audit Report (${params.month})`,
    "",
    `Generated at: ${params.generatedAtIso}`,
    `Methodology version: ${GREEN_ICT_METHODOLOGY_VERSION}`,
    "",
    "## Summary",
    `- Scope 1: ${params.scope1Kg} kgCO2e`,
    `- Scope 2 (location-based): ${params.scope2LocationKg} kgCO2e`,
    `- Scope 2 (market-based): ${params.scope2MarketKg} kgCO2e`,
    `- Offsets retired: ${params.offsetsKg} kgCO2e`,
    `- Residual (location-based): ${params.residualLocationKg} kgCO2e`,
    `- Residual (market-based): ${params.residualMarketKg} kgCO2e`,
    "",
    "## Activities",
    ...params.activities.map(
      (a) =>
        `- Scope ${a.scope} · ${a.source_type} (${a.source_name}) = ${fmt(asNumber(a.activity_value))} ${a.activity_unit}`
    ),
    "",
    "## Assumptions",
    `- Swiss electricity default factor: ${DEFAULT_FACTORS.electricityChKgPerKwh} kgCO2e/kWh`,
    `- EU cloud electricity default factor: ${DEFAULT_FACTORS.electricityEuCloudKgPerKwh} kgCO2e/kWh`,
    `- Scope 2 split for estimated digital load: 70% Switzerland operations / 30% EU cloud`,
    "",
    "```json",
    JSON.stringify(params.assumptions, null, 2),
    "```",
    ""
  ];

  return lines.join("\n");
}

/**
 * Monthly Green ICT audit cron.
 * - Computes Scope 1 and Scope 2 emissions for a month.
 * - Applies Switzerland/EU defaults when measured factors are unavailable.
 * - Archives a transparent markdown report with SHA-256 checksum.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.GREEN_AUDIT_CRON_SECRET || process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  const url = new URL(req.url);
  const monthParam = url.searchParams.get("month");
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : getPreviousMonth();
  const { startIso, endIso } = getMonthBounds(month);
  const periodMonthDate = `${month}-01`;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Operational metrics used for transparent estimated kWh proxy.
  const [checkInsRes, gradesRes, eventsRes, usersRes] = await Promise.all([
    supabase.from("check_ins").select("id, user_id").gte("created_at", startIso).lte("created_at", endIso),
    supabase.from("lanyard_grades").select("id, user_id, quantity").gte("created_at", startIso).lte("created_at", endIso),
    supabase.from("events").select("id").gte("created_at", startIso).lte("created_at", endIso),
    supabase.from("profiles").select("id").gte("created_at", startIso).lte("created_at", endIso)
  ]);

  const checkIns = checkInsRes.data ?? [];
  const grades = gradesRes.data ?? [];
  const events = eventsRes.data ?? [];
  const users = usersRes.data ?? [];

  const activeUserIds = new Set<string>();
  for (const row of checkIns) {
    const id = (row as { user_id?: string }).user_id;
    if (id) activeUserIds.add(id);
  }
  for (const row of grades) {
    const id = (row as { user_id?: string }).user_id;
    if (id) activeUserIds.add(id);
  }

  const gradedQuantity = grades.reduce((sum, g) => sum + asNumber((g as { quantity?: unknown }).quantity), 0);
  const estimated = estimateDigitalKwh({
    checkIns: checkIns.length,
    gradeRecords: grades.length,
    gradedQuantity,
    createdEvents: events.length,
    activeUsers: Math.max(activeUserIds.size, users.length)
  });

  // Upsert system-estimated Scope 2 activity logs (can later be replaced/overridden by measured entries).
  const { error: upsertLogsError } = await supabase
    .from("emission_activity_logs")
    .upsert(
      [
        {
          period_month: periodMonthDate,
          scope: 2,
          source_type: "electricity_ch",
          source_name: "system_estimate_switzerland",
          activity_value: estimated.swissOpsKwh,
          activity_unit: "kWh",
          emission_factor_location: DEFAULT_FACTORS.electricityChKgPerKwh,
          emission_factor_market: DEFAULT_FACTORS.electricityChKgPerKwh,
          data_quality: "estimated",
          notes: "Estimated from platform activity proxies for Swiss operations."
        },
        {
          period_month: periodMonthDate,
          scope: 2,
          source_type: "electricity_eu_cloud",
          source_name: "system_estimate_eu_cloud",
          activity_value: estimated.euCloudKwh,
          activity_unit: "kWh",
          emission_factor_location: DEFAULT_FACTORS.electricityEuCloudKgPerKwh,
          emission_factor_market: DEFAULT_FACTORS.electricityEuCloudKgPerKwh,
          data_quality: "estimated",
          notes: "Estimated from platform activity proxies for EU cloud hosting."
        }
      ],
      { onConflict: "period_month,scope,source_type,source_name" }
    );

  if (upsertLogsError) {
    return NextResponse.json({ error: upsertLogsError.message }, { status: 400 });
  }

  const { data: activityRows, error: activityError } = await supabase
    .from("emission_activity_logs")
    .select("scope, source_type, source_name, activity_value, activity_unit, emission_factor_location, emission_factor_market, data_quality, notes")
    .eq("period_month", periodMonthDate);

  if (activityError) {
    return NextResponse.json({ error: activityError.message }, { status: 400 });
  }

  const activities = (activityRows ?? []) as ActivityRow[];
  let scope1Kg = 0;
  let scope2LocationKg = 0;
  let scope2MarketKg = 0;

  for (const row of activities) {
    const factorLocation = row.emission_factor_location ?? getDefaultFactor(row.scope, row.source_type);
    const factorMarket = row.emission_factor_market ?? factorLocation;
    const value = asNumber(row.activity_value);
    const locationKg = value * factorLocation;
    const marketKg = value * factorMarket;

    if (row.scope === 1) {
      scope1Kg += locationKg;
    } else if (row.scope === 2) {
      scope2LocationKg += locationKg;
      scope2MarketKg += marketKg;
    }
  }

  const { data: offsetsRows, error: offsetsError } = await supabase
    .from("emission_offsets")
    .select("quantity_kg")
    .eq("period_month", periodMonthDate)
    .eq("status", "retired");

  if (offsetsError) {
    return NextResponse.json({ error: offsetsError.message }, { status: 400 });
  }

  const offsetsKg = (offsetsRows ?? []).reduce((sum, row) => sum + asNumber((row as { quantity_kg?: unknown }).quantity_kg), 0);
  const grossLocationKg = scope1Kg + scope2LocationKg;
  const grossMarketKg = scope1Kg + scope2MarketKg;
  const residualLocationKg = Math.max(0, grossLocationKg - offsetsKg);
  const residualMarketKg = Math.max(0, grossMarketKg - offsetsKg);

  const assumptions = {
    electricity_factor_switzerland_kg_per_kwh: DEFAULT_FACTORS.electricityChKgPerKwh,
    electricity_factor_eu_cloud_kg_per_kwh: DEFAULT_FACTORS.electricityEuCloudKgPerKwh,
    estimate_split: { swiss_ops_share: 0.7, eu_cloud_share: 0.3 },
    month_window_utc: { start: startIso, end: endIso }
  };

  const metrics = {
    check_ins: checkIns.length,
    grade_records: grades.length,
    graded_quantity: gradedQuantity,
    events_created: events.length,
    active_users_proxy: Math.max(activeUserIds.size, users.length),
    estimated_kwh: estimated
  };

  const generatedAtIso = new Date().toISOString();
  const archiveMarkdown = buildArchiveMarkdown({
    month,
    generatedAtIso,
    scope1Kg: fmt(scope1Kg),
    scope2LocationKg: fmt(scope2LocationKg),
    scope2MarketKg: fmt(scope2MarketKg),
    offsetsKg: fmt(offsetsKg),
    residualLocationKg: fmt(residualLocationKg),
    residualMarketKg: fmt(residualMarketKg),
    activities,
    assumptions
  });
  const archiveSha256 = createHash("sha256").update(archiveMarkdown).digest("hex");

  const { error: reportError } = await supabase.from("emission_reports_monthly").upsert(
    {
      period_month: periodMonthDate,
      methodology_version: GREEN_ICT_METHODOLOGY_VERSION,
      scope1_kg: fmt(scope1Kg),
      scope2_location_kg: fmt(scope2LocationKg),
      scope2_market_kg: fmt(scope2MarketKg),
      gross_location_kg: fmt(grossLocationKg),
      gross_market_kg: fmt(grossMarketKg),
      offsets_kg: fmt(offsetsKg),
      residual_location_kg: fmt(residualLocationKg),
      residual_market_kg: fmt(residualMarketKg),
      assumptions,
      metrics,
      archive_markdown: archiveMarkdown,
      archive_sha256: archiveSha256,
      generated_at: generatedAtIso,
      published: true
    },
    { onConflict: "period_month" }
  );

  if (reportError) {
    return NextResponse.json({ error: reportError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    month,
    summary: {
      scope1_kg: fmt(scope1Kg),
      scope2_location_kg: fmt(scope2LocationKg),
      scope2_market_kg: fmt(scope2MarketKg),
      offsets_kg: fmt(offsetsKg),
      residual_location_kg: fmt(residualLocationKg),
      residual_market_kg: fmt(residualMarketKg)
    },
    metrics
  });
}
