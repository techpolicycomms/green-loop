"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabaseClient";
import { IconShield } from "@/components/Icons";
import { useSearchParams } from "next/navigation";

const ADMIN_CAPABILITIES = [
  "Platform overview and analytics dashboard",
  "User management and role assignment",
  "Event moderation and grade data export",
  "Email communications and notification log"
];

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setOauthError(null);
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=/admin`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });
      if (error) {
        setOauthError("Sign-in failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setOauthError("Could not connect. Please check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface-raised) 100%)"
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Header badge */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "var(--radius-lg)",
              background: "var(--color-primary)",
              marginBottom: 16,
              boxShadow: "0 4px 20px rgba(45, 106, 79, 0.3)"
            }}
          >
            <span style={{ color: "#fff" }}>
              <IconShield />
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 6px",
              letterSpacing: "-0.02em"
            }}
          >
            Admin Console
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
            Platform management for authorised administrators
          </p>
        </div>

        {/* Access denied alert */}
        {reason === "access_denied" && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 18px",
              background: "var(--color-error-soft)",
              border: "1px solid var(--color-error)",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              color: "var(--color-error)",
              lineHeight: 1.55
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>Access denied</strong>
            Your account does not have admin privileges. If you believe this is an error,
            contact your platform administrator.
          </div>
        )}

        {oauthError && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 18px",
              background: "var(--color-error-soft)",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              color: "var(--color-error)"
            }}
          >
            {oauthError}
          </div>
        )}

        {/* Main card */}
        <div className="card-elevated" style={{ padding: "32px 28px" }}>

          {/* Capabilities */}
          <div style={{ marginBottom: 24 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-subtle)",
              marginBottom: 12
            }}>
              Admin access includes
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {ADMIN_CAPABILITIES.map((cap) => (
                <li key={cap} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--color-primary)", flexShrink: 0
                  }} />
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ height: 1, background: "var(--color-border)", margin: "0 0 24px" }} />

          {/* Sign-in */}
          <button
            onClick={signIn}
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              gap: 12,
              padding: "13px 20px",
              fontSize: 15
            }}
          >
            {loading ? (
              "Redirecting to Google..."
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fillOpacity="0.9" />
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fillOpacity="0.85" />
                  <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fillOpacity="0.8" />
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fillOpacity="0.75" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            marginTop: 16, fontSize: 12, color: "var(--color-text-subtle)", justifyContent: "center"
          }}>
            <IconShield />
            <span>All admin sessions are logged and audited</span>
          </div>
        </div>

        {/* Not an admin CTA */}
        <div style={{
          marginTop: 20,
          padding: "16px 20px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          textAlign: "center"
        }}>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 8px" }}>
            Not an administrator?
          </p>
          <Link
            href="/login"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 13 }}
          >
            Go to standard sign-in
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}
