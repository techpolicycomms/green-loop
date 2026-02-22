"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabaseClient";
import { IconShield, IconLock } from "@/components/Icons";
import { useSearchParams } from "next/navigation";

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | null>(null);

  const signIn = async (provider: "google") => {
    setOauthError(null);
    setLoading(provider);
    try {
      const supabase = createBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=/admin`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });
      if (error) setOauthError("Sign-in failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px"
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Admin identity */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--role-admin-bg)",
              marginBottom: 16,
              boxShadow: "var(--shadow-md)"
            }}
          >
            <span style={{ color: "var(--role-admin-text)" }}>
              <IconLock />
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 8px",
              letterSpacing: "-0.02em"
            }}
          >
            Admin Access
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
            Restricted to LémanLoop super users only.
          </p>
        </div>

        {/* Access denied */}
        {reason === "access_denied" && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "var(--color-error-soft)",
              border: "1px solid var(--color-error)",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              color: "var(--color-error)",
              lineHeight: 1.5
            }}
          >
            Your account does not have admin privileges. Contact your platform administrator to
            request access.
          </div>
        )}

        {oauthError && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "var(--color-error-soft)",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              color: "var(--color-error)"
            }}
          >
            {oauthError}
          </div>
        )}

        <div className="card-elevated">
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 24,
              lineHeight: 1.6
            }}
          >
            Sign in with your admin-authorised account. All admin actions are logged and audited.
            If you&apos;re a volunteer or organiser, use the{" "}
            <Link href="/login" style={{ color: "var(--color-primary)" }}>
              standard sign-in page
            </Link>{" "}
            instead.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => signIn("google")}
              disabled={loading !== null}
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", gap: 14, padding: "12px 18px" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading === "google" ? "Redirecting..." : "Continue with Google"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 24,
              fontSize: 12,
              color: "var(--color-text-subtle)"
            }}
          >
            <IconShield />
            <span>Secure sign-in. All admin sessions are logged.</span>
          </div>
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
