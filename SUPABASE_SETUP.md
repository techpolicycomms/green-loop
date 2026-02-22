# Supabase Setup for LémanLoop

**Supabase project:** `bubwzavexxjjckzbvthl`
**Supabase dashboard:** https://supabase.com/dashboard/project/bubwzavexxjjckzbvthl

---

## URGENT — Fix Google sign-in (404 / DEPLOYMENT_NOT_FOUND)

The error `DEPLOYMENT_NOT_FOUND` from Vercel means Supabase tried to redirect
back to an app URL that is **not in its allowed redirect list**. Fix it in 2 minutes:

### Step 1 — Add redirect URLs in Supabase

1. Open https://supabase.com/dashboard/project/bubwzavexxjjckzbvthl/auth/url-configuration
2. Under **Redirect URLs**, click **Add URL** and add all of these:

```
https://green-loop-git-claude-sustainab-33919e-rahuls-projects-26acb4ad.vercel.app/auth/callback
https://idea-one-pi.vercel.app/auth/callback
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

3. Click **Save**.

### Step 2 — Set the Site URL

Still on the same page, set **Site URL** to:
```
https://green-loop-git-claude-sustainab-33919e-rahuls-projects-26acb4ad.vercel.app
```
Click **Save**.

### Step 3 — Verify Vercel environment variables

Go to your Vercel project → **Settings** → **Environment Variables** and confirm these exist:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bubwzavexxjjckzbvthl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon key from Supabase → Settings → API) |
| `NEXT_PUBLIC_SITE_URL` | `https://green-loop-git-claude-sustainab-33919e-rahuls-projects-26acb4ad.vercel.app` |

If you add or change env vars in Vercel, **trigger a new deployment** (Vercel → Deployments → Redeploy).

### Step 4 — Verify Google OAuth client

In [Google Cloud Console](https://console.cloud.google.com) → Credentials → your OAuth 2.0 client:

Under **Authorized redirect URIs**, confirm this is present:
```
https://bubwzavexxjjckzbvthl.supabase.co/auth/v1/callback
```

---

## User roles and profiles

New users automatically receive the `volunteer` role via a database trigger.

**Role hierarchy:**
- `volunteer` → can check in at collection points and upload photos
- `organizer` → can create and manage events
- `admin` → full platform oversight, can change any user's role

**To promote a user to organizer or admin:**
1. Sign in as admin
2. Go to `/admin`
3. Find the user in the table and change their role in the dropdown

**The role-based redirect:** after Google sign-in, users are automatically
sent to the correct dashboard (`/volunteer`, `/organizer`, or `/admin`).

---

## First-time Supabase setup (new project)

### 1. Run the schema

Run `supabase/schema.sql` in the Supabase SQL Editor. This creates:
- `profiles` table (id, email, role, created_at)
- `events` table
- `check_ins` table (GPS data)
- `photos` table
- RLS policies for all tables
- `handle_new_user` trigger (auto-creates profile on signup)

### 2. Create the photos storage bucket

**Dashboard (recommended):**
1. Storage → New bucket
2. Name: `photos`, Public: **Yes**, File size limit: 5 MB
3. Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`

Add policies in Storage → photos → Policies:
- **Insert**: Allow authenticated users (`auth.uid() is not null`)
- **Select**: Allow public read

### 3. Enable Google OAuth

Authentication → Providers → Google:
- Enable Google
- Paste your Google **Client ID** and **Client Secret**
- In Google Cloud Console → your OAuth app → Authorized redirect URIs, add:
  `https://bubwzavexxjjckzbvthl.supabase.co/auth/v1/callback`

### 4. Add all redirect URLs (see URGENT section above)

---

## Adding a new Vercel deployment URL

Every time you deploy to a new Vercel URL, add it to Supabase:
1. Supabase Dashboard → Authentication → URL Configuration
2. Add `https://YOUR-NEW-VERCEL-URL/auth/callback` to Redirect URLs
3. Save

You can use the wildcard pattern to cover all preview deployments:
```
https://*.vercel.app/auth/callback
```
(Note: only use wildcards in development/staging, not production.)
