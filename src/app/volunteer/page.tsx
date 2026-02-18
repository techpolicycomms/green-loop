"use client";

import { useState } from "react";

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
    const data = await res.json();
    setUploadResult(JSON.stringify(data, null, 2));
  };

  return (
    <main>
      <h2>Volunteer Dashboard</h2>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>GPS Location (for collection point check-in)</h3>
        <button onClick={getLocation} style={{ padding: "8px 12px", borderRadius: 8 }}>
          Get my location
        </button>
        <pre style={{ marginTop: 8 }}>{coords}</pre>
      </section>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Photo capture (for lanyard counting CV later)</h3>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadPhoto(f);
          }}
        />
        <pre style={{ marginTop: 8 }}>{uploadResult}</pre>
      </section>
    </main>
  );
}
