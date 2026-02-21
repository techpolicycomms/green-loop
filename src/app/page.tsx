import Link from "next/link";
import { IconHand, IconCalendar, IconUsers, IconLogIn, LineArtLoop, LineArtCommunity } from "@/components/Icons";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "48px 24px 56px",
          background: "linear-gradient(180deg, var(--color-accent-soft) 0%, transparent 100%)",
          borderRadius: "var(--radius-lg)",
          marginBottom: 48
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <LineArtLoop />
        </div>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "var(--color-text)",
            margin: "0 0 12px",
            letterSpacing: "-0.02em"
          }}
        >
          LémanLoop
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--color-primary)",
            fontWeight: 600,
            margin: "0 auto 8px",
            letterSpacing: "0.02em"
          }}
        >
          Geneva&apos;s circular lanyard programme
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--color-text-muted)",
            maxWidth: 480,
            margin: "0 auto 32px",
            lineHeight: 1.6
          }}
        >
          Every event in Geneva generates hundreds of lanyards destined for landfill. LémanLoop
          closes that loop — collecting, grading, and returning lanyards to the circular economy
          through a deposit-and-return model built for the city&apos;s international conference ecosystem.
        </p>
        <Link
          href="/login"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            background: "var(--color-primary)",
            color: "white",
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            textDecoration: "none",
            transition: "background 0.2s"
          }}
        >
          <IconLogIn />
          Join the loop
        </Link>
      </section>

      {/* Impact numbers */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 48
        }}
      >
        <ImpactStat value="~500" label="lanyards per large Geneva event" />
        <ImpactStat value="25 g" label="CO₂ saved per lanyard reused" />
        <ImpactStat value="3×" label="avg reuse cycles before recycling" />
        <ImpactStat value="CHF 2" label="deposit per lanyard returned" />
      </section>

      {/* Business model overview */}
      <section
        style={{
          marginBottom: 48,
          padding: "28px 32px",
          background: "var(--color-accent-soft)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-primary-muted)"
        }}
      >
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "var(--color-primary)",
            margin: "0 0 12px"
          }}
        >
          The circular model
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
          LémanLoop operates a <strong>deposit-and-return scheme</strong> tailored to Geneva&apos;s dense
          international event calendar — Palexpo, CICG, Maison de la Paix, and beyond.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <ModelPillar
            emoji="💳"
            title="Deposit per lanyard"
            text="Organisers pay CHF 2 per lanyard. The deposit is refunded when lanyards are returned in Grade A or B condition after the event."
          />
          <ModelPillar
            emoji="♻️"
            title="Grade & route"
            text="Volunteers grade each lanyard: Grade A (reuse as-is), Grade B (clean & reuse), Grade C (upcycle or material recycle). Nothing goes to landfill."
          />
          <ModelPillar
            emoji="🧺"
            title="Lanyard library"
            text="Organisations can borrow from our curated inventory of clean, branded-neutral lanyards — eliminating the need to manufacture new ones per event."
          />
          <ModelPillar
            emoji="📜"
            title="Impact certificates"
            text="Organisers receive a verified sustainability certificate showing CO₂ avoided, lanyards diverted from landfill, and reuse cycles — ready for CSR reporting."
          />
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider">
        <span style={{ fontSize: 13, color: "var(--color-text-muted-2)", fontWeight: 500 }}>Role-based dashboards</span>
      </div>

      {/* Role cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        <RoleCard
          href="/volunteer"
          icon={<IconHand />}
          title="Volunteer"
          description="Collect lanyards at Geneva events, grade their condition (A/B/C), record materials, and check in via GPS. Earn karma points redeemable for event tickets and local rewards."
        />
        <RoleCard
          href="/organizer"
          icon={<IconCalendar />}
          title="Organiser"
          description="Register events at Geneva venues, declare expected lanyard counts, set your deposit, and coordinate collection points. Receive an impact certificate after each event."
        />
        <RoleCard
          href="/admin"
          icon={<IconUsers />}
          title="Admin"
          description="Platform oversight: manage users and roles, monitor lanyards collected, CO₂ saved, and deposit flow. Coordinate processing partners and issue impact certificates."
        />
      </section>

      {/* How it works */}
      <section style={{ marginTop: 56 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <LineArtCommunity />
        </div>
        <h2
          style={{
            fontSize: "1.35rem",
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: 16,
            textAlign: "center"
          }}
        >
          How it works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            maxWidth: 800,
            margin: "0 auto"
          }}
        >
          <Step number="1" text="Organiser registers event and pays lanyard deposit (CHF 2/unit)" />
          <Step number="2" text="Volunteers collect lanyards, grade condition A/B/C, and GPS check in" />
          <Step number="3" text="Grade A/B lanyards are cleaned and returned to the lanyard library" />
          <Step number="4" text="Grade C lanyards go to upcycling or material recycling partners" />
          <Step number="5" text="Organiser receives deposit refund and a verified impact certificate" />
        </div>
      </section>

      {/* Geneva partners section */}
      <section
        style={{
          marginTop: 56,
          padding: "28px 32px",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)"
        }}
      >
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "var(--color-text)",
            margin: "0 0 8px"
          }}
        >
          Built for Geneva&apos;s event ecosystem
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
          LémanLoop targets Geneva&apos;s rich calendar of international conferences, summits, and trade fairs —
          venues and organisations where sustainability mandates are strongest.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {["Palexpo", "CICG", "Maison de la Paix", "WTO", "ICRC", "WHO", "Geneva Marathon", "SIHH / Watches & Wonders", "UN Geneva"].map((name) => (
            <span
              key={name}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-accent-soft)",
                color: "var(--color-primary)",
                border: "1px solid var(--color-primary-muted)"
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

function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px 16px",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)"
      }}
    >
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

function ModelPillar({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div>
      <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{emoji}</div>
      <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "var(--color-text)" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>{text}</p>
    </div>
  );
}

function RoleCard({
  href,
  icon,
  title,
  description
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card-elevated"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
    >
      <div style={{ color: "var(--color-primary)", marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 8px", color: "var(--color-text)" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>{description}</p>
    </Link>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--color-accent-soft)",
          color: "var(--color-primary)",
          fontWeight: 700,
          fontSize: 16,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12
        }}
      >
        {number}
      </div>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
