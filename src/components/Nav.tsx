"use client";

import Link from "next/link";
import { IconLeaf } from "./Icons";

export default function Nav() {
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
        GreenLoop
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/volunteer">Volunteer</NavLink>
        <NavLink href="/organizer">Organizer</NavLink>
        <NavLink href="/admin">Admin</NavLink>

        <form action="/auth/signout" method="post" style={{ display: "inline" }}>
          <button
            type="submit"
            style={{
              marginLeft: 8,
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
