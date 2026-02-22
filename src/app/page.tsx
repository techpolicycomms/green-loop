"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { IconHand, IconCalendar, IconUsers, LineArtLoop, IconStar, IconCheckCircle } from "@/components/Icons";

type UserProfile = {
  id: string;
  email?: string;
  role: string;
  extra_roles: string[];
  display_name?: string | null;
  avatar_url?: string | null;
  city?: string | null;
};

type HistoryStats = {
  total_checkins: number;
  total_lanyards: number;
  karma_points: number;
  co2_saved_kg: number;
  by_grade: Record<string, number>;
};

type Application = {
  id: string;
  event_id: string;
  status: string;
  event?: { name: string; location: string } | null;
};

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/me", { credentials: "include" }).then((r) => r.json()).catch(() => null),
      fetch("/api/volunteer/history", { credentials: "include" }).then((r) => r.json()).catch(() => null),
      fetch("/api/volunteer/applications", { credentials: "include" }).then((r) => r.json()).catch(() => [])
    ]).then(([meData, histData, appsData]) => {
      if (meData?.user && meData?.profile) {
        setProfile({
          id: meData.user.id,
          email: meData.profile.email || meData.user.email,
          role: meData.profile.role ?? "volunteer",
          extra_roles: (meData.profile.extra_roles as string[] | null) ?? [],
          display_name: meData.profile.display_name ?? null,
          avatar_url: meData.profile.avatar_url ?? null,
          city: meData.profile.city ?? null
        });
      }
      if (histData && !histData.error) setStats(histData.stats ?? null);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return <main><MarketingPage /></main>;
  }

  return (
    <main>
      {profile ? (
        <PersonalDashboard profile={profile} stats={stats} applications={applications} />
      ) : (
        <MarketingPage />
      )}
    </main>
  );
}

function PersonalDashboard({ profile, stats, applications }: { profile: UserProfile; stats: HistoryStats | null; applications: Application[] }) {
  const allRoles = [profile.role, ...(profile.extra_roles ?? [])];
  const isVolunteer = allRoles.includes("volunteer");
  const isOrganizer = allRoles.includes("organizer");
  const isAdmin = profile.role === "admin";

  const displayName = profile.display_name || profile.email?.split("@")[0] || "there";
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const approvedApps = applications.filter((a) => a.status === "approved");
  const pendingApps = applications.filter((a) => a.status === "pending");

  return (
    <>
      {/* Welcome header */}
      <section style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: profile.avatar_url ? "transparent" : "var(--color-accent-soft)", border: "3px solid var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {profile.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)" }}>{avatarInitial}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            {greeting}, {displayName}!
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 10px" }}>
            {profile.city ? profile.city + " \u00b7 " : ""}
            {allRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(" & ")}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allRoles.map((r) => (
              <span key={r} className={"badge badge-" + r} style={{ fontSize: 11 }}>{r}</span>
            ))}
          </div>
        </div>
        <Link href="/profile" style={{ fontSize: 13, color: "var(--color-primary)", textDecoration: "none", border: "1px solid var(--color-primary)", padding: "6px 14px", borderRadius: "var(--radius-sm)", flexShrink: 0 }}>
          Edit profile
        </Link>
      </section>

      {/* Impact snapshot */}
      {stats && (stats.total_lanyards > 0 || stats.total_checkins > 0) && (
        <section style={{ marginBottom: 28 }}>
          <SectionTitle>Your impact</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            {[
              { label: "Karma points", value: stats.karma_points.toLocaleString(), color: "var(--color-primary)" },
              { label: "Lanyards diverted", value: String(stats.total_lanyards), color: "#10b981" },
              { label: "CO\u2082 saved", value: stats.co2_saved_kg + " kg", color: "#059669" },
              { label: "Check-ins", value: String(stats.total_checkins), color: "#0ea5e9" }
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: "16px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>Quick actions</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {isVolunteer && <QuickCard href="/volunteer" icon={<IconHand />} title="Volunteer dashboard" desc="Log lanyards, check in, track karma" badge="badge-volunteer" />}
          {isOrganizer && <QuickCard href="/organizer" icon={<IconCalendar />} title="Organiser dashboard" desc="Register events, manage applications" badge="badge-organizer" />}
          {isAdmin && <QuickCard href="/admin" icon={<IconUsers />} title="Admin panel" desc="Platform overview and user management" badge="badge-admin" />}
          <QuickCard href="/profile" icon={<IconStar />} title="My profile" desc="Edit details, manage roles, view stats" badge="badge-neutral" />
        </div>
      </section>

      {/* My approved events */}
      {isVolunteer && applications.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionTitle>My events</SectionTitle>
          {pendingApps.length > 0 && (
            <div style={{ padding: "10px 14px", background: "#fef3c7", borderRadius: "var(--radius-sm)", border: "1px solid #f59e0b30", fontSize: 13, color: "#92400e", marginBottom: 10 }}>
              <strong>{pendingApps.length}</strong> application{pendingApps.length !== 1 ? "s" : ""} pending organiser review
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {approvedApps.slice(0, 4).map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)" }}>
                <span style={{ color: "#10b981", flexShrink: 0 }}><IconCheckCircle /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.event?.name ?? "Event"}</div>
                  {a.event?.location && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{a.event.location}</div>}
                </div>
                <span style={{ fontSize: 11, color: "#065f46", background: "#d1fae5", padding: "3px 10px", borderRadius: 99, fontWeight: 600, flexShrink: 0 }}>Approved</span>
              </div>
            ))}
          </div>
          {applications.length > 4 && (
            <Link href="/volunteer" style={{ display: "block", fontSize: 13, color: "var(--color-primary)", textAlign: "center", marginTop: 10 }}>
              View all {applications.length} applications &rarr;
            </Link>
          )}
        </section>
      )}

      {/* Karma progress */}
      {isVolunteer && stats && stats.karma_points > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionTitle>Karma progress</SectionTitle>
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 14 }}>
              <IconStar /> {stats.karma_points.toLocaleString()} points
            </div>
            {[
              { pts: 100, label: "Free community event ticket" },
              { pts: 500, label: "Annual Geneva tram day-pass" },
              { pts: 1000, label: "Partner NGO membership" }
            ].map((m) => {
              const done = stats.karma_points >= m.pts;
              const pct = Math.min(100, Math.round((stats.karma_points / m.pts) * 100));
              return (
                <div key={m.pts} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: done ? "#10b981" : "var(--color-text-muted)", fontWeight: done ? 600 : 400 }}>
                      {done ? "\u2713 " : ""}{m.label}
                    </span>
                    <span style={{ color: "var(--color-text-muted)" }}>{m.pts.toLocaleString()} pts</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--color-border)" }}>
                    <div style={{ height: "100%", width: pct + "%", background: done ? "#10b981" : "var(--color-primary)", borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upsell: add organizer role */}
      {!isOrganizer && (
        <div style={{ padding: "20px 24px", background: "var(--color-accent-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-primary-muted)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)", marginBottom: 6 }}>Organising an event?</p>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
            Add the organiser role to your profile and register your event to attract volunteers and receive an impact certificate.
          </p>
          <Link href="/profile" style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>
            Add organiser role &rarr;
          </Link>
        </div>
      )}
    </>
  );
}

function MarketingPage() {
  return (
    <>
      <section style={{ padding: "56px 24px 64px", background: "linear-gradient(160deg, var(--color-accent-soft) 0%, var(--color-bg) 70%)", borderRadius: "var(--radius-xl)", marginBottom: 48, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><LineArtLoop /></div>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Geneva&apos;s circular lanyard programme
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 auto 16px", maxWidth: 600, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
          Give every lanyard a second life
        </h1>
        <p style={{ fontSize: "1.05rem", color: "var(--color-text-muted)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.65 }}>
          Every Geneva event generates hundreds of lanyards bound for landfill. LémanLoop closes that loop.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" className="btn btn-primary btn-lg"><IconHand /> Volunteer for free</Link>
          <Link href="/login" className="btn btn-secondary btn-lg"><IconCalendar /> Register your event</Link>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 56 }}>
        {IMPACT_STATS.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-text)", marginBottom: 32, textAlign: "center" }}>How it works</h2>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                {i < HOW_IT_WORKS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: "var(--color-border)", margin: "4px 0" }} />}
              </div>
              <div style={{ paddingBottom: i < HOW_IT_WORKS.length - 1 ? 24 : 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.55 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 56, padding: "32px", background: "var(--color-accent-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-primary-muted)" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 8px" }}>The deposit-and-return model</h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>Tailored to Geneva&apos;s dense international event calendar.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          {MODEL_PILLARS.map((p) => (
            <div key={p.label}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", marginBottom: 10 }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "var(--color-text)" }}>{p.label}</h3>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider"><span style={{ fontSize: 13, color: "var(--color-text-subtle)", fontWeight: 500 }}>Role-based dashboards</span></div>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 56 }}>
        <RoleCard href="/volunteer" icon={<IconHand />} title="Volunteer" description="Collect lanyards, grade their condition, GPS check in, earn karma." badge="badge-volunteer" badgeLabel="volunteer" />
        <RoleCard href="/organizer" icon={<IconCalendar />} title="Organiser" description="Register events, manage collection points, receive an impact certificate." badge="badge-organizer" badgeLabel="organizer" />
      </section>

      <section style={{ padding: "28px 32px", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Designed for Geneva&apos;s event ecosystem</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {VENUES.map((name) => (
            <span key={name} style={{ padding: "5px 12px", fontSize: 13, fontWeight: 500, borderRadius: "var(--radius-sm)", background: "var(--color-accent-soft)", color: "var(--color-primary)", border: "1px solid var(--color-accent)" }}>{name}</span>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 14, margin: "0 0 14px" }}>
      {children}
    </h2>
  );
}

function QuickCard({ href, icon, title, desc, badge }: { href: string; icon: ReactNode; title: string; desc: string; badge: string }) {
  return (
    <Link href={href} className="card-elevated" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ color: "var(--color-primary)" }}>{icon}</span>
        <span className={"badge " + badge} style={{ fontSize: 10 }}>{title.split(" ")[0].toLowerCase()}</span>
      </div>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 6px", color: "var(--color-text)" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </Link>
  );
}

function RoleCard({ href, icon, title, description, badge, badgeLabel }: { href: string; icon: ReactNode; title: string; description: string; badge: string; badgeLabel: string }) {
  return (
    <a href={href} className="card-elevated" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ color: "var(--color-primary)" }}>{icon}</span>
        <span className={"badge " + badge}>{badgeLabel}</span>
      </div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px", color: "var(--color-text)", letterSpacing: "-0.01em" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>{description}</p>
    </a>
  );
}
