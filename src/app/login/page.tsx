"use client";

import { Suspense, useState } from "react";
import { createBrowserClient } from "@/lib/supabaseClient";
import { IconShield } from "@/components/Icons";
import { useSearchParams } from "next/navigation";

const VALUE_PROPS = [
  "Diverts lanyards from Geneva landfill",
  "Earn karma points redeemable for event tickets",
  "Verified CO\u2082 impact certificate for each event",
  "CHF 2 deposit refund for Grade A/B returns"
];

function LoginContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const error = urlError || oauthError;

  const signIn = async (provider: "google" | "apple") => {
    setOauthError(null);
    const supabase = createBrowserClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = `${origin}/auth/callback`;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    });
    if (err) setOauthError("Could not start sign-in. Please check your connection and try again.");
  };

  return (
    <main>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-lg)",
          minHeight: 500
        }}
      >
        {/* ── Left panel: value proposition ─────────────────────────── */}
        <div
          className="hide-sm"
          style={{
            background: "var(--color-primary)",
            padding: "48px 44px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 20
              }}
            >
              LémanLoop
            </p>
            <h2
              style={{
                fontSize: "1.65rem",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.25,
                margin: "0 0 14px",
                letterSpacing: "-0.02em"
              }}
            >
              Geneva&apos;s circular lanyard economy
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.65,
                margin: "0 0 32px"
              }}
            >
              Join the platform that turns event waste into a shared resource — for volunteers,
              organisers, and the city.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {VALUE_PROPS.map((prop) => (
                <li
                  key={prop}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.5
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      marginTop: 1
                    }}
                  >
                    &#10003;
                  </span>
                  {prop}
                </li>
              ))}
            </ul>
          </div>

          {/* Impact callout */}
          <div
            style={{
              marginTop: 40,
              padding: "18px 22px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,255,255,0.15)"
            }}
          >
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.02em" }}>
              500+
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
              lanyards saved at every large Geneva event
            </div>
          </div>
        </div>

        {/* ── Right panel: sign-in form ──────────────────────────────── */}
        <div
          style={{
            background: "var(--color-surface)",
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: "0 0 8px",
              color: "var(--color-text)",
              letterSpacing: "-0.02em"
            }}
          >
            Welcome to LémanLoop
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 32, lineHeight: 1.55 }}>
            Sign up or sign in — no password needed. Use the same provider each time.
          </p>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                fontWeight: 500,
                background: "var(--color-error-soft)",
                color: "var(--color-error)",
                border: "1px solid var(--color-error-soft)"
              }}
            >
              Sign-in failed. Please try again, or contact us if the problem continues.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Google */}
            <button
              onClick={() => signIn("google")}
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", gap: 14, padding: "12px 18px" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              onClick={() => signIn("apple")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 18px",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                background: "var(--color-text)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "opacity var(--transition)",
                width: "100%"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign in with Apple
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 28,
              fontSize: 12,
              color: "var(--color-text-subtle)"
            }}
          >
            <IconShield />
            <span>Secure sign-in via Supabase Auth. No password stored.</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ padding: 48, textAlign: "center" }}>Loading...</main>}>
      <LoginContent />
    </Suspense>
  );
}
