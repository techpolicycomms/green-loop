"use client";

import { useState } from "react";
import { IconHand, IconMapPin, IconCamera } from "@/components/Icons";

export default function VolunteerPage() {
  const [coords, setCoords] = useState<string>("");
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<string>("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setCoords("Geolocation not supported.");
      return;
    }
    setCoords("Getting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const data = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
        setLastCoords(data);
        setCoords(`${data.lat}, ${data.lng} (±${Math.round(data.accuracy)}m)`);
      },
      (err) => setCoords(`Error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const saveLocation = async () => {
    if (!lastCoords) {
      setSaveStatus("Get your location first.");
      return;
    }
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lat: lastCoords.lat,
          lng: lastCoords.lng,
          accuracy_m: lastCoords.accuracy
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveStatus(`Error: ${(data as { error?: string }).error || "Failed to save"}`);
        return;
      }
      setSaveStatus("✓ Location saved to database");
    } catch {
      setSaveStatus("Error: Could not save");
    }
  };

  const uploadPhoto = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/uploads", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json().catch(() => ({ error: "Unknown error" }));
    if (res.ok && (data as { url?: string }).url) {
      setUploadResult(`✓ Uploaded! URL: ${(data as { url: string }).url}`);
    } else {
      setUploadResult(JSON.stringify(data, null, 2));
    }
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
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          You are the bridge between event lanyard recycling and the processing unit for waste materials. By collecting lanyards at events and documenting your check-ins, you enable the circular economy and earn karma points for free access to future events.
        </p>
      </header>

      <section className="card" style={{ marginBottom: 24, padding: 20, background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "var(--color-primary)" }}>How it works</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          <li>Check in at collection points with GPS to log your participation</li>
          <li>Capture photos of lanyards for impact tracking and lanyard counting</li>
          <li>Your contributions earn karma points for free event access</li>
          <li>You connect event waste to processing units, closing the recycling loop</li>
        </ul>
      </section>

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
          Share your location when you arrive at a collection point. Saves to database for check-in tracking and route optimization.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
          <button
            onClick={saveLocation}
            disabled={!lastCoords}
            style={{
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 500,
              background: lastCoords ? "var(--color-primary-muted)" : "var(--color-border)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: lastCoords ? "pointer" : "not-allowed",
              transition: "background var(--transition)"
            }}
          >
            Save to database
          </button>
        </div>
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
        {saveStatus && (
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--color-primary-muted)" }}>{saveStatus}</p>
        )}
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
          Upload photos from collection events for lanyard counting and impact documentation. Used for CV and impact reports.
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
