"use client";

import { Suspense } from "react";
import { createBrowserClient } from "@/lib/supabaseClient";
import { IconLogIn, IconShield, LineArtCommunity } from "@/components/Icons";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const signIn = async (provider: "google" | "apple") => {
    const supabase = createBrowserClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = `${origin}/auth/callback`;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    });
    if (err) console.error("OAuth error:", err);
  };

  return (
    <main>
      <section
        className="card-elevated"
        style={{
          maxWidth: 420,
          margin: "0 auto",
          textAlign: "center",
          padding: "40px 32px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <LineArtCommunity />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 8px", color: "var(--color-text)" }}>
          Sign up / Sign in
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-text-muted)", marginBottom: 32, lineHeight: 1.5 }}>
          New users: sign up with Google or Apple. Returning users: sign in with the same provider. No passwords needed.
        </p>

        {error && (
          <p style={{ color: "var(--color-error)", fontSize: 14, marginBottom: 16 }}>
            Sign-in failed. Check Supabase redirect URLs match this site.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => signIn("google")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "14px 20px",
              fontSize: 16,
              fontWeight: 500,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              color: "var(--color-text)",
              transition: "all var(--transition)"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => signIn("apple")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "14px 20px",
              fontSize: 16,
              fontWeight: 500,
              background: "var(--color-text)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "opacity var(--transition)"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Sign in with Apple
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 24,
            fontSize: 13,
            color: "var(--color-text-muted-2)"
          }}
        >
          <IconShield />
          <span>Secure sign-in via Supabase Auth</span>
        </div>
      </section>
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
