"use client";

import { useEffect, useState } from "react";
import { IconUsers, IconShield } from "@/components/Icons";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setUsers([]);
      setError((data as { error?: string })?.error || "Access denied. Admin role required.");
      return;
    }
    setUsers(Array.isArray(data) ? data : []);
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
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15 }}>
          View and manage all users. Admin-only access — requires admin role in your profile.
        </p>
      </header>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            padding: 16,
            background: "var(--color-error-soft)",
            borderColor: "var(--color-error)",
            display: "flex",
            alignItems: "center",
            gap: 12
          }}
        >
          <span style={{ color: "var(--color-error)", flexShrink: 0 }}><IconShield /></span>
          <span style={{ color: "var(--color-error)", fontSize: 14 }}>{error}</span>
        </div>
      )}

      <section className="card-elevated">
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 20, color: "var(--color-text)" }}>
          Users
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "2px solid var(--color-border)"
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "2px solid var(--color-border)"
                  }}
                >
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid var(--color-border)"
                  }}
                >
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--color-text)" }}>{u.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--color-accent-soft)",
                        color: "var(--color-primary)"
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !error && (
          <p style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            No users yet.
          </p>
        )}
      </section>
    </main>
  );
}
