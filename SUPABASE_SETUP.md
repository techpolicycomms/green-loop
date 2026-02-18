# Supabase Setup for GreenLoop

Run these in order in the Supabase SQL Editor.

## 1. Base schema (if not already run)

Run `supabase/schema.sql` first. This creates profiles, events, check_ins, photos tables.

## 2. Storage bucket (manual or SQL)

### Option A: Dashboard (recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. **Storage** → **New bucket**
3. Name: `photos`
4. Public bucket: **Yes**
5. File size limit: 5 MB
6. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
7. Create

Then add policies in **Storage** → **photos** → **Policies**:
- **Insert**: Allow authenticated users
- **Select**: Allow public read (or authenticated)

### Option B: SQL

Run `supabase/migrations/002_storage.sql` in the SQL Editor. If it fails (e.g. storage schema not found), use Option A.

## 3. Auth URL Configuration

**Authentication** → **URL Configuration**:
- **Site URL**: your app URL (e.g. `https://idea-one-pi.vercel.app`)
- **Redirect URLs**: add `https://YOUR_APP_URL/auth/callback`

For local dev, also add:
- `http://localhost:3000/auth/callback`
- `http://localhost:3001/auth/callback`

## 4. Enable providers

**Authentication** → **Providers** → enable **Google** and/or **Apple**.

For Google: add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` to Google Cloud Console OAuth redirect URIs.
