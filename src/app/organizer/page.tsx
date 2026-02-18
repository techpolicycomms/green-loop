"use client";

import { useEffect, useState } from "react";

export default function OrganizerPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [name, setName] = useState("Pilot Event");
  const [location, setLocation] = useState("Geneva");

  const load = async () => {
    const res = await fetch("/api/events");
    setEvents(await res.json());
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
      <h2>Organizer Dashboard</h2>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Create Event</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
          <button onClick={createEvent}>Create</button>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Events</h3>
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              <b>{e.name}</b> — {e.location}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
