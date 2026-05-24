import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabaseServer";
import { DEFAULT_FACTORS, GREEN_ICT_METHODOLOGY_VERSION } from "@/lib/greenIct";

type MonthlyReport = {
  period_month: string;
  scope1_kg: number;
  scope2_location_kg: number;
  scope2_market_kg: number;
  offsets_kg: number;
  residual_location_kg: number;
  residual_market_kg: number;
  methodology_version: string;
  generated_at: string;
  archive_sha256: string | null;
};

export const metadata: Metadata = {
  title: "Digital Emissions Transparency · LémanLoop",
  description: "Monthly Scope 1 and Scope 2 Green ICT audit reports, methodology, assumptions, and offsets."
};

function fmt(value: number) {
  return `${value.toFixed(2)} kgCO2e`;
}

function monthLabel(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "long" });
}

export default async function TransparencyPage() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("emission_reports_monthly")
    .select("period_month, scope1_kg, scope2_location_kg, scope2_market_kg, offsets_kg, residual_location_kg, residual_market_kg, methodology_version, generated_at, archive_sha256")
    .eq("published", true)
    .order("period_month", { ascending: false })
    .limit(24);

  const reports = ((data ?? []) as MonthlyReport[]).map((r) => ({
    ...r,
    scope1_kg: Number(r.scope1_kg ?? 0),
    scope2_location_kg: Number(r.scope2_location_kg ?? 0),
    scope2_market_kg: Number(r.scope2_market_kg ?? 0),
    offsets_kg: Number(r.offsets_kg ?? 0),
    residual_location_kg: Number(r.residual_location_kg ?? 0),
    residual_market_kg: Number(r.residual_market_kg ?? 0)
  }));

  return (
    <main>
      <div style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Transparency
          </p>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            Green ICT Audit (Scope 1 and Scope 2)
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.75 }}>
            LémanLoop publishes monthly digital operations emissions reports for Switzerland-based operations and EU cloud hosting.
            This page explains the methodology and provides archived monthly totals, assumptions, and offset progress.
          </p>
        </div>

        <section style={{ marginBottom: 34 }} className="card">
          <div style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Methodology</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--color-text-muted)", lineHeight: 1.7, fontSize: 14 }}>
              <li>Framework: GHG Protocol activity-data method (emissions = activity × emission factor).</li>
              <li>Scope 1: direct fuel emissions controlled by operations (if none, explicitly reported as zero).</li>
              <li>Scope 2: electricity from digital operations, reported as both location-based and market-based.</li>
              <li>Default factors (current baseline): Switzerland electricity = {DEFAULT_FACTORS.electricityChKgPerKwh} kgCO2e/kWh, EU cloud electricity = {DEFAULT_FACTORS.electricityEuCloudKgPerKwh} kgCO2e/kWh.</li>
              <li>Methodology version: <strong>{GREEN_ICT_METHODOLOGY_VERSION}</strong>.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: 34 }} className="card">
          <div style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>How monthly numbers are generated</h2>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.75, marginTop: 0 }}>
              Each month, a scheduled audit computes emissions from measured logs when available and uses explicit estimated
              electricity proxies for digital activity (check-ins, lanyard grading records, event activity, and active users).
              The report is archived with a SHA-256 checksum for traceability.
            </p>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.75, marginBottom: 0 }}>
              Offsets are reported separately and deducted only after gross emissions are calculated, so reductions and offsetting remain transparent.
            </p>
          </div>
        </section>

        <section className="card">
          <div style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Monthly archived reports</h2>
            {reports.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 0 }}>
                No monthly report has been published yet. The first report appears after the monthly Green ICT audit cron runs.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Scope 1</th>
                      <th>Scope 2 (Location)</th>
                      <th>Scope 2 (Market)</th>
                      <th>Offsets</th>
                      <th>Residual (Location)</th>
                      <th>Residual (Market)</th>
                      <th>Archive checksum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.period_month}>
                        <td>{monthLabel(r.period_month)}</td>
                        <td>{fmt(r.scope1_kg)}</td>
                        <td>{fmt(r.scope2_location_kg)}</td>
                        <td>{fmt(r.scope2_market_kg)}</td>
                        <td>{fmt(r.offsets_kg)}</td>
                        <td>{fmt(r.residual_location_kg)}</td>
                        <td>{fmt(r.residual_market_kg)}</td>
                        <td style={{ fontFamily: "monospace" }}>{r.archive_sha256 ? `${r.archive_sha256.slice(0, 12)}...` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <div style={{ marginTop: 28, display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Home</Link>
          <Link href="/about" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>About LémanLoop</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Privacy policy</Link>
        </div>
      </div>
    </main>
  );
}
