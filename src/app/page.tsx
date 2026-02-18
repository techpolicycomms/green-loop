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
          GreenLoop
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--color-text-muted)",
            maxWidth: 420,
            margin: "0 auto 32px",
            lineHeight: 1.6
          }}
        >
          Connect volunteers with events. Manage roles, track participation, and build your community.
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
          Get started
        </Link>
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
          description="Check in at collection points with GPS, capture photos for impact tracking, and join events."
        />
        <RoleCard
          href="/organizer"
          icon={<IconCalendar />}
          title="Organizer"
          description="Create and manage events, set locations, and coordinate volunteer participation."
        />
        <RoleCard
          href="/admin"
          icon={<IconUsers />}
          title="Admin"
          description="View all users, manage roles, and oversee the platform. Full access to user list."
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
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
            maxWidth: 640,
            margin: "0 auto"
          }}
        >
          <Step number="1" text="Sign in with Google or Apple" />
          <Step number="2" text="Get assigned a role (volunteer, organizer, or admin)" />
          <Step number="3" text="Use your dashboard to participate or manage" />
        </div>
      </section>
    </main>
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
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>{text}</p>
    </div>
  );
}
