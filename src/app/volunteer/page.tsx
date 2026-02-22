"use client";

import { useState } from "react";
import { IconHand, IconMapPin, IconCamera } from "@/components/Icons";

const LANYARD_GRADES = [
  { value: "A", label: "Grade A — Excellent", description: "Clean, intact strap and clip. Ready for immediate reuse." },
  { value: "B", label: "Grade B — Good", description: "Minor soiling or wear. Suitable for reuse after cleaning." },
  { value: "C", label: "Grade C — Damaged", description: "Broken clip, frayed strap, or heavy soiling. Routed to upcycling or material recycling." }
];

const LANYARD_MATERIALS = [
  { value: "polyester", label: "Polyester (standard)" },
  { value: "recycled_pet", label: "Recycled PET" },
  { value: "bamboo", label: "Bamboo / natural fibre" },
  { value: "nylon", label: "Nylon" },
  { value: "unknown", label: "Unknown / mixed" }
];

const CO2_PER_LANYARD_G = 25; // grams CO2 saved per lanyard diverted from landfill

export default function VolunteerPage() {
  const [coords, setCoords] = useState<string>("");
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<string>("");
  const [grade, setGrade] = useState<string>("A");
  const [material, setMaterial] = useState<string>("polyester");
  const [lanyardCount, setLanyardCount] = useState<number>(1);

  const co2Saved = Math.round((lanyardCount * CO2_PER_LANYARD_G) / 1000 * 100) / 100;

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
      setSaveStatus("✓ Check-in saved — lanyards logged to circular loop");
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
      setUploadResult(`✓ Photo uploaded — ${lanyardCount} lanyard(s) documented (Grade ${grade}, ${material})`);
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
          You are the frontline of Geneva&apos;s circular lanyard economy. Collect, grade, and document lanyards
          at events — your work diverts waste from landfill, feeds the reuse library, and earns you karma
          points redeemable for event tickets and local rewards.
        </p>
      </header>

      {/* Role summary */}
      <section className="card" style={{ marginBottom: 24, padding: 20, background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "var(--color-primary)" }}>Your role in the loop</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          <li>Arrive at the collection point and GPS check in to confirm your presence</li>
          <li>Collect lanyards from event attendees as they leave</li>
          <li>Grade each batch: <strong>A</strong> (reuse), <strong>B</strong> (clean &amp; reuse), <strong>C</strong> (upcycle/recycle)</li>
          <li>Photograph the batch for impact documentation and counting</li>
          <li>Each lanyard you divert earns you karma points toward free event access</li>
        </ul>
      </section>

      {/* Karma / rewards */}
      <section className="card" style={{ marginBottom: 24, padding: 20, border: "1px solid var(--color-border)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "var(--color-text)" }}>Karma rewards</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { points: "10 pts", reward: "1 lanyard collected & documented" },
            { points: "100 pts", reward: "1 free community event ticket" },
            { points: "500 pts", reward: "Annual Geneva tram day-pass" },
            { points: "1 000 pts", reward: "Partner NGO membership" }
          ].map((r) => (
            <div
              key={r.reward}
              style={{
                padding: "12px 14px",
                background: "var(--color-bg)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)"
              }}
            >
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>{r.points}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{r.reward}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Lanyard grading */}
      <section className="card-elevated" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 8px", color: "var(--color-text)" }}>
          Lanyard grading &amp; details
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Record the condition and material of the batch before photographing. This determines the recycling route.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Count */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Number of lanyards in batch
            </label>
            <input
              type="number"
              min={1}
              value={lanyardCount}
              onChange={(e) => setLanyardCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                padding: "8px 12px",
                fontSize: 14,
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                width: 100
              }}
            />
            {lanyardCount > 0 && (
              <span style={{ marginLeft: 12, fontSize: 13, color: "var(--color-primary-muted)" }}>
                ≈ {co2Saved > 0 ? co2Saved : "<0.01"} kg CO₂ saved if diverted from landfill
              </span>
            )}
          </div>

          {/* Grade */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Condition grade
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LANYARD_GRADES.map((g) => (
                <label
                  key={g.value}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${grade === g.value ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: grade === g.value ? "var(--color-accent-soft)" : "var(--color-bg)",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="grade"
                    value={g.value}
                    checked={grade === g.value}
                    onChange={() => setGrade(g.value)}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{g.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Strap material
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              style={{
                padding: "8px 12px",
                fontSize: 14,
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-surface)",
                width: "100%",
                maxWidth: 280
              }}
            >
              {LANYARD_MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
              Material determines the recycling stream. Recycled PET and bamboo lanyards have priority reuse routes.
            </p>
          </div>
        </div>
      </section>

      {/* GPS */}
      <section className="card-elevated" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconMapPin />
          </span>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>
            GPS check-in
          </h2>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Share your location when you arrive at the collection point. Confirms your presence and
          activates your karma point accumulation for this session.
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
            Confirm check-in
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

      {/* Photo capture */}
      <section className="card-elevated">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconCamera />
          </span>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>
            Photo documentation
          </h2>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Photograph the collected batch laid out flat. The image is used for lanyard counting,
          impact verification, and the organiser&apos;s sustainability certificate.
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
