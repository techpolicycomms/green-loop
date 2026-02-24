"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLeaf } from "@/components/Icons";

type Role = "volunteer" | "organizer";

type FormData = {
  role: Role | null;
  display_name: string;
  phone: string;
  city: string;
  // Volunteer
  availability: string;
  motivation: string;
  // Organizer
  organization_name: string;
  website: string;
  typical_event_size: string;
};

const INITIAL: FormData = {
  role: null,
  display_name: "",
  phone: "",
  city: "",
  availability: "weekends",
  motivation: "",
  organization_name: "",
  website: "",
  typical_event_size: "50-200"
};

const STEP_LABELS = ["Choose your role", "Your details"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.display_name.trim()) { setError("Please enter your name."); return; }
    if (form.role === "organizer" && !form.organization_name.trim()) {
      setError("Please enter your organisation name."); return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        role: form.role,
        display_name: form.display_name.trim(),
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        onboarding_complete: true
      };
      if (form.role === "volunteer") {
        payload.availability = form.availability;
        payload.motivation = form.motivation.trim() || null;
      } else {
        payload.organization_name = form.organization_name.trim();
        payload.website = form.website.trim() || null;
        payload.typical_event_size = form.typical_event_size;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to save profile");
      }
      router.replace(form.role === "organizer" ? "/organizer" : "/volunteer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ color: "var(--color-primary)", display: "inline-block", marginBottom: 8 }}>
            <IconLeaf />
          </span>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-text)" }}>LémanLoop</div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>Circular lanyards · Geneva</div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, alignItems: "center", justifyContent: "center" }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600,
                background: i <= step ? "var(--color-primary)" : "var(--color-border)",
                color: i <= step ? "#fff" : "var(--color-text-muted)"
              }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: i === step ? "var(--color-text)" : "var(--color-text-muted)", fontWeight: i === step ? 600 : 400 }}>{label}</span>
              {i < STEP_LABELS.length - 1 && <div style={{ width: 32, height: 1, background: "var(--color-border)", marginLeft: 4 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 36 }}>

          {/* ── Step 0: Role selection ── */}
          {step === 0 && (
            <>
              <h2 style={{ margin: "0 0 8px", fontSize: "1.25rem", fontWeight: 700 }}>What brings you to LémanLoop?</h2>
              <p style={{ margin: "0 0 28px", fontSize: 14, color: "var(--color-text-muted)" }}>
                Choose the role that best describes how you&apos;ll participate. Your dashboard and communications will be tailored to you.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <RoleCard
                  role="volunteer"
                  selected={form.role === "volunteer"}
                  onSelect={() => set("role", "volunteer")}
                  emoji="🌿"
                  title="Volunteer"
                  desc="I want to collect lanyards at events, grade them, and earn karma points."
                  color={{ border: "#15803d", bg: "#dcfce7", text: "#166534" }}
                />
                <RoleCard
                  role="organizer"
                  selected={form.role === "organizer"}
                  onSelect={() => set("role", "organizer")}
                  emoji="🗂️"
                  title="Event Organizer"
                  desc="I run events in Geneva and want to offer lanyard collection to attendees."
                  color={{ border: "#1d4ed8", bg: "#dbeafe", text: "#1e3a8a" }}
                />
              </div>
              <button
                disabled={!form.role}
                onClick={() => setStep(1)}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: "var(--radius-sm)",
                  background: form.role ? "var(--color-primary)" : "var(--color-border)",
                  color: form.role ? "#fff" : "var(--color-text-muted)",
                  border: "none", cursor: form.role ? "pointer" : "not-allowed",
                  fontSize: 15, fontWeight: 600, transition: "all var(--transition)"
                }}
              >
                Continue →
              </button>
            </>
          )}

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700 }}>
                {form.role === "organizer" ? "Tell us about your organisation" : "Tell us about yourself"}
              </h2>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--color-text-muted)" }}>
                This helps us personalise your experience and communications.
              </p>

              <Field label="Your name" required>
                <input
                  type="text" placeholder="e.g. Sophie Müller" value={form.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  style={inputStyle}
                />
              </Field>

              {form.role === "organizer" && (
                <Field label="Organisation / Company name" required>
                  <input
                    type="text" placeholder="e.g. Palexpo SA" value={form.organization_name}
                    onChange={(e) => set("organization_name", e.target.value)}
                    style={inputStyle}
                  />
                </Field>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Phone (optional)">
                  <input
                    type="tel" placeholder="+41 79 000 00 00" value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    style={inputStyle}
                  />
                </Field>
                <Field label="City / District">
                  <input
                    type="text" placeholder="e.g. Carouge" value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {form.role === "volunteer" && (
                <>
                  <Field label="When are you typically available?">
                    <select value={form.availability} onChange={(e) => set("availability", e.target.value)} style={inputStyle}>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="both">Both — flexible</option>
                    </select>
                  </Field>
                  <Field label="Why do you want to volunteer? (optional)">
                    <textarea
                      rows={3} placeholder="e.g. I work in sustainability and want to act locally..."
                      value={form.motivation} onChange={(e) => set("motivation", e.target.value)}
                      style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                    />
                  </Field>
                </>
              )}

              {form.role === "organizer" && (
                <>
                  <Field label="Website (optional)">
                    <input
                      type="url" placeholder="https://yourorg.ch" value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Typical event size">
                    <select value={form.typical_event_size} onChange={(e) => set("typical_event_size", e.target.value)} style={inputStyle}>
                      <option value="<50">Small — fewer than 50 attendees</option>
                      <option value="50-200">Medium — 50 to 200 attendees</option>
                      <option value="200-500">Large — 200 to 500 attendees</option>
                      <option value="500+">Major — 500+ attendees</option>
                    </select>
                  </Field>
                </>
              )}

              {error && (
                <p style={{ color: "#b91c1c", fontSize: 14, margin: "8px 0 0", padding: "10px 14px", background: "#fee2e2", borderRadius: "var(--radius-sm)" }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(0)} style={{ ...secondaryBtn }}>← Back</button>
                <button
                  onClick={submit} disabled={saving}
                  style={{ flex: 1, padding: "12px 0", borderRadius: "var(--radius-sm)", background: "var(--color-primary)", color: "#fff", border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Setting up your account…" : "Complete setup →"}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-muted)", marginTop: 16 }}>
          You can update these details anytime from your profile settings.
        </p>
      </div>
    </div>
  );
}

function RoleCard({ role, selected, onSelect, emoji, title, desc, color }: {
  role: string; selected: boolean; onSelect: () => void;
  emoji: string; title: string; desc: string;
  color: { border: string; bg: string; text: string };
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left", padding: "20px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
        border: `2px solid ${selected ? color.border : "var(--color-border)"}`,
        background: selected ? color.bg : "var(--color-surface)",
        transition: "all var(--transition)", width: "100%"
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: selected ? color.text : "var(--color-text)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#b91c1c", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", fontSize: 14,
  border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
  background: "var(--color-bg)", color: "var(--color-text)",
  boxSizing: "border-box", outline: "none", fontFamily: "inherit"
};

const secondaryBtn: React.CSSProperties = {
  padding: "12px 20px", borderRadius: "var(--radius-sm)",
  background: "transparent", color: "var(--color-text-muted)",
  border: "1px solid var(--color-border)", cursor: "pointer", fontSize: 14,
  fontWeight: 500
};
