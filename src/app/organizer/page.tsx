"use client";

import { useEffect, useState } from "react";
import { IconCalendar, IconMapPin } from "@/components/Icons";

export default function OrganizerPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [name, setName] = useState("Pilot Event");
  const [location, setLocation] = useState("Geneva");

  const load = async () => {
    const res = await fetch("/api/events");
    const data = await res.json().catch(() => []);
    setEvents(Array.isArray(data) ? data : []);
  };

  const createEvent = async () => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, location })
    });
    await load();
  };

  useEffect(() => void load(), []);

  return (
    <main>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconCalendar />
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
            Organizer Dashboard
          </h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15 }}>
          Create events, set locations, and coordinate volunteer participation.
        </p>
      </header>

      <section className="card-elevated" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 16px", color: "var(--color-text)" }}>
          Create new event
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          Add an event name and location. Volunteers will see it in their dashboard.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", marginBottom: 6 }}>
              Event name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "10px 14px",
                fontSize: 14,
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                minWidth: 180
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", marginBottom: 6 }}>
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                padding: "10px 14px",
                fontSize: 14,
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                minWidth: 160
              }}
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
              transition: "background var(--transition)"
            }}
          >
            Create
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 16, color: "var(--color-text)" }}>
          Events
        </h2>
        {events.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 14
            }}
          >
            No events yet. Create one above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.map((e) => (
              <div
                key={e.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16
                }}
              >
                <span style={{ color: "var(--color-primary)" }}>
                  <IconMapPin />
                </span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 15, color: "var(--color-text)" }}>{e.name}</strong>
                  <span style={{ color: "var(--color-text-muted)", marginLeft: 8 }}>— {e.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
