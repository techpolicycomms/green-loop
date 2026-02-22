"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconLeaf } from "./Icons";

type UserProfile = { email: string; role: string } | null;

// Role-specific dashboard links shown when signed in
const ROLE_NAV: Record<string, { href: string; label: string }[]> = {
  volunteer: [{ href: "/volunteer", label: "My Dashboard" }],
  organizer: [{ href: "/organizer", label: "My Events" }],
  admin: [
    { href: "/volunteer", label: "Volunteer" },
    { href: "/organizer", label: "Organizer" },
    { href: "/admin", label: "Admin" }
  ]
};

export default function Nav() {
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const pathname = usePathname();

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

  const roleLinks = userProfile ? (ROLE_NAV[userProfile.role] ?? []) : [];
  const roleBadgeClass = userProfile ? `badge badge-${userProfile.role}` : "badge badge-neutral";

  return (
    <nav
      style={{
        padding: "0 24px",
        height: 56,
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-xs)"
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
          fontSize: "1rem",
          color: "var(--color-text)",
          textDecoration: "none",
          flexShrink: 0
        }}
      >
        <span style={{ color: "var(--color-primary)" }}>
          <IconLeaf />
        </span>
        LémanLoop
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, marginLeft: 4 }}>
        <Link href="/" className={`nav-link${pathname === "/" ? " nav-link-active" : ""}`}>
          Home
        </Link>

        {userProfile
          ? roleLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname.startsWith(l.href) ? " nav-link-active" : ""}`}
              >
                {l.label}
              </Link>
            ))
          : (
            <>
              <Link
                href="/volunteer"
                className={`nav-link hide-sm${pathname.startsWith("/volunteer") ? " nav-link-active" : ""}`}
              >
                Volunteer
              </Link>
              <Link
                href="/organizer"
                className={`nav-link hide-sm${pathname.startsWith("/organizer") ? " nav-link-active" : ""}`}
              >
                Organizer
              </Link>
            </>
          )
        }
      </div>

      {/* User area */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {userProfile ? (
          <>
            <span
              className="hide-sm"
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {userProfile.email}
            </span>
            <span className={roleBadgeClass}>{userProfile.role}</span>
            <form action="/auth/signout" method="post" style={{ display: "inline" }}>
              <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
            </form>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
