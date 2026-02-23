"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IconUsers, IconCalendar, IconDatabase, IconBell,
  IconSettings, IconActivity, IconSearch, IconTrash,
  IconPencil, IconMail, IconRefresh, IconDownload,
  IconCheckCircle, IconX, IconStar, IconShield
} from "@/components/Icons";
import { formatDateOrDash, formatDateTime } from "@/lib/formatDate";

// ── Types ──────────────────────────────────────────────────────────────────
type Tab = "overview" | "users" | "events" | "data" | "comms" | "settings";

type UserRow = {
  id: string; email: string | null; role: string;
  display_name?: string | null; organization_name?: string | null;
  city?: string | null; onboarding_complete?: boolean;
  check_in_count?: number; created_at?: string;
};

type EventRow = {
  id: string; name: string; location: string; created_at: string;
  created_by?: string | null;
  check_in_count: number;
  grades: { total: number; A: number; B: number; C: number };
};

type CheckInRow = {
  id: string; user_id: string; event_id?: string | null;
  lat: number; lng: number; accuracy_m?: number | null;
  created_at: string;
  profile?: { email?: string; display_name?: string; role?: string } | null;
  event?: { name: string; location: string } | null;
};

type GradeRow = {
  id: string; user_id: string; event_id?: string | null;
  grade: string; quantity: number; material?: string | null;
  created_at: string;
  profile?: { email?: string; display_name?: string } | null;
  event?: { name: string; location: string } | null;
};

type NotificationRow = {
  id: string; user_id?: string | null; type: string;
  subject?: string | null; status: string;
  error_message?: string | null; sent_at?: string | null; created_at: string;
  profile?: { email?: string; display_name?: string } | null;
};

type OverviewData = {
  user_count: number;
  events: { id: string; name: string; location: string; check_in_count: number }[];
};

type GradesData = {
  grades: GradeRow[];
  stats: { totalLanyards: number; byGrade: Record<string, number>; byMaterial: Record<string, number> };
};

// ── Constants ───────────────────────────────────────────────────────────────
const CO2_PER_LANYARD_G = 25;
const DEPOSIT_PER_LANYARD_CHF = 2;
const AVG_LANYARDS_PER_CHECKIN = 8;

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",       icon: <IconActivity /> },
  { id: "users",     label: "Users",          icon: <IconUsers /> },
  { id: "events",    label: "Events",         icon: <IconCalendar /> },
  { id: "data",      label: "Data",           icon: <IconDatabase /> },
  { id: "comms",     label: "Communications", icon: <IconBell /> },
  { id: "settings",  label: "Settings",       icon: <IconSettings /> }
];

// ── Main component ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [accessError, setAccessError] = useState<string | null>(null);

  // Per-tab data
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [gradesData, setGradesData] = useState<GradesData | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  // Loading states
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const setLoad = (k: string, v: boolean) =>
    setLoading((p) => ({ ...p, [k]: v }));

  // ── Data fetchers ──────────────────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    setLoad("overview", true);
    try {
      const [ovRes, grRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/admin/grades")
      ]);
      if (!ovRes.ok) {
        const e = await ovRes.json().catch(() => ({}));
        setAccessError((e as { error?: string }).error ?? "Access denied");
        return;
      }
      const [ov, gr] = await Promise.all([ovRes.json(), grRes.json()]);
      setOverview(ov);
      if (gr && !gr.error) setGradesData(gr);
    } finally {
      setLoad("overview", false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoad("users", true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoad("users", false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setLoad("events", true);
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (res.ok) setEvents(Array.isArray(data) ? data : []);
    } finally {
      setLoad("events", false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoad("data", true);
    try {
      const [ciRes, grRes] = await Promise.all([
        fetch("/api/admin/checkins"),
        fetch("/api/admin/grades")
      ]);
      const [ci, gr] = await Promise.all([ciRes.json(), grRes.json()]);
      if (ciRes.ok) setCheckIns(Array.isArray(ci) ? ci : []);
      if (grRes.ok && !gr.error) setGradesData(gr);
    } finally {
      setLoad("data", false);
    }
  }, []);

  const loadComms = useCallback(async () => {
    setLoad("comms", true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (res.ok) setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setLoad("comms", false);
    }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  const switchTab = (t: Tab) => {
    setTab(t);
    if (t === "users" && !users.length) loadUsers();
    if (t === "events" && !events.length) loadEvents();
    if (t === "data" && !checkIns.length) loadData();
    if (t === "comms" && !notifications.length) loadComms();
  };

  // ── Access error ───────────────────────────────────────────────────────
  if (accessError) {
    return (
      <main>
        <div className="card" style={{ padding: 32, maxWidth: 480, margin: "48px auto", textAlign: "center" }}>
          <span style={{ color: "var(--color-error)", display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <IconShield />
          </span>
          <h2 style={{ margin: "0 0 8px", color: "var(--color-error)" }}>Access Denied</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14, margin: "0 0 24px" }}>
            {accessError === "UNAUTHENTICATED"
              ? "Please sign in with an admin account."
              : "Your account does not have admin privileges."}
          </p>
          <a href="/admin/login" className="btn btn-primary">Go to Admin Login</a>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <div className="row row-md" style={{ marginBottom: 6 }}>
          <span style={{ color: "var(--color-primary)" }}><IconShield /></span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Admin Panel
          </h1>
          <span className="badge badge-admin" style={{ marginLeft: 4 }}>Super User</span>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, margin: 0 }}>
          Full platform oversight for LémanLoop Geneva. All actions are logged.
        </p>
      </header>

      {/* Tab navigation */}
      <nav className="admin-tabs" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab${tab === t.id ? " admin-tab-active" : ""}`}
            onClick={() => switchTab(t.id)}
          >
            <span style={{ width: 16, height: 16, display: "inline-flex", flexShrink: 0 }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      {tab === "overview"  && <OverviewTab overview={overview} gradesData={gradesData} loading={!!loading.overview} refresh={loadOverview} />}
      {tab === "users"     && <UsersTab users={users} loading={!!loading.users} refresh={loadUsers} />}
      {tab === "events"    && <EventsTab events={events} loading={!!loading.events} refresh={loadEvents} setEvents={setEvents} />}
      {tab === "data"      && <DataTab checkIns={checkIns} gradesData={gradesData} loading={!!loading.data} refresh={loadData} />}
      {tab === "comms"     && <CommsTab notifications={notifications} users={users} loading={!!loading.comms} refresh={loadComms} loadUsers={loadUsers} />}
      {tab === "settings"  && <SettingsTab />}
    </main>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ overview, gradesData, loading, refresh }: {
  overview: OverviewData | null;
  gradesData: GradesData | null;
  loading: boolean;
  refresh: () => void;
}) {
  const totalCheckIns = overview?.events.reduce((s, e) => s + e.check_in_count, 0) ?? 0;
  const totalLanyards = gradesData?.stats.totalLanyards ?? totalCheckIns * AVG_LANYARDS_PER_CHECKIN;
  const co2 = Math.round((totalLanyards * CO2_PER_LANYARD_G) / 1000 * 10) / 10;
  const deposit = totalLanyards * DEPOSIT_PER_LANYARD_CHF;
  const byGrade = gradesData?.stats.byGrade ?? {};
  const gradeTotal = Object.values(byGrade).reduce((s, v) => s + v, 0) || 1;

  if (loading) return <LoadingState />;

  return (
    <div className="stack stack-lg">
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <div className="stat-card">
          <div className="stat-card-value">{overview?.user_count ?? 0}</div>
          <div className="stat-card-label">Registered users</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{overview?.events.length ?? 0}</div>
          <div className="stat-card-label">Events registered</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{totalCheckIns}</div>
          <div className="stat-card-label">Volunteer check-ins</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{totalLanyards.toLocaleString()}</div>
          <div className="stat-card-label">Lanyards documented</div>
        </div>
      </div>

      {/* Impact metrics */}
      <div className="card" style={{ background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 16px" }}>
          Circular economy impact
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {[
            { v: `${co2} kg`, u: "CO\u2082 saved", sub: "estimated" },
            { v: `CHF ${deposit.toLocaleString()}`, u: "deposit", sub: "in circular flow" },
            { v: String(overview?.events.length ?? 0), u: "certificates", sub: "pending issuance" },
            { v: `${Math.round((byGrade["A"] ?? 0) / gradeTotal * 100)}%`, u: "Grade A", sub: "ready for reuse" }
          ].map((m) => (
            <div key={m.u} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>{m.v}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{m.u}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Grade breakdown bar */}
        {gradeTotal > 1 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 8 }}>
              Grade distribution (A / B / C)
            </p>
            <div className="grade-bar-wrap">
              {[
                { k: "A", cls: "grade-bar-a" },
                { k: "B", cls: "grade-bar-b" },
                { k: "C", cls: "grade-bar-c" }
              ].map(({ k, cls }) => (
                <div
                  key={k}
                  className={cls}
                  style={{ flex: (byGrade[k] ?? 0) / gradeTotal, minWidth: byGrade[k] ? 4 : 0 }}
                  title={`Grade ${k}: ${byGrade[k] ?? 0} lanyards`}
                />
              ))}
            </div>
            <div className="row row-md" style={{ marginTop: 6 }}>
              {["A", "B", "C"].map((k) => (
                <span key={k} style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  Grade {k}: {byGrade[k] ?? 0}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Events list */}
      {(overview?.events.length ?? 0) > 0 && (
        <div className="card-elevated">
          <div className="row row-md" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, flex: 1 }}>Event participation</h2>
            <button onClick={refresh} className="btn btn-ghost btn-sm">
              <IconRefresh /> Refresh
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Venue</th>
                  <th>Check-ins</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {overview!.events.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.name}</td>
                    <td className="td-muted">{e.location}</td>
                    <td>{e.check_in_count}</td>
                    <td>
                      <span className={`badge ${e.check_in_count > 0 ? "badge-success" : "badge-neutral"}`}>
                        {e.check_in_count > 0 ? "Certificate ready" : "Awaiting"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Users tab ────────────────────────────────────────────────────────────────
function UsersTab({ users, loading, refresh }: {
  users: UserRow[]; loading: boolean; refresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<UserRow[]>(users);

  useEffect(() => { setLocalUsers(users); }, [users]);

  const filtered = localUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.display_name?.toLowerCase().includes(q) ||
      u.role.includes(q)
    );
  });

  const updateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) {
        alert((data as { error?: string }).error || "Failed to update");
        return;
      }
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const sendReminder = async (userId: string, type: string) => {
    try {
      const res = await fetch("/api/admin/remind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: userId, type })
      });
      const data = await res.json();
      if (res.ok) {
        alert((data as { message?: string }).message || "Email queued.");
      } else {
        alert((data as { error?: string }).error || "Failed");
      }
    } catch {
      alert("Network error");
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="stack stack-lg">
      <div className="row row-md" style={{ flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }}>
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name, or role…"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button onClick={refresh} className="btn btn-ghost btn-sm">
          <IconRefresh /> Refresh
        </button>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)", alignSelf: "center" }}>
          {filtered.length} / {localUsers.length} users
        </span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Check-ins</th>
              <th>Joined</th>
              <th>Change role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {u.email || "—"}
                </td>
                <td className="td-muted">
                  {u.display_name || u.organization_name || "—"}
                </td>
                <td>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </td>
                <td className="td-muted">{u.check_in_count ?? 0}</td>
                <td className="td-muted">{formatDateOrDash(u.created_at)}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    disabled={updatingId === u.id}
                    style={{ width: "auto", padding: "5px 10px", fontSize: 13 }}
                  >
                    <option value="volunteer">volunteer</option>
                    <option value="organizer">organizer</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <div className="row row-sm">
                    <button
                      onClick={() => sendReminder(u.id, "welcome")}
                      className="btn btn-ghost btn-sm"
                      title="Send welcome email"
                    >
                      <IconMail />
                    </button>
                    <button
                      onClick={() => sendReminder(u.id, "event_reminder")}
                      className="btn btn-ghost btn-sm"
                      title="Send event reminder"
                    >
                      <IconBell />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            {search ? "No users match your search." : "No users yet."}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Events tab ───────────────────────────────────────────────────────────────
function EventsTab({ events, loading, refresh, setEvents }: {
  events: EventRow[]; loading: boolean; refresh: () => void;
  setEvents: React.Dispatch<React.SetStateAction<EventRow[]>>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (e: EventRow) => {
    setEditingId(e.id);
    setEditName(e.name);
    setEditLocation(e.location);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: editName, location: editLocation })
      });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, name: editName, location: editLocation } : e))
        );
        setEditingId(null);
      } else {
        alert((data as { error?: string }).error || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its check-ins? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } else {
      const data = await res.json();
      alert((data as { error?: string }).error || "Failed to delete");
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="stack stack-lg">
      <div className="row row-md">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, flex: 1, margin: 0 }}>
          {events.length} events
        </h2>
        <button onClick={refresh} className="btn btn-ghost btn-sm">
          <IconRefresh /> Refresh
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Event name</th>
              <th>Venue</th>
              <th>Check-ins</th>
              <th>Lanyards (A/B/C)</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>
                  {editingId === e.id ? (
                    <input
                      value={editName}
                      onChange={(ev) => setEditName(ev.target.value)}
                      style={{ width: "100%", minWidth: 160 }}
                    />
                  ) : (
                    <span style={{ fontWeight: 500 }}>{e.name}</span>
                  )}
                </td>
                <td className="td-muted">
                  {editingId === e.id ? (
                    <input
                      value={editLocation}
                      onChange={(ev) => setEditLocation(ev.target.value)}
                      style={{ width: "100%", minWidth: 140 }}
                    />
                  ) : (
                    e.location
                  )}
                </td>
                <td>{e.check_in_count}</td>
                <td>
                  {e.grades.total > 0 ? (
                    <span style={{ fontSize: 13 }}>
                      {e.grades.total} ({e.grades.A}A / {e.grades.B}B / {e.grades.C}C)
                    </span>
                  ) : (
                    <span className="td-muted">—</span>
                  )}
                </td>
                <td className="td-muted">{formatDateOrDash(e.created_at)}</td>
                <td>
                  {editingId === e.id ? (
                    <div className="row row-sm">
                      <button
                        onClick={() => saveEdit(e.id)}
                        disabled={saving}
                        className="btn btn-primary btn-sm"
                      >
                        <IconCheckCircle /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-ghost btn-sm"
                      >
                        <IconX />
                      </button>
                    </div>
                  ) : (
                    <div className="row row-sm">
                      <button
                        onClick={() => startEdit(e)}
                        className="btn btn-ghost btn-sm"
                        title="Edit event"
                      >
                        <IconPencil />
                      </button>
                      <button
                        onClick={() => deleteEvent(e.id, e.name)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--color-error)" }}
                        title="Delete event"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <p style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            No events registered yet.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Data tab ─────────────────────────────────────────────────────────────────
function DataTab({ checkIns, gradesData, loading, refresh }: {
  checkIns: CheckInRow[]; gradesData: GradesData | null;
  loading: boolean; refresh: () => void;
}) {
  const [subTab, setSubTab] = useState<"checkins" | "grades">("grades");

  const exportCSV = (rows: object[], filename: string) => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]).filter((k) => typeof rows[0 as never][k as never] !== "object");
    const csv = [
      keys.join(","),
      ...rows.map((r) =>
        keys.map((k) => JSON.stringify(String((r as never)[k as never] ?? ""))).join(",")
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  if (loading) return <LoadingState />;

  const grades = gradesData?.grades ?? [];
  const stats = gradesData?.stats;

  return (
    <div className="stack stack-lg">
      <div className="row row-md" style={{ flexWrap: "wrap" }}>
        <div className="row row-sm">
          <button
            className={`admin-tab${subTab === "grades" ? " admin-tab-active" : ""}`}
            onClick={() => setSubTab("grades")}
            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}
          >
            Lanyard grades
          </button>
          <button
            className={`admin-tab${subTab === "checkins" ? " admin-tab-active" : ""}`}
            onClick={() => setSubTab("checkins")}
            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}
          >
            Check-ins
          </button>
        </div>
        <button onClick={refresh} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>
          <IconRefresh /> Refresh
        </button>
        <button
          onClick={() =>
            subTab === "grades"
              ? exportCSV(grades, "lanyard-grades.csv")
              : exportCSV(checkIns, "check-ins.csv")
          }
          className="btn btn-secondary btn-sm"
        >
          <IconDownload /> Export CSV
        </button>
      </div>

      {subTab === "grades" && (
        <div className="stack stack-md">
          {stats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <div className="stat-card">
                <div className="stat-card-value">{stats.totalLanyards.toLocaleString()}</div>
                <div className="stat-card-label">Total lanyards graded</div>
              </div>
              {Object.entries(stats.byGrade).map(([g, n]) => (
                <div key={g} className="stat-card">
                  <div className="stat-card-value">{n}</div>
                  <div className="stat-card-label">Grade {g}</div>
                </div>
              ))}
            </div>
          )}

          {stats && Object.keys(stats.byMaterial).length > 0 && (
            <div className="card">
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 10 }}>
                Material breakdown
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(stats.byMaterial).sort((a, b) => b[1] - a[1]).map(([m, n]) => (
                  <span key={m} className="badge badge-neutral" style={{ fontSize: 12 }}>
                    {m}: {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Event</th>
                  <th>Grade</th>
                  <th>Qty</th>
                  <th>Material</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.slice(0, 100).map((g) => (
                  <tr key={g.id}>
                    <td className="td-muted">{g.profile?.email ?? g.user_id.slice(0, 8)}</td>
                    <td className="td-muted">{g.event?.name ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${g.grade === "A" ? "badge-success" : g.grade === "B" ? "badge-warning" : "badge-error"}`}
                      >
                        {g.grade}
                      </span>
                    </td>
                    <td>{g.quantity}</td>
                    <td className="td-muted">{g.material ?? "—"}</td>
                    <td className="td-muted">{formatDateOrDash(g.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {grades.length === 0 && (
              <p style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
                No lanyard grades recorded yet.
              </p>
            )}
          </div>
        </div>
      )}

      {subTab === "checkins" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Event</th>
                <th>Coordinates</th>
                <th>Accuracy</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {checkIns.slice(0, 200).map((c) => (
                <tr key={c.id}>
                  <td className="td-muted">{c.profile?.email ?? c.user_id.slice(0, 8)}</td>
                  <td className="td-muted">{c.event?.name ?? "—"}</td>
                  <td className="td-mono">{c.lat.toFixed(5)}, {c.lng.toFixed(5)}</td>
                  <td className="td-muted">{c.accuracy_m ? `±${Math.round(c.accuracy_m)}m` : "—"}</td>
                  <td className="td-muted">{formatDateTime(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {checkIns.length === 0 && (
            <p style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
              No check-ins yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Communications tab ───────────────────────────────────────────────────────
function CommsTab({ notifications, users, loading, refresh, loadUsers }: {
  notifications: NotificationRow[]; users: UserRow[];
  loading: boolean; refresh: () => void; loadUsers: () => void;
}) {
  const [recipientId, setRecipientId] = useState("");
  const [emailType, setEmailType] = useState("event_reminder");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");

  useEffect(() => {
    if (!users.length) loadUsers();
  }, [users.length, loadUsers]);

  const sendEmail = async () => {
    if (!recipientId) { setSendStatus("Please select a recipient."); return; }
    setSending(true);
    setSendStatus("");
    try {
      const res = await fetch("/api/admin/remind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: recipientId, type: emailType, message })
      });
      const data = await res.json();
      setSendStatus(
        res.ok
          ? (data as { message?: string }).message || "Sent."
          : (data as { error?: string }).error || "Failed."
      );
      if (res.ok) {
        setRecipientId("");
        setMessage("");
        setTimeout(refresh, 1000);
      }
    } finally {
      setSending(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      sent: "badge-success", failed: "badge-error",
      skipped: "badge-warning", pending: "badge-neutral"
    };
    return map[status] ?? "badge-neutral";
  };

  if (loading) return <LoadingState />;

  return (
    <div className="stack stack-lg">
      {/* Send email form */}
      <div className="card-elevated">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 20px" }}>Send email</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <label>Recipient</label>
            <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)}>
              <option value="">Select a user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Email type</label>
            <select value={emailType} onChange={(e) => setEmailType(e.target.value)}>
              <option value="welcome">Welcome email</option>
              <option value="event_reminder">Event reminder</option>
              <option value="deposit_reminder">Deposit reminder</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label>Optional message (max 500 chars)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Add a personalised note to include in the email…"
            style={{ resize: "vertical" }}
          />
        </div>
        <div className="row row-md" style={{ marginTop: 16 }}>
          <button onClick={sendEmail} disabled={sending} className="btn btn-primary btn-sm">
            <IconMail /> {sending ? "Sending…" : "Send email"}
          </button>
          {sendStatus && (
            <span style={{ fontSize: 13, color: sendStatus.includes("Failed") || sendStatus.includes("error") ? "var(--color-error)" : "var(--color-success)" }}>
              {sendStatus}
            </span>
          )}
        </div>
      </div>

      {/* Notification log */}
      <div>
        <div className="row row-md" style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, flex: 1, margin: 0 }}>
            Notification log ({notifications.length})
          </h2>
          <button onClick={refresh} className="btn btn-ghost btn-sm">
            <IconRefresh /> Refresh
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td className="td-muted">{n.profile?.email ?? "—"}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: 11 }}>{n.type}</span>
                  </td>
                  <td className="td-muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {n.subject ?? "—"}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(n.status)}`}>{n.status}</span>
                  </td>
                  <td className="td-muted">{formatDateTime(n.sent_at ?? n.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {notifications.length === 0 && (
            <p style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
              No notifications sent yet. Configure RESEND_API_KEY to enable email delivery.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Settings tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const configs = [
    { label: "Deposit per lanyard", value: "CHF 2.00", note: "Refunded for Grade A/B returns" },
    { label: "CO\u2082 saved per lanyard", value: "25 g", note: "Based on lifecycle analysis vs virgin manufacture" },
    { label: "Avg lanyards per check-in", value: "8", note: "Used for estimated impact in overview" },
    { label: "Grade A — threshold", value: "Clean, intact clip", note: "Ready for immediate reuse" },
    { label: "Grade B — threshold", value: "Minor soiling/wear", note: "Reusable after cleaning" },
    { label: "Grade C — threshold", value: "Broken clip or heavy soiling", note: "Routes to upcycling/recycling" },
    { label: "Karma points per lanyard", value: "10 pts", note: "Redeemable for event tickets and rewards" }
  ];

  return (
    <div className="stack stack-lg">
      <div className="card" style={{ padding: "20px 24px", background: "var(--color-warning-soft)", borderColor: "var(--color-warning)" }}>
        <p style={{ fontSize: 14, color: "var(--color-warning)", margin: 0 }}>
          Platform configuration is currently managed in code. To change these values, update the
          constants in the relevant API routes and pages, then redeploy.
        </p>
      </div>

      <div className="card-elevated">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 20px" }}>
          Platform configuration
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {configs.map((c, i) => (
            <div
              key={c.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 12,
                padding: "14px 0",
                borderBottom: i < configs.length - 1 ? "1px solid var(--color-border)" : "none",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-mono)"
                }}
              >
                {c.value}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{c.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>
          Environment variables
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "NEXT_PUBLIC_SUPABASE_URL", desc: "Supabase project URL" },
            { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", desc: "Supabase anon key" },
            { key: "SUPABASE_SERVICE_ROLE_KEY", desc: "Service role key (for notification logging)" },
            { key: "RESEND_API_KEY", desc: "Resend email delivery API key" },
            { key: "RESEND_FROM_EMAIL", desc: "Sender email address" }
          ].map((v) => (
            <div key={v.key} className="row row-md">
              <code
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  padding: "3px 8px",
                  background: "var(--color-bg)",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--color-border)",
                  whiteSpace: "nowrap"
                }}
              >
                {v.key}
              </code>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 8px" }}>
          Karma rewards tiers
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 16 }}>
          {[
            { pts: "10", reward: "Per lanyard collected" },
            { pts: "100", reward: "1 community event ticket" },
            { pts: "500", reward: "Annual tram day-pass" },
            { pts: "1 000", reward: "Partner NGO membership" }
          ].map((k) => (
            <div key={k.pts} className="card" style={{ padding: "14px 16px" }}>
              <div className="row row-sm" style={{ marginBottom: 6 }}>
                <span style={{ color: "var(--color-primary)" }}><IconStar /></span>
                <span style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "1.1rem" }}>{k.pts}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{k.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ padding: "48px 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
      Loading…
    </div>
  );
}

