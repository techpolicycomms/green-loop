"use client";

import { createBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const signIn = async (provider: "google" | "apple") => {
    const supabase = createBrowserClient();
    const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    });
  };

  return (
    <main>
      <h2>Login</h2>
      <p>Use Google or Apple sign-in (configured in Supabase Auth providers).</p>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          style={{ padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8 }}
          onClick={() => signIn("google")}
        >
          Continue with Google
        </button>

        <button
          style={{ padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8 }}
          onClick={() => signIn("apple")}
        >
          Sign in with Apple
        </button>
      </div>
    </main>
  );
}
