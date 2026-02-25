"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconLeaf, IconMenu } from "./Icons";

type UserProfile = {
  id: string;
  email: string;
  role: string;
  extra_roles: string[];
  display_name?: string | null;
  avatar_url?: string | null;
} | null;

export default function Nav() {
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(({ user, profile }) => {
        if (user) {
          setUserProfile({
            id: user.id,
            email: profile?.email || user.email || "",
            role: profile?.role || "volunteer",
            extra_roles: (profile?.extra_roles as string[] | null) ?? [],
            display_name: profile?.display_name ?? null,
            avatar_url: profile?.avatar_url ?? null
          });
        }
      })
      .catch(() => {});
  }, []);

  // Build nav links dynamically based on all roles held
  const buildRoleLinks = (up: UserProfile) => {
    if (!up) return [];
    const allRoles = [up.role, ...up.extra_roles];
    const links: { href: string; label: string }[] = [];
    if (allRoles.includes("volunteer")) links.push({ href: "/volunteer", label: "Volunteer" });
    if (allRoles.includes("organizer")) links.push({ href: "/organizer", label: "Organiser" });
    if (up.role === "admin") links.push({ href: "/admin", label: "Admin" });
    return links;
  };

  const roleLinks = buildRoleLinks(userProfile);

  // Active mode indicator for dual-role users (#23)
  const allUserRoles = userProfile ? [userProfile.role, ...userProfile.extra_roles] : [];
  const isMultiRole = allUserRoles.length > 1;
  const activeContextRole = pathname.startsWith("/volunteer") ? "volunteer"
    : pathname.startsWith("/organizer") ? "organizer"
    : pathname.startsWith("/admin") ? "admin"
    : null;
  const badgeRole = (isMultiRole && activeContextRole) ? activeContextRole : userProfile?.role ?? "";
  const badgeLabel = (isMultiRole && activeContextRole) ? `${activeContextRole} mode` : userProfile?.role ?? "";
  const roleBadgeClass = `badge badge-${badgeRole}`;

  const displayLabel = userProfile?.display_name || userProfile?.email?.split("@")[0] || "";
  const avatarInitial = displayLabel.charAt(0).toUpperCase();

  return (
    <>
      <nav
        style={{
          padding: "0 20px",
          height: 56,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "var(--shadow-xs)"
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "1rem", color: "var(--color-text)", textDecoration: "none", flexShrink: 0 }}
        >
          <span style={{ color: "var(--color-primary)" }}><IconLeaf /></span>
          LémanLoop
        </Link>

        {/* Nav links (desktop) */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, marginLeft: 4, overflow: "hidden" }}>
          <Link href="/" className={`nav-link${pathname === "/" ? " nav-link-active" : ""}`}>
            Home
          </Link>

          {userProfile
            ? roleLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link hide-sm${pathname.startsWith(l.href) ? " nav-link-active" : ""}`}
                >
                  {l.label}
                </Link>
              ))
            : (
              <>
                <Link href="/volunteer" className={`nav-link hide-sm${pathname.startsWith("/volunteer") ? " nav-link-active" : ""}`}>
                  Volunteer
                </Link>
                <Link href="/organizer" className={`nav-link hide-sm${pathname.startsWith("/organizer") ? " nav-link-active" : ""}`}>
                  Organiser
                </Link>
              </>
            )
          }
          <Link href="/about" className={`nav-link hide-sm${pathname === "/about" ? " nav-link-active" : ""}`}>
            About
          </Link>
          <Link href="/demo" className={`nav-link hide-sm${pathname === "/demo" ? " nav-link-active" : ""}`}>
            Demo
          </Link>
        </div>

        {/* User area */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {userProfile ? (
            <>
              <span className={`${roleBadgeClass} hide-sm`} style={{ fontSize: 11 }}>{badgeLabel}</span>

              {/* Avatar / profile link */}
              <Link
                href="/profile"
                style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                title="My profile"
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: userProfile.avatar_url ? "transparent" : "var(--color-accent-soft)",
                  border: "2px solid var(--color-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", cursor: "pointer", flexShrink: 0
                }}>
                  {userProfile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userProfile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{avatarInitial}</span>
                  )}
                </div>
                <span className="hide-sm" style={{ fontSize: 13, color: "var(--color-text-muted)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayLabel}
                </span>
              </Link>

              <form action="/auth/signout" method="post" style={{ display: "inline" }}>
                <button type="submit" className="btn btn-ghost btn-sm hide-sm">Sign out</button>
              </form>

              {/* Hamburger button — mobile only (#3) */}
              <button
                className="show-sm-only"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "6px 8px", borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-muted)", display: "flex", alignItems: "center"
                }}
              >
                <IconMenu />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </div>
      </nav>

      {/* Mobile drawer (#3) */}
      {menuOpen && userProfile && (
        <div
          style={{
            position: "fixed", top: 56, left: 0, right: 0,
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
            zIndex: 99,
            padding: "12px 20px 16px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Link href="/" className={`nav-link${pathname === "/" ? " nav-link-active" : ""}`} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            {roleLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname.startsWith(l.href) ? " nav-link-active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/profile" className={`nav-link${pathname === "/profile" ? " nav-link-active" : ""}`} onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <Link href="/about" className={`nav-link${pathname === "/about" ? " nav-link-active" : ""}`} onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <Link href="/demo" className={`nav-link${pathname === "/demo" ? " nav-link-active" : ""}`} onClick={() => setMenuOpen(false)}>
              Demo
            </Link>
            <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 8, paddingTop: 8 }}>
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start" }}>Sign out</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
