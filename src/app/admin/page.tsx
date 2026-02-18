"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconUsers, IconShield, IconMail } from "@/components/Icons";

type User = { id: string; email: string | null; role: string };
type EventStat = { id: string; name: string; location: string; check_in_count: number };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [overview, setOverview] = useState<{ user_count: number; events: EventStat[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const [usersRes, overviewRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/overview")
    ]);
    const usersData = await usersRes.json().catch(() => ({}));
    const overviewData = await overviewRes.json().catch(() => ({}));

    if (!usersRes.ok) {
      setUsers([]);
      const msg = (usersData as { error?: string }).error || "Access denied";
      setError(msg === "UNAUTHENTICATED" ? "Please sign in to access the Admin panel." : msg);
      return;
    }
    setUsers(Array.isArray(usersData) ? usersData : []);
    if (overviewRes.ok && overviewData.events) {
      setOverview({ user_count: overviewData.user_count ?? 0, events: overviewData.events ?? [] });
    }
  };

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
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } finally {
      setUpdatingId(null);
    }
  };

  const sendReminder = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/remind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: userId, type: "event_reminder" })
      });
      const data = await res.json();
      if (res.ok) alert("Reminder queued. (Email integration pending)");
      else alert((data as { error?: string }).error || "Failed");
    } catch {
      alert("Failed to send reminder");
    }
  };

  useEffect(() => void load(), []);

  return (
    <main>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconUsers />
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
            Admin Panel
          </h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15, lineHeight: 1.5 }}>
          Manage users, change roles, send reminders, and monitor event participation. Full platform oversight.
        </p>
      </header>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            padding: 20,
            background: "var(--color-error-soft)",
            borderColor: "var(--color-error)",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "var(--color-error)", flexShrink: 0 }}><IconShield /></span>
            <span style={{ color: "var(--color-error)", fontSize: 14 }}>{error}</span>
          </div>
          {error.includes("sign in") && (
            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "var(--color-primary)",
                color: "white",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none"
              }}
            >
              Go to Sign in
            </Link>
          )}
        </div>
      )}

      {!error && overview && (
        <section className="card-elevated" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 16, color: "var(--color-text)" }}>
            Platform overview
          </h2>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "var(--color-primary)" }}>{overview.user_count}</span>
              <span style={{ marginLeft: 8, color: "var(--color-text-muted)" }}>users</span>
            </div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "var(--color-primary)" }}>{overview.events.length}</span>
              <span style={{ marginLeft: 8, color: "var(--color-text-muted)" }}>events</span>
            </div>
          </div>
          {overview.events.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--color-text-muted)" }}>Event participation</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {overview.events.map((e) => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                    <span><strong>{e.name}</strong> — {e.location}</span>
                    <span style={{ color: "var(--color-primary-muted)", fontSize: 14 }}>{e.check_in_count} check-ins</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!error && (
        <section className="card-elevated">
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 20, color: "var(--color-text)" }}>
            User management
          </h2>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16 }}>
            Change roles (volunteer → organizer → admin) or send email reminders.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--color-border)" }}>Email</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--color-border)" }}>Role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--color-border)" }}>Change role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--color-border)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--color-text)" }}>{u.email || "—"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ display: "inline-block", padding: "4px 10px", fontSize: 12, fontWeight: 500, borderRadius: "var(--radius-sm)", background: "var(--color-accent-soft)", color: "var(--color-primary)" }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                        style={{ padding: "6px 10px", fontSize: 13, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface)", cursor: updatingId === u.id ? "wait" : "pointer" }}
                      >
                        <option value="volunteer">volunteer</option>
                        <option value="organizer">organizer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => sendReminder(u.id)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, background: "var(--color-accent-soft)", color: "var(--color-primary)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                      >
                        <IconMail style={{ width: 14, height: 14 }} />
                        Remind
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && !error && (
            <p style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>No users yet.</p>
          )}
        </section>
      )}
    </main>
  );
}
