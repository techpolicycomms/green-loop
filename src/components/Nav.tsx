"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconLeaf } from "./Icons";

type UserProfile = { email: string; role: string } | null;

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#fee2e2", color: "#b91c1c" },
  organizer: { bg: "#dbeafe", color: "#1d4ed8" },
  volunteer: { bg: "#dcfce7", color: "#15803d" }
};

export default function Nav() {
  const [userProfile, setUserProfile] = useState<UserProfile>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(({ user, profile }) => {
        if (user) {
          setUserProfile({
            email: profile?.email || user.email || "",
            role: profile?.role || "volunteer"
          });
        }
      })
      .catch(() => {});
  }, []);

  const roleStyle = userProfile ? (ROLE_COLORS[userProfile.role] ?? ROLE_COLORS.volunteer) : null;

  return (
    <nav
      style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 600,
          fontSize: "1.15rem",
          color: "var(--color-text)"
        }}
      >
        <span style={{ color: "var(--color-primary)" }}>
          <IconLeaf />
        </span>
        LémanLoop
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/volunteer">Volunteer</NavLink>
        <NavLink href="/organizer">Organizer</NavLink>
        <NavLink href="/admin">Admin</NavLink>

        {userProfile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: 4,
              padding: "6px 12px",
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)"
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {userProfile.email}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                background: roleStyle?.bg,
                color: roleStyle?.color,
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              {userProfile.role}
            </span>
          </div>
        )}

        <form action="/auth/signout" method="post" style={{ display: "inline" }}>
          <button
            type="submit"
            style={{
              marginLeft: 4,
              padding: "8px 14px",
              fontSize: 14,
              color: "var(--color-text-muted)",
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition)"
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: "8px 12px",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--color-text-muted)",
        borderRadius: "var(--radius-sm)",
        transition: "all var(--transition)"
      }}
    >
      {children}
    </Link>
  );
}
