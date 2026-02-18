"use client";

import { useState } from "react";
import { IconHand, IconMapPin, IconCamera } from "@/components/Icons";

export default function VolunteerPage() {
  const [coords, setCoords] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<string>("");

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setCoords("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(`${pos.coords.latitude}, ${pos.coords.longitude} (±${pos.coords.accuracy}m)`);
      },
      (err) => setCoords(`Error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const uploadPhoto = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({ error: "Unknown error" }));
    setUploadResult(JSON.stringify(data, null, 2));
  };

  return (
    <main>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconHand />
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
            Volunteer Dashboard
          </h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15 }}>
          Check in at collection points, capture photos for impact tracking, and contribute to events.
        </p>
      </header>

      <section className="card-elevated" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconMapPin />
          </span>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>
            GPS Location
          </h2>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Share your location when you arrive at a collection point. Used for check-in and route optimization.
        </p>
        <button
          onClick={getLocation}
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
          Get my location
        </button>
        <pre
          style={{
            marginTop: 16,
            padding: 16,
            background: "var(--color-bg)",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
            overflow: "auto"
          }}
        >
          {coords || "—"}
        </pre>
      </section>

      <section className="card-elevated">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconCamera />
          </span>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>
            Photo capture
          </h2>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Upload photos from collection events. Used for lanyard counting and impact documentation.
        </p>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadPhoto(f);
          }}
          style={{
            display: "block",
            marginBottom: 16,
            fontSize: 14
          }}
        />
        <pre
          style={{
            padding: 16,
            background: "var(--color-bg)",
            borderRadius: "var(--radius-sm)",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
            overflow: "auto"
          }}
        >
          {uploadResult || "—"}
        </pre>
      </section>
    </main>
  );
}
