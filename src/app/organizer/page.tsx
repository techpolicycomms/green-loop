"use client";

import { useEffect, useState } from "react";
import { IconCalendar, IconMapPin } from "@/components/Icons";

type Event = { id: string; name: string; location: string; created_at: string; created_by?: string };

export default function OrganizerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState("Pilot Event");
  const [location, setLocation] = useState("Geneva");
  const [createStatus, setCreateStatus] = useState("");

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
      body: JSON.stringify({ name, location })
    });
    const data = await res.json();
    if (res.ok) {
      setCreateStatus("✓ Event created");
      setName("Pilot Event");
      setLocation("Geneva");
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
            Organizer Dashboard <span style={{ fontSize: "0.6em", fontWeight: 400, color: "var(--color-primary-muted)", marginLeft: 8 }}>· green-loop</span>
          </h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Create and manage events, set locations, and coordinate volunteer participation. You define collection points where volunteers check in, capture lanyards, and document impact.
        </p>
      </header>

      <section className="card" style={{ marginBottom: 24, padding: 20, background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "var(--color-primary)" }}>Organizer role</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          <li>Create events with name, location, and optional details</li>
          <li>Manage event listings visible to volunteers</li>
          <li>Coordinate volunteer participation and collection points</li>
          <li>View event participation (check-ins, photos) when available</li>
        </ul>
      </section>

      <section className="card-elevated" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 16px", color: "var(--color-text)" }}>
          Create new event
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          Add an event name and location. Volunteers will see it in their dashboard and can check in at collection points.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", marginBottom: 6 }}>Event name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Geneva Marathon 2025"
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", minWidth: 180, width: "100%", maxWidth: 400 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", marginBottom: 6 }}>Location *</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Geneva, Switzerland"
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", minWidth: 160, width: "100%", maxWidth: 400 }}
            />
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
            Create event
          </button>
          {createStatus && <p style={{ fontSize: 14, color: "var(--color-primary-muted)" }}>{createStatus}</p>}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 16, color: "var(--color-text)" }}>
          Your events
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20 }}>
          All events you&apos;ve created. Each event can have multiple collection points where volunteers check in.
        </p>
        {events.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            No events yet. Create one above.
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
                      <strong>Location:</strong> {e.location}
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-text-muted-2)" }}>
                      Created {formatDate(e.created_at)}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-primary-muted)" }}>
                    <span style={{ display: "inline-flex" }}><IconMapPin /></span>
                    <span>Collection point</span>
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
