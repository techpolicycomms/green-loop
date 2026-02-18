# Credentials Setup

Replace placeholder values with real credentials for local development and deployment.

## Required for Supabase

| Variable | Where to get it | Used for |
|----------|-----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Supabase client connection |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public key | Supabase Auth & API |

## Optional

| Variable | Where to get it | Used for |
|----------|-----------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Your app URL (e.g. `https://green-loop.vercel.app`) | OAuth redirect URL (auto-detected in browser) |

## Local setup

1. Copy `.env.local.example` → `.env.local`
2. Fill in the values above
3. Run `npm run dev`

## Vercel deployment

Add the same variables in Vercel dashboard: Project → Settings → Environment Variables
Add for Production, Preview, and Development.

## Supabase Auth setup

**Required for login to work.** Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**.

### 1. Site URL
- **Local dev:** `http://localhost:3000` (or `http://localhost:3001` if using that port)
- **Production:** `https://your-vercel-url.vercel.app`

### 2. Redirect URLs (add each you use)
Add these **exact** URLs to the Redirect URLs list:
- `http://localhost:3000/auth/callback`
- `http://localhost:3001/auth/callback`
- `https://YOUR_VERCEL_URL/auth/callback` (for production)

### 3. Enable providers
- **Authentication** → **Providers** → enable **Google** and/or **Apple**
- For Google: add Supabase callback URL in [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client → Authorized redirect URIs:
  - `https://bubwzavexxjjckzbvthl.supabase.co/auth/v1/callback`
