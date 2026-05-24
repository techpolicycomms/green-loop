"use client";

import { useEffect, useRef, useState } from "react";
import { IconStar, IconCalendar, IconMapPin, IconCamera, IconSettings, IconCheckCircle } from "@/components/Icons";
import { formatDate, formatDateLong } from "@/lib/formatDate";

type Profile = {
  id: string;
  email?: string;
  role: string;
  extra_roles: string[];
  active_mode?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  city?: string | null;
  onboarding_complete?: boolean;
  availability?: string | null;
  motivation?: string | null;
  organization_name?: string | null;
  website?: string | null;
  sustainability_score?: number;
  created_at: string;
  updated_at?: string | null;
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
  created_at: string;
  event?: { id: string; name: string; location: string } | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "edit" | "roles" | "events">("overview");

  // Edit form
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState("");
  const [motivation, setMotivation] = useState("");
  const [orgName, setOrgName] = useState("");
  const [website, setWebsite] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Avatar
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarStatus, setAvatarStatus] = useState("");
  const [avatarHovered, setAvatarHovered] = useState(false);

  const load = async () => {
    setLoading(true);
    const [profileRes, histRes, appsRes] = await Promise.all([
      fetch("/api/profile", { credentials: "include" }).then((r) => r.json()).catch(() => null),
      fetch("/api/volunteer/history", { credentials: "include" }).then((r) => r.json()).catch(() => null),
      fetch("/api/volunteer/applications", { credentials: "include" }).then((r) => r.json()).catch(() => [])
    ]);

    const p = profileRes?.profile as Profile | null;
    if (p) {
      setProfile(p);
      setDisplayName(p.display_name ?? "");
      setBio(p.bio ?? "");
      setPhone(p.phone ?? "");
      setCity(p.city ?? "");
      setAvailability(p.availability ?? "");
      setMotivation(p.motivation ?? "");
      setOrgName(p.organization_name ?? "");
      setWebsite(p.website ?? "");
    }
    if (histRes && !histRes.error) setStats(histRes.stats ?? null);
    setApplications(Array.isArray(appsRes) ? appsRes : []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const saveProfile = async () => {
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: displayName || undefined,
          bio: bio || null,
          phone: phone || null,
          city: city || null,
          availability: availability || null,
          motivation: motivation || null,
          organization_name: orgName || null,
          website: website || null
        })
      });
      if (res.ok) {
        setSaveStatus("✓ Profile saved");
        await load();
        setTimeout(() => setSaveStatus(""), 4000); // only success auto-dismisses
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveStatus(`Error: ${(data as { error?: string }).error ?? "Failed"}`);
        // error stays visible until next save attempt
      }
    } catch {
      setSaveStatus("Error: Network error");
      // error stays visible until next save attempt
    }
  };

  const toggleRole = async (roleToToggle: "volunteer" | "organizer") => {
    if (!profile) return;
    const current = profile.extra_roles ?? [];
    const primaryRole = profile.role;

    // Can't remove your primary role
    if (primaryRole === roleToToggle) return;

    const adding = !current.includes(roleToToggle);
    const confirmMsg = adding
      ? `Add the ${roleToToggle} role? You'll gain access to the ${roleToToggle} dashboard.`
      : `Remove the ${roleToToggle} role? You'll lose access to that dashboard until you add it back.`;
    if (!window.confirm(confirmMsg)) return;

    const newExtras = current.includes(roleToToggle)
      ? current.filter((r) => r !== roleToToggle)
      : [...current, roleToToggle];

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ extra_roles: newExtras })
    });
    if (res.ok) await load();
  };

  const uploadAvatar = async (file: File) => {
    setAvatarStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data as { url?: string }).url) {
      setAvatarStatus("✓ Avatar updated");
      await load();
      setTimeout(() => setAvatarStatus(""), 3000);
    } else {
      setAvatarStatus(`Error: ${(data as { error?: string }).error ?? "Upload failed"}`);
    }
  };

  if (loading) {
    return <main><p style={{ color: "var(--color-text-muted)", padding: "32px 0" }}>Loading profile…</p></main>;
  }

  if (!profile) {
    return (
      <main>
        <p style={{ color: "var(--color-text-muted)", padding: "32px 0" }}>
          Please <a href="/login" style={{ color: "var(--color-primary)" }}>sign in</a> to view your profile.
        </p>
      </main>
    );
  }

  const allRoles = [profile.role, ...(profile.extra_roles ?? [])];
  const isVolunteer = allRoles.includes("volunteer");
  const isOrganizer = allRoles.includes("organizer");
  const isAdmin = profile.role === "admin";

  const joinDate = formatDateLong(profile.created_at);
  const approvedEvents = applications.filter((a) => a.status === "approved");
  const pendingEvents = applications.filter((a) => a.status === "pending");

  return (
    <main>
      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: profile.avatar_url ? "transparent" : "var(--color-accent-soft)",
              border: "3px solid var(--color-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", cursor: "pointer", position: "relative"
            }}
            onClick={() => fileRef.current?.click()}
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
            title="Click to change avatar"
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={profile.avatar_url + (profile.updated_at ?? "")}
                src={`${profile.avatar_url}${profile.avatar_url.includes("?") ? "&" : "?"}v=${profile.updated_at ?? Date.now()}`}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-primary)" }}>
                {(profile.display_name || profile.email || "?").charAt(0).toUpperCase()}
              </span>
            )}
            {/* Hover overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.38)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: avatarHovered ? 1 : 0,
              transition: "opacity 0.18s",
              pointerEvents: "none"
            }}>
              <span style={{ color: "#fff" }}><IconCamera /></span>
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, background: "var(--color-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--color-bg)" }}>
              <IconCamera />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          {avatarStatus && <p style={{ fontSize: 11, color: avatarStatus.startsWith("Error") ? "#ef4444" : "#10b981", marginTop: 4, textAlign: "center", maxWidth: 80 }}>{avatarStatus}</p>}
        </div>

        {/* Name and meta */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 6px", color: "var(--color-text)" }}>
            {profile.display_name || profile.email?.split("@")[0] || "Your profile"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 10px" }}>
            {profile.email} · Member since {joinDate}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allRoles.map((r) => (
              <span key={r} className={`badge badge-${r}`} style={{ fontSize: 12, padding: "3px 10px" }}>{r}</span>
            ))}
            {profile.city && <span style={{ fontSize: 12, color: "var(--color-text-muted)", background: "var(--color-surface)", padding: "3px 10px", borderRadius: 99, border: "1px solid var(--color-border)" }}>{profile.city}</span>}
          </div>
        </div>

        {/* Quick stats */}
        {stats && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Karma", v: stats.karma_points.toLocaleString(), icon: <IconStar />, color: "var(--color-primary)" },
              { label: "Lanyards", v: stats.total_lanyards, icon: null, color: "var(--color-text)" },
              { label: "CO₂ saved", v: `${stats.co2_saved_kg} kg`, icon: null, color: "#10b981" }
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: s.color, display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  {s.icon} {s.v}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid var(--color-border)", overflowX: "auto" }}>
        {([
          ["overview", "Overview"],
          ["edit", "Edit profile"],
          ["roles", "Roles"],
          ["events", `Events${applications.length > 0 ? ` (${applications.length})` : ""}`]
        ] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
              background: "transparent", border: "none", cursor: "pointer",
              color: tab === t ? "var(--color-primary)" : "var(--color-text-muted)",
              borderBottom: tab === t ? "2px solid var(--color-primary)" : "2px solid transparent",
              marginBottom: -2
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === "overview" && (
        <div>
          {/* Sustainability profile */}
          <section className="card" style={{ marginBottom: 20, padding: "20px 24px", background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "var(--color-primary)" }}>
              Sustainability profile
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
              <StatCard label="Karma points" value={stats?.karma_points.toLocaleString() ?? "0"} color="var(--color-primary)" />
              <StatCard label="Lanyards diverted" value={stats?.total_lanyards ?? 0} color="#10b981" />
              <StatCard label="CO₂ saved" value={`${stats?.co2_saved_kg ?? 0} kg`} color="#059669" />
              <StatCard label="Check-ins" value={stats?.total_checkins ?? 0} color="#0ea5e9" />
              <StatCard label="Events joined" value={approvedEvents.length} color="#8b5cf6" />
            </div>

            {stats && stats.total_lanyards > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Grade breakdown
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  {Object.entries(stats.by_grade).map(([g, n]) => (
                    <div key={g} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: g === "A" ? "#10b981" : g === "B" ? "#f59e0b" : "#ef4444" }}>{n}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Grade {g}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Karma milestones */}
          <section className="card" style={{ padding: "16px 20px", marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Karma milestones</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { pts: 10, label: "First lanyard collected", done: (stats?.karma_points ?? 0) >= 10 },
                { pts: 100, label: "Free community event ticket", done: (stats?.karma_points ?? 0) >= 100 },
                { pts: 500, label: "Annual Geneva tram day-pass", done: (stats?.karma_points ?? 0) >= 500 },
                { pts: 1000, label: "Partner NGO membership", done: (stats?.karma_points ?? 0) >= 1000 }
              ].map((m) => (
                <div key={m.pts} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: m.done ? "#10b981" : "var(--color-border)", flexShrink: 0 }}>
                    <IconCheckCircle />
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: m.done ? 600 : 400, color: m.done ? "var(--color-text)" : "var(--color-text-muted)" }}>
                      {m.pts.toLocaleString()} pts — {m.label}
                    </span>
                  </div>
                  {m.done && <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Earned</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Bio & motivation */}
          {(profile.bio || profile.motivation) && (
            <section className="card" style={{ padding: "16px 20px", marginBottom: 20 }}>
              {profile.bio && (
                <div style={{ marginBottom: profile.motivation ? 14 : 0 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: 6 }}>Bio</h4>
                  <p style={{ fontSize: 14, color: "var(--color-text)", margin: 0, lineHeight: 1.6 }}>{profile.bio}</p>
                </div>
              )}
              {profile.motivation && (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: 6 }}>Motivation</h4>
                  <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>&ldquo;{profile.motivation}&rdquo;</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* ── Edit profile tab ── */}
      {tab === "edit" && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="Display name" required>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your public name" style={{ width: "100%" }} />
            </Field>
            <Field label="Bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short introduction about yourself…" rows={3} style={{ width: "100%", resize: "vertical" }} />
            </Field>
            <Field label="Phone">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+41 79 000 0000" style={{ width: "100%" }} />
            </Field>
            <Field label="City">
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Geneva" style={{ width: "100%" }} />
            </Field>

            {isVolunteer && (
              <>
                <Field label="Availability">
                  <select value={availability} onChange={(e) => setAvailability(e.target.value)} style={{ width: "100%" }}>
                    <option value="">— select —</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="both">Both</option>
                  </select>
                </Field>
                <Field label="Motivation">
                  <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="Why do you volunteer for lanyard collection?" rows={2} style={{ width: "100%", resize: "vertical" }} />
                </Field>
              </>
            )}

            {isOrganizer && (
              <>
                <Field label="Organisation name">
                  <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Your company or organisation" style={{ width: "100%" }} />
                </Field>
                <Field label="Website">
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" style={{ width: "100%" }} />
                </Field>
              </>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button onClick={saveProfile} className="btn btn-primary">Save changes</button>
              {saveStatus && (
                <span style={{ fontSize: 13, color: saveStatus.startsWith("Error") ? "#ef4444" : "#10b981" }}>{saveStatus}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Roles tab ── */}
      {tab === "roles" && (
        <div style={{ maxWidth: 480 }}>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
            Your primary role is <strong>{profile.role}</strong>. You can add additional roles to access both the volunteer and organiser dashboards.
            Admins are assigned by super administrators and cannot be self-requested.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(["volunteer", "organizer"] as const).map((r) => {
              const isPrimary = profile.role === r;
              const isActive = allRoles.includes(r);
              return (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: `2px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-sm)", background: isActive ? "var(--color-accent-soft)" : "var(--color-surface)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", textTransform: "capitalize" }}>
                      {r} {isPrimary && <span style={{ fontSize: 11, color: "var(--color-primary-muted)", marginLeft: 6 }}>(primary role)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
                      {r === "volunteer" ? "Collect lanyards, earn karma, log grades at events." : "Register events, manage collection points, view impact."}
                    </div>
                  </div>
                  {isPrimary ? (
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Primary</span>
                  ) : (
                    <button
                      onClick={() => toggleRole(r)}
                      style={{
                        padding: "6px 16px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                        background: isActive ? "#ef4444" : "var(--color-primary)",
                        color: "white", border: "none"
                      }}
                    >
                      {isActive ? "Remove" : "Add role"}
                    </button>
                  )}
                </div>
              );
            })}

            {isAdmin && (
              <div style={{ padding: "16px 20px", border: "2px solid var(--color-primary)", borderRadius: "var(--radius-sm)", background: "var(--color-accent-soft)" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-primary)" }}>Admin</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
                  Full platform oversight. Assigned by super administrators only.
                </div>
              </div>
            )}

            <div style={{ padding: "14px 16px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
              <strong>Note:</strong> Changes take effect immediately. You can access your dashboards via the navigation menu or from your home page.
            </div>
          </div>
        </div>
      )}

      {/* ── Events tab ── */}
      {tab === "events" && (
        <div>
          {applications.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
              You haven&apos;t applied to any events yet.{" "}
              <a href="/volunteer" style={{ color: "var(--color-primary)" }}>Browse events →</a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pendingEvents.length > 0 && (
                <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e", margin: "0 0 4px" }}>{pendingEvents.length} pending application{pendingEvents.length !== 1 ? "s" : ""}</p>
              )}
              {applications.map((a) => {
                const statusStyles: Record<string, { color: string; bg: string }> = {
                  pending:   { color: "#92400e", bg: "#fef3c7" },
                  approved:  { color: "#065f46", bg: "#d1fae5" },
                  rejected:  { color: "#991b1b", bg: "#fee2e2" },
                  withdrawn: { color: "#374151", bg: "#f3f4f6" }
                };
                const s = statusStyles[a.status] ?? statusStyles.pending;
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)", flexWrap: "wrap" }}>
                    <span style={{ color: "var(--color-primary)", flexShrink: 0 }}><IconMapPin /></span>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>{a.event?.name ?? "Unknown event"}</div>
                      {a.event?.location && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{a.event.location}</div>}
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                        Applied {formatDate(a.created_at)}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, padding: "4px 12px", borderRadius: 99, border: `1px solid ${s.color}30` }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {isOrganizer && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: "var(--color-primary)" }}><IconCalendar /></span>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>My organised events</h3>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                <a href="/organizer" style={{ color: "var(--color-primary)" }}>Go to Organiser Dashboard →</a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Settings link */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--color-text-muted)" }}><IconSettings /></span>
        <a href="/onboarding" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>
          Re-run onboarding wizard
        </a>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 8px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
      <div style={{ fontSize: "1.25rem", fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
