"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCalendar, IconMapPin, IconHand, IconStar, IconCheckCircle, IconCamera } from "@/components/Icons";

function getEventDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}
const EVENT_DATE_ISO = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; })();

const SCENARIOS = [
  { id: "register", label: "1. Register event" },
  { id: "browse", label: "2. Volunteers browse" },
  { id: "apply", label: "3. Apply & approve" },
  { id: "checkin", label: "4. GPS check-in" },
  { id: "grade", label: "5. Grade lanyards" },
  { id: "photo", label: "6. Photograph batch" },
  { id: "impact", label: "7. Impact report" }
];

export default function DemoPage() {
  const [step, setStep] = useState("register");
  const eventDate = getEventDate();
  const eventDateStr = eventDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <main>
      <header style={{ marginBottom: 28, textAlign: "center" }}>
        <span className="badge badge-success" style={{ marginBottom: 12, display: "inline-block" }}>INVESTOR DEMO</span>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          LémanLoop — Full Service Simulation
        </h1>
        <p style={{ color: "var(--color-text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          A complete walkthrough of a lanyard collection at the ITU Plenipotentiary Conference 2026
          at ITU Office, Place des Nations, Geneva — scheduled for {eventDateStr} at 9:00 AM.
        </p>
      </header>

      {/* Step tabs */}
      <nav style={{ display: "flex", gap: 2, marginBottom: 32, overflowX: "auto", borderBottom: "2px solid var(--color-border)", paddingBottom: 0 }}>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            style={{
              padding: "10px 16px", fontSize: 13, fontWeight: step === s.id ? 700 : 500, whiteSpace: "nowrap",
              background: "transparent", border: "none", cursor: "pointer",
              color: step === s.id ? "var(--color-primary)" : "var(--color-text-muted)",
              borderBottom: step === s.id ? "2px solid var(--color-primary)" : "2px solid transparent",
              marginBottom: -2, fontFamily: "var(--font-sans)"
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {step === "register" && <RegisterStep />}
      {step === "browse" && <BrowseStep />}
      {step === "apply" && <ApplyStep />}
      {step === "checkin" && <CheckInStep />}
      {step === "grade" && <GradeStep />}
      {step === "photo" && <PhotoStep />}
      {step === "impact" && <ImpactStep />}

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Back to homepage</Link>
      </div>
    </main>
  );
}

function StepHeader({ number, title, persona, desc }: { number: number; title: string; persona: string; desc: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{number}</div>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{title}</h2>
          <span className={`badge ${persona === "Organiser" ? "badge-organizer" : "badge-volunteer"}`} style={{ marginTop: 4 }}>{persona}</span>
        </div>
      </div>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 0 48px", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function RegisterStep() {
  return (
    <div>
      <StepHeader number={1} title="Organiser registers the event" persona="Organiser" desc="Marie Dupont from ITU registers the upcoming Plenipotentiary Conference on LémanLoop, entering event details and estimated lanyard count." />
      <div className="card-elevated" style={{ maxWidth: 520 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 20px" }}>Register a new event</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Event name *</label>
            <input value="ITU Plenipotentiary Conference 2026" readOnly style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Geneva venue *</label>
            <input value="ITU Office, Place des Nations, Geneva" readOnly style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Event date</label>
            <input value={EVENT_DATE_ISO} readOnly type="date" style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)", color: "var(--color-text)" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Collection time</label>
            <input value="09:00" readOnly style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Estimated lanyard count</label>
            <input value="250" readOnly type="number" style={{ width: 120, padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)" }} />
          </div>
          <div style={{ padding: "16px 18px", background: "var(--color-accent-soft)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-primary-muted)" }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px", color: "var(--color-primary)" }}>Estimated deposit &amp; impact</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>Deposit (refundable)</div><div style={{ fontSize: 14, fontWeight: 600 }}>CHF 500</div></div>
              <div><div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>CO&#x2082; if all diverted</div><div style={{ fontSize: 14, fontWeight: 600 }}>&asymp; 6.3 kg</div></div>
            </div>
          </div>
          <div style={{ padding: "12px 16px", background: "var(--color-success-soft)", borderRadius: "var(--radius-sm)", border: "1px solid #bbf7d0" }}>
            <p style={{ fontSize: 14, color: "var(--color-success)", margin: "0 0 6px", fontWeight: 600 }}>&#10003; Event registered</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>Volunteers can now browse and apply for your event.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowseStep() {
  return (
    <div>
      <StepHeader number={2} title="Volunteers discover the event" persona="Volunteer" desc="Sophie M&uuml;ller, a sustainability student in Geneva, opens her volunteer dashboard and sees the ITU event in the 'Browse all' tab." />
      <div className="card-elevated">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}><IconCalendar /></span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Events</h3>
        </div>
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--color-border)" }}>
          <button style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, background: "transparent", border: "none", color: "var(--color-text-muted)", borderBottom: "2px solid transparent", marginBottom: -2 }}>My events</button>
          <button style={{ padding: "8px 20px", fontSize: 13, fontWeight: 700, background: "transparent", border: "none", color: "var(--color-primary)", borderBottom: "2px solid var(--color-primary)", marginBottom: -2 }}>Browse all</button>
        </div>
        {[
          { name: "ITU Plenipotentiary Conference 2026", loc: "ITU Office, Place des Nations, Geneva", date: "Next week", highlight: true },
          { name: "Geneva Sustainability Forum", loc: "CICG, Geneva", date: "March 15, 2026", highlight: false },
          { name: "Watches &amp; Wonders 2026", loc: "Palexpo, Geneva", date: "April 1, 2026", highlight: false }
        ].map((e, i) => (
          <div key={i} style={{ border: `${e.highlight ? "2" : "1"}px solid ${e.highlight ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-sm)", padding: "14px 16px", marginBottom: 12, background: e.highlight ? "var(--color-accent-soft)" : "var(--color-surface)", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ color: "var(--color-primary)", marginTop: 2, flexShrink: 0 }}><IconMapPin /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{e.loc}</div>
              <div style={{ fontSize: 12, color: "var(--color-primary-muted)", marginTop: 3, fontWeight: 500 }}>{e.date}</div>
            </div>
            <button style={{ fontSize: 12, fontWeight: 600, padding: "5px 14px", background: e.highlight ? "var(--color-primary)" : "transparent", color: e.highlight ? "white" : "var(--color-primary)", border: e.highlight ? "none" : "1px solid var(--color-primary)", borderRadius: 6 }}>
              {e.highlight ? "Apply to volunteer" : "View details"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplyStep() {
  return (
    <div>
      <StepHeader number={3} title="Application &amp; approval" persona="Volunteer" desc="Sophie applies with a personal message. Marie (the organiser) reviews and approves her application within hours." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="about-two-col">
        <div className="card-elevated">
          <span className="badge badge-volunteer" style={{ marginBottom: 12 }}>volunteer view</span>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>Application sent</h3>
          <div style={{ padding: "12px 16px", background: "var(--color-accent-soft)", borderRadius: "var(--radius-sm)", fontSize: 13, fontStyle: "italic", color: "var(--color-text)", marginBottom: 16 }}>
            &ldquo;I&apos;m a sustainability student at the University of Geneva and have volunteered at 3 conferences before. I&apos;m available all day and can arrive by 8:30 AM.&rdquo;
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#065f46", background: "#d1fae5", padding: "4px 12px", borderRadius: 99 }}>Approved</span>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Response in 2 hours</span>
          </div>
          <div style={{ padding: "10px 14px", background: "#d1fae5", borderRadius: "var(--radius-sm)", marginTop: 12, fontSize: 13 }}>
            <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>Organiser message:</strong>
            <p style={{ margin: "4px 0 0", fontStyle: "italic" }}>&ldquo;Welcome Sophie! Please come to the east entrance at 8:45. Ask for the LémanLoop collection point.&rdquo;</p>
          </div>
        </div>
        <div className="card-elevated">
          <span className="badge badge-organizer" style={{ marginBottom: 12 }}>organiser view</span>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>Volunteer applications</h3>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "var(--color-primary)" }}>S</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Sophie M&#xFC;ller</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>sophie.m@unige.ch &middot; Geneva &middot; weekends</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#065f46", background: "#d1fae5", padding: "3px 10px", borderRadius: 99 }}>Approved</span>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 13 }}>
            <span style={{ color: "#f59e0b", fontWeight: 600 }}>0 pending</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>1 approved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckInStep() {
  return (
    <div>
      <StepHeader number={4} title="GPS check-in at the venue" persona="Volunteer" desc="On event day, Sophie arrives at ITU Office and GPS-checks in to confirm her presence at the collection point." />
      <div className="card-elevated" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="badge badge-success">&#10003; Confirmed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}><IconMapPin /></span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>GPS check-in</h3>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Location confirmed at the ITU collection point.
        </p>
        <div style={{ padding: "10px 14px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", marginBottom: 12 }}>
          46.22393, 6.14079 (&plusmn;4m)
        </div>
        <p style={{ fontSize: 14, color: "var(--color-success)", fontWeight: 600 }}>&#10003; Check-in confirmed &mdash; you are on the loop</p>
        <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--color-primary)", borderRadius: "var(--radius-sm)", color: "white", fontSize: 14, fontWeight: 500 }}>
          <span><IconCheckCircle /> Working on: <strong>ITU Plenipotentiary Conference 2026</strong></span>
        </div>
      </div>
    </div>
  );
}

function GradeStep() {
  const grades = [
    { value: "A", label: "Grade A \u2014 Excellent", count: 180, desc: "Clean, intact strap and clip. Ready for immediate reuse.", colors: { bg: "#f0fdf4", border: "#16a34a", badge: "#16a34a" } },
    { value: "B", label: "Grade B \u2014 Good", count: 45, desc: "Minor soiling or wear. Suitable for reuse after cleaning.", colors: { bg: "#fffbeb", border: "#d97706", badge: "#d97706" } },
    { value: "C", label: "Grade C \u2014 Damaged", count: 25, desc: "Broken clip, frayed strap, or heavy soiling. Routed to upcycling.", colors: { bg: "#fef2f2", border: "#dc2626", badge: "#dc2626" } }
  ];

  return (
    <div>
      <StepHeader number={5} title="Grade the collected lanyards" persona="Volunteer" desc="Sophie sorts 250 lanyards into three grades based on condition. Each grade determines where the lanyard goes next." />
      <div className="card-elevated" style={{ maxWidth: 560 }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 20px" }}>Lanyard grading &mdash; ITU Conference</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {grades.map((g) => (
            <div key={g.value} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: "var(--radius-sm)", border: `2px solid ${g.colors.border}`, background: g.colors.bg }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: g.colors.badge, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{g.value}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{g.label}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>{g.desc}</div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: g.colors.badge }}>{g.count}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>lanyards</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", background: "var(--color-success-soft)", borderRadius: "var(--radius-sm)", fontSize: 14, color: "var(--color-success)", fontWeight: 600 }}>
          &#10003; 250 lanyards recorded across 3 grades
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--color-primary-muted)" }}>
          6.25 kg CO&#x2082; saved &middot; 2,500 karma points earned
        </div>
      </div>
    </div>
  );
}

function PhotoStep() {
  return (
    <div>
      <StepHeader number={6} title="Photograph the sorted batches" persona="Volunteer" desc="Sophie photographs each sorted batch for the organiser's impact certificate and verification records." />
      <div className="card-elevated" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}><IconCamera /></span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Photo documentation</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          {["A", "B", "C"].map((g) => (
            <div key={g} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: 16, textAlign: "center" }}>
              <div style={{ width: "100%", aspectRatio: "4/3", background: "var(--color-surface-raised)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <span style={{ color: "var(--color-text-subtle)" }}><IconCamera /></span>
              </div>
              <span className={`badge ${g === "A" ? "badge-success" : g === "B" ? "badge-warning" : "badge-error"}`}>Grade {g}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: "var(--color-success)", fontWeight: 600 }}>&#10003; Photo uploaded &mdash; 250 lanyards documented</p>
      </div>
    </div>
  );
}

function ImpactStep() {
  return (
    <div>
      <StepHeader number={7} title="Impact certificate generated" persona="Organiser" desc="Marie receives a verified impact certificate showing the environmental impact of lanyard collection at her event." />
      <div className="card-elevated" style={{ maxWidth: 560, padding: "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ color: "var(--color-primary)", display: "inline-block", marginBottom: 12 }}><IconStar /></span>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 4px" }}>Circular Impact Certificate</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>ITU Plenipotentiary Conference 2026</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Lanyards collected", value: "250", color: "var(--color-primary)" },
            { label: "CO\u2082 diverted", value: "6.25 kg", color: "#059669" },
            { label: "Reuse rate", value: "90%", color: "#10b981" },
            { label: "Deposit refunded", value: "CHF 450", color: "#0ea5e9" },
            { label: "Grade A (reuse)", value: "180", color: "#16a34a" },
            { label: "Grade B (clean)", value: "45", color: "#d97706" },
            { label: "Grade C (upcycle)", value: "25", color: "#dc2626" },
            { label: "Volunteers", value: "1", color: "#8b5cf6" }
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "12px 8px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", background: "var(--color-accent-soft)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-primary-muted)", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)", margin: "0 0 4px" }}>CSR-report ready</p>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>Verified CO&#x2082; savings, lanyard counts, and reuse cycles</p>
        </div>
      </div>
    </div>
  );
}
