"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ActivityRow = {
  id: string;
  period_month: string;
  scope: number;
  source_type: string;
  source_name: string;
  activity_value: number;
  activity_unit: string;
  emission_factor_location: number | null;
  emission_factor_market: number | null;
  data_quality: string;
};

type OffsetRow = {
  id: string;
  period_month: string;
  provider: string;
  project_name: string;
  quantity_kg: number;
  status: string;
};

type ReportRow = {
  period_month: string;
  scope1_kg: number;
  scope2_location_kg: number;
  scope2_market_kg: number;
  offsets_kg: number;
  residual_location_kg: number;
  residual_market_kg: number;
};

function currentMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function AdminEmissionsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState("");
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [offsets, setOffsets] = useState<OffsetRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);

  const [activityForm, setActivityForm] = useState({
    scope: "2",
    source_type: "electricity_ch",
    source_name: "measured_input",
    activity_value: "0",
    activity_unit: "kWh",
    emission_factor_location: "",
    emission_factor_market: "",
    data_quality: "measured",
    notes: ""
  });

  const [offsetForm, setOffsetForm] = useState({
    provider: "",
    project_name: "",
    quantity_kg: "0",
    status: "retired",
    notes: ""
  });

  const monthInput = useMemo(() => `${month}-01`, [month]);

  const refresh = useCallback(async () => {
    const [a, o, r] = await Promise.all([
      fetch(`/api/admin/emissions/activity?month=${month}`).then((x) => x.json()),
      fetch(`/api/admin/emissions/offsets?month=${month}`).then((x) => x.json()),
      fetch("/api/admin/emissions/reports?limit=24").then((x) => x.json())
    ]);
    setActivities(Array.isArray(a) ? a : []);
    setOffsets(Array.isArray(o) ? o : []);
    setReports(Array.isArray(r) ? r : []);
  }, [month]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitActivity = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Saving activity...");
    const body = {
      period_month: month,
      scope: Number(activityForm.scope),
      source_type: activityForm.source_type.trim(),
      source_name: activityForm.source_name.trim(),
      activity_value: Number(activityForm.activity_value),
      activity_unit: activityForm.activity_unit.trim(),
      emission_factor_location: activityForm.emission_factor_location ? Number(activityForm.emission_factor_location) : undefined,
      emission_factor_market: activityForm.emission_factor_market ? Number(activityForm.emission_factor_market) : undefined,
      data_quality: activityForm.data_quality,
      notes: activityForm.notes.trim() || undefined
    };
    const res = await fetch("/api/admin/emissions/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(`Activity failed: ${err.error ? JSON.stringify(err.error) : "Unknown error"}`);
      return;
    }
    setStatus("Activity saved.");
    await refresh();
  };

  const submitOffset = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Saving offset...");
    const body = {
      period_month: month,
      provider: offsetForm.provider.trim(),
      project_name: offsetForm.project_name.trim(),
      quantity_kg: Number(offsetForm.quantity_kg),
      status: offsetForm.status,
      notes: offsetForm.notes.trim() || undefined
    };
    const res = await fetch("/api/admin/emissions/offsets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(`Offset failed: ${err.error ? JSON.stringify(err.error) : "Unknown error"}`);
      return;
    }
    setStatus("Offset saved.");
    await refresh();
  };

  const runAudit = async () => {
    setStatus("Running monthly audit...");
    const res = await fetch("/api/admin/emissions/run-audit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ month })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(`Audit failed: ${payload.error ? JSON.stringify(payload.error) : "Unknown error"}`);
      return;
    }
    setStatus("Monthly audit completed and archived.");
    await refresh();
  };

  return (
    <main>
      <div style={{ maxWidth: 980 }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Admin
          </p>
          <h1 style={{ margin: "0 0 8px" }}>Green ICT Emissions Manager</h1>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Enter measured Scope 1 and Scope 2 activity data, add offset records, and generate monthly audit reports.
          </p>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 13 }}>
              Reporting month:
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
            <button type="button" onClick={runAudit} style={{ padding: "8px 12px", borderRadius: 8 }}>
              Run Monthly Audit
            </button>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Period key: {monthInput}
            </span>
          </div>
          {status && <p style={{ fontSize: 13, marginTop: 10 }}>{status}</p>}
        </div>

        <section className="card" style={{ padding: 16, marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>Add or update activity input</h2>
          <form onSubmit={submitActivity} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(220px,1fr))", gap: 10 }}>
            <label>Scope
              <select value={activityForm.scope} onChange={(e) => setActivityForm((p) => ({ ...p, scope: e.target.value }))}>
                <option value="1">1 (Direct)</option>
                <option value="2">2 (Electricity)</option>
              </select>
            </label>
            <label>Source type
              <input value={activityForm.source_type} onChange={(e) => setActivityForm((p) => ({ ...p, source_type: e.target.value }))} />
            </label>
            <label>Source name
              <input value={activityForm.source_name} onChange={(e) => setActivityForm((p) => ({ ...p, source_name: e.target.value }))} />
            </label>
            <label>Activity value
              <input type="number" step="0.0001" value={activityForm.activity_value} onChange={(e) => setActivityForm((p) => ({ ...p, activity_value: e.target.value }))} />
            </label>
            <label>Activity unit
              <input value={activityForm.activity_unit} onChange={(e) => setActivityForm((p) => ({ ...p, activity_unit: e.target.value }))} />
            </label>
            <label>Data quality
              <select value={activityForm.data_quality} onChange={(e) => setActivityForm((p) => ({ ...p, data_quality: e.target.value }))}>
                <option value="measured">measured</option>
                <option value="estimated">estimated</option>
                <option value="assumed">assumed</option>
              </select>
            </label>
            <label>EF location (optional)
              <input type="number" step="0.00000001" value={activityForm.emission_factor_location} onChange={(e) => setActivityForm((p) => ({ ...p, emission_factor_location: e.target.value }))} />
            </label>
            <label>EF market (optional)
              <input type="number" step="0.00000001" value={activityForm.emission_factor_market} onChange={(e) => setActivityForm((p) => ({ ...p, emission_factor_market: e.target.value }))} />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>Notes
              <input value={activityForm.notes} onChange={(e) => setActivityForm((p) => ({ ...p, notes: e.target.value }))} />
            </label>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" style={{ padding: "8px 12px", borderRadius: 8 }}>Save activity</button>
            </div>
          </form>
        </section>

        <section className="card" style={{ padding: 16, marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>Add offset record</h2>
          <form onSubmit={submitOffset} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(220px,1fr))", gap: 10 }}>
            <label>Provider
              <input value={offsetForm.provider} onChange={(e) => setOffsetForm((p) => ({ ...p, provider: e.target.value }))} />
            </label>
            <label>Project
              <input value={offsetForm.project_name} onChange={(e) => setOffsetForm((p) => ({ ...p, project_name: e.target.value }))} />
            </label>
            <label>Quantity (kgCO2e)
              <input type="number" step="0.0001" value={offsetForm.quantity_kg} onChange={(e) => setOffsetForm((p) => ({ ...p, quantity_kg: e.target.value }))} />
            </label>
            <label>Status
              <select value={offsetForm.status} onChange={(e) => setOffsetForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="planned">planned</option>
                <option value="purchased">purchased</option>
                <option value="retired">retired</option>
              </select>
            </label>
            <label style={{ gridColumn: "1 / -1" }}>Notes
              <input value={offsetForm.notes} onChange={(e) => setOffsetForm((p) => ({ ...p, notes: e.target.value }))} />
            </label>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" style={{ padding: "8px 12px", borderRadius: 8 }}>Save offset</button>
            </div>
          </form>
        </section>

        <section className="card" style={{ padding: 16, marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>Current month activity entries</h2>
          <pre style={{ overflowX: "auto", fontSize: 12 }}>{JSON.stringify(activities, null, 2)}</pre>
        </section>

        <section className="card" style={{ padding: 16, marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>Current month offsets</h2>
          <pre style={{ overflowX: "auto", fontSize: 12 }}>{JSON.stringify(offsets, null, 2)}</pre>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Recent reports</h2>
          <pre style={{ overflowX: "auto", fontSize: 12 }}>{JSON.stringify(reports, null, 2)}</pre>
        </section>

        <div style={{ marginTop: 18, display: "flex", gap: 14 }}>
          <Link href="/admin">← Back to Admin</Link>
          <Link href="/transparency">Public Transparency Page</Link>
        </div>
      </div>
    </main>
  );
}
