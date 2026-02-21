"use client";

import { useEffect, useState } from "react";
import { IconCalendar, IconMapPin } from "@/components/Icons";

type Event = { id: string; name: string; location: string; created_at: string; created_by?: string };

const GENEVA_VENUES = [
  "Palexpo, Geneva",
  "CICG — Centre International de Conférences Genève",
  "Maison de la Paix, Geneva",
  "SwissTech Convention Center, EPFL",
  "Hôtel des Bergues, Geneva",
  "Bâtiment des Forces Motrices, Geneva",
  "Geneva Arena",
  "Uni Dufour, University of Geneva",
  "Villa Moynier, ICRC",
  "Other Geneva venue"
];

const DEPOSIT_PER_LANYARD_CHF = 2;
const CO2_PER_LANYARD_G = 25;

export default function OrganizerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState("Pilot Event");
  const [location, setLocation] = useState("Palexpo, Geneva");
  const [customLocation, setCustomLocation] = useState("");
  const [expectedLanyards, setExpectedLanyards] = useState<number>(100);
  const [createStatus, setCreateStatus] = useState("");

  const effectiveLocation = location === "Other Geneva venue" ? customLocation : location;
  const depositTotal = expectedLanyards * DEPOSIT_PER_LANYARD_CHF;
  const estimatedCO2 = Math.round((expectedLanyards * CO2_PER_LANYARD_G) / 1000 * 10) / 10;

  const load = async () => {
    const res = await fetch("/api/events");
    const data = await res.json().catch(() => []);
    setEvents(Array.isArray(data) ? data : []);
  };

  const createEvent = async () => {
    setCreateStatus("");
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, location: effectiveLocation })
    });
    const data = await res.json();
    if (res.ok) {
      setCreateStatus("✓ Event registered — volunteers will now see your collection points");
      setName("Pilot Event");
      setLocation("Palexpo, Geneva");
      setCustomLocation("");
      setExpectedLanyards(100);
      await load();
    } else {
      setCreateStatus(`Error: ${(data as { error?: string }).error || "Failed"}`);
    }
  };

  useEffect(() => void load(), []);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
    } catch {
      return d;
    }
  };

  return (
    <main>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconCalendar />
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
            Organiser Dashboard
          </h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Register your Geneva event, declare the expected number of lanyards, and set collection points.
          After the event, you receive a deposit refund for returned lanyards and a verified
          sustainability impact certificate for your CSR reporting.
        </p>
      </header>

      {/* Deposit model explainer */}
      <section className="card" style={{ marginBottom: 24, padding: 20, background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "var(--color-primary)" }}>Deposit-and-return model</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          <li>Pay <strong>CHF 2 per lanyard</strong> as a refundable deposit when registering your event</li>
          <li>Volunteers collect lanyards at your collection points after the event</li>
          <li>Grade A &amp; B lanyards are returned to the library — deposit refunded within 5 working days</li>
          <li>Grade C lanyards go to upcycling / recycling partners — partial refund (CHF 1) applies</li>
          <li>You receive a <strong>verified impact certificate</strong> showing CO₂ avoided and lanyards diverted</li>
        </ul>
      </section>

      {/* Create event */}
      <section className="card-elevated" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 16px", color: "var(--color-text)" }}>
          Register a new event
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          Fill in the event details below. Volunteers will see this event and can check in at your collection points.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 440 }}>
          {/* Event name */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Event name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Geneva Sustainability Forum 2026"
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: "100%" }}
            />
          </div>

          {/* Venue */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Geneva venue *
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: "100%", background: "var(--color-surface)" }}
            >
              {GENEVA_VENUES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {location === "Other Geneva venue" && (
              <input
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter venue name and address"
                style={{ marginTop: 8, padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: "100%" }}
              />
            )}
          </div>

          {/* Expected lanyards */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Expected number of lanyards
            </label>
            <input
              type="number"
              min={1}
              value={expectedLanyards}
              onChange={(e) => setExpectedLanyards(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: 120 }}
            />
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
              Used to estimate your deposit and projected impact. Can be updated after registration.
            </p>
          </div>

          {/* Deposit estimate */}
          <div
            style={{
              padding: "16px 18px",
              background: "var(--color-accent-soft)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-primary-muted)"
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px", color: "var(--color-primary)" }}>
              Estimated deposit &amp; impact
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Metric label="Deposit (refundable)" value={`CHF ${depositTotal.toLocaleString()}`} />
              <Metric label="CO₂ if all diverted" value={`≈ ${estimatedCO2} kg`} />
              <Metric label="CHF 2 per lanyard" value="Refunded on return" />
              <Metric label="Impact certificate" value="Issued post-event" />
            </div>
          </div>

          <button
            onClick={createEvent}
            style={{
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 500,
              background: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              alignSelf: "flex-start"
            }}
          >
            Register event
          </button>
          {createStatus && <p style={{ fontSize: 14, color: "var(--color-primary-muted)" }}>{createStatus}</p>}
        </div>
      </section>

      {/* Events list */}
      <section>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 16, color: "var(--color-text)" }}>
          Your registered events
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20 }}>
          Each event can have multiple collection points where volunteers check in. Lanyards collected
          are graded and routed to reuse or recycling.
        </p>
        {events.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            No events yet. Register one above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {events.map((e) => (
              <div key={e.id} className="card-elevated" style={{ padding: 32 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ color: "var(--color-primary)" }}>
                    <IconMapPin />
                  </span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 8px", color: "var(--color-text)" }}>{e.name}</h3>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)" }}>
                      <strong>Venue:</strong> {e.location}
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-text-muted-2)" }}>
                      Registered {formatDate(e.created_at)}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 13,
                      color: "var(--color-primary-muted)",
                      textAlign: "right"
                    }}
                  >
                    <span>Deposit pending</span>
                    <span>Certificate: post-event</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{value}</div>
    </div>
  );
}
