import type { ReactNode } from "react";
import Link from "next/link";
import { IconHand, IconCalendar, IconUsers, LineArtLoop } from "@/components/Icons";

const IMPACT_STATS = [
  { value: "~500", label: "lanyards per large Geneva event" },
  { value: "25 g", label: "CO\u2082 saved per lanyard reused" },
  { value: "3\u00d7", label: "avg reuse cycles before recycling" },
  { value: "CHF 2", label: "deposit per lanyard returned" }
];

const HOW_IT_WORKS = [
  { title: "Organiser registers", text: "Pay a CHF 2/lanyard deposit when creating your event on LémanLoop." },
  { title: "Volunteers collect", text: "At the venue exit, volunteers collect, grade (A/B/C), and GPS check-in." },
  { title: "Grade and route", text: "Grade A/B lanyards are cleaned and returned to the shared lanyard library." },
  { title: "Recycle Grade C", text: "Damaged or heavily soiled lanyards go to certified upcycling partners." },
  { title: "Refund and certificate", text: "Organiser receives the deposit refund and a verified impact certificate." }
];

const MODEL_PILLARS = [
  { label: "Deposit per lanyard", text: "Organisers pay CHF 2/lanyard. Refunded when returned in Grade A or B condition." },
  { label: "Grade and route", text: "A = reuse as-is, B = clean then reuse, C = upcycle or material recycle. Nothing goes to landfill." },
  { label: "Lanyard library", text: "Borrow from our shared inventory of clean, brand-neutral lanyards. No new manufacturing needed." },
  { label: "Impact certificate", text: "Verified CO\u2082 savings, lanyard counts, and reuse cycles \u2014 ready for your CSR report." }
];

const VENUES = ["Palexpo", "CICG", "Maison de la Paix", "WTO", "ICRC", "WHO", "Geneva Marathon", "Watches & Wonders", "UN Geneva"];

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "56px 24px 64px",
          background: "linear-gradient(160deg, var(--color-accent-soft) 0%, var(--color-bg) 70%)",
          borderRadius: "var(--radius-xl)",
          marginBottom: 48,
          textAlign: "center"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <LineArtLoop />
        </div>

        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--color-primary-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12
          }}
        >
          Geneva&apos;s circular lanyard programme
        </p>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 700,
            color: "var(--color-text)",
            margin: "0 auto 16px",
            maxWidth: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.2
          }}
        >
          Give every lanyard a second life
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--color-text-muted)",
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.65
          }}
        >
          Every Geneva event generates hundreds of lanyards bound for landfill. LémanLoop
          closes that loop — collecting, grading, and returning them to a shared circular economy.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" className="btn btn-primary btn-lg">
            <IconHand />
            Volunteer for free
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            <IconCalendar />
            Register your event
          </Link>
        </div>
      </section>

      {/* ── Impact stats ──────────────────────────────────────────────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 56
        }}
      >
        {IMPACT_STATS.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                marginBottom: 6,
                letterSpacing: "-0.02em"
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: 56 }}>
        <h2
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 32,
            textAlign: "center",
            letterSpacing: "-0.02em"
          }}
        >
          How it works
        </h2>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Step number + connector line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  {i + 1}
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 28,
                      background: "var(--color-border)",
                      margin: "4px 0"
                    }}
                  />
                )}
              </div>
              {/* Step content */}
              <div style={{ paddingBottom: i < HOW_IT_WORKS.length - 1 ? 24 : 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                  {step.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Circular model ────────────────────────────────────────────── */}
      <section
        style={{
          marginBottom: 56,
          padding: "32px",
          background: "var(--color-accent-soft)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-primary-muted)"
        }}
      >
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            margin: "0 0 8px",
            letterSpacing: "-0.01em"
          }}
        >
          The deposit-and-return model
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
          Tailored to Geneva&apos;s dense international event calendar — Palexpo, CICG, Maison de la Paix, and beyond.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          {MODEL_PILLARS.map((p) => (
            <div key={p.label}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  marginBottom: 10
                }}
              />
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "var(--color-text)" }}>
                {p.label}
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section divider ───────────────────────────────────────────── */}
      <div className="section-divider">
        <span style={{ fontSize: 13, color: "var(--color-text-subtle)", fontWeight: 500 }}>Role-based dashboards</span>
      </div>

      {/* ── Role cards ────────────────────────────────────────────────── */}
      <section
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 56 }}
      >
        <RoleCard
          href="/volunteer"
          icon={<IconHand />}
          title="Volunteer"
          description="Collect lanyards at Geneva events, grade their condition (A/B/C), record materials, and GPS check in. Earn karma points redeemable for event tickets."
          badge="badge-volunteer"
          badgeLabel="volunteer"
        />
        <RoleCard
          href="/organizer"
          icon={<IconCalendar />}
          title="Organiser"
          description="Register events, declare lanyard counts, set your deposit, and coordinate collection points. Receive an impact certificate after each event."
          badge="badge-organizer"
          badgeLabel="organizer"
        />
        <RoleCard
          href="/admin"
          icon={<IconUsers />}
          title="Admin"
          description="Platform oversight: manage users, monitor lanyards collected, CO\u2082 saved, and deposit flow. Coordinate processing partners."
          badge="badge-admin"
          badgeLabel="admin"
        />
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: "28px 32px",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)"
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-text-subtle)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 14
          }}
        >
          Designed for Geneva&apos;s event ecosystem
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {VENUES.map((name) => (
            <span
              key={name}
              style={{
                padding: "5px 12px",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-accent-soft)",
                color: "var(--color-primary)",
                border: "1px solid var(--color-accent)"
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

function RoleCard({
  href,
  icon,
  title,
  description,
  badge,
  badgeLabel
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  badge: string;
  badgeLabel: string;
}) {
  return (
    <a href={href} className="card-elevated" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ color: "var(--color-primary)" }}>{icon}</span>
        <span className={`badge ${badge}`}>{badgeLabel}</span>
      </div>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          margin: "0 0 8px",
          color: "var(--color-text)",
          letterSpacing: "-0.01em"
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>
        {description}
      </p>
    </a>
  );
}
