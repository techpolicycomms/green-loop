# LémanLoop — Implementation Checklist

Use this checklist when deploying the changes from the audit.

---

## 1. Supabase migrations

Run these migrations **in order** in the Supabase SQL Editor (Dashboard → SQL Editor):

| Order | Migration file | Purpose |
|-------|----------------|---------|
| 1 | `002_storage.sql` | Storage buckets |
| 2 | `003_allow_authenticated_event_insert.sql` | Event insert policy |
| 3 | `004_profiles_extended.sql` | Profiles, lanyard_grades, notifications |
| 4 | `005_event_applications.sql` | Event applications (volunteer ↔ organiser) |
| 5 | `006_flexible_roles_and_profiles.sql` | Avatar, extra_roles |
| 6 | `007_events_expected_lanyards.sql` | expected_lanyards column |
| 7 | `007_bug_fixes.sql` | Avatars bucket, photos bucket, RLS |
| 8 | `008_events_event_date.sql` | event_date column |
| 9 | `008_fix_photo_upload.sql` | Photos/lanyard_grades fixes |
| 10 | `009_event_applications_schema_fix.sql` | Fix volunteer_id schema, RLS |

**Note:** If your database was created from an older schema, run migrations 1–10. If you already have `event_applications` with `volunteer_id`, migration 009 will safely no-op.

---

## 2. Supabase Storage buckets

Ensure these buckets exist (Supabase Dashboard → Storage):

| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | Yes | Profile photos (2 MB limit) |
| `photos` | No | Volunteer lanyard photos (5 MB limit) |

If missing, create them manually or run migrations 006/007.

---

## 3. Environment variables

### Required (`.env.local` and Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Optional

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Production URL (e.g. `https://green-loop-id.com`) |
| `RESEND_API_KEY` | For transactional emails (welcome, check-in, etc.) |
| `RESEND_FROM_EMAIL` | Sender email (default: `LémanLoop <noreply@lemanloop.ch>`) |
| `SUPABASE_SERVICE_ROLE_KEY` | For mailer notification logging |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 ID |

---

## 4. Supabase Auth configuration

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://green-loop-id.com` (or your production URL)
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `https://green-loop-id.com/auth/callback`
  - Your Vercel preview URL if using preview deployments

---

## 5. Google OAuth (Supabase)

1. Supabase → Authentication → Providers → Google (enable)
2. Add Google Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com)
3. In Google OAuth client → Authorized redirect URIs, add:
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

---

## 6. Admin user setup

To grant admin access to a user, run in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL');
```

---

## 7. Static assets

Ensure these files exist in `public/team/`:

| File | Purpose |
|------|---------|
| `rahul-jha.png` | Founder photo (About page) |
| `ge-ni-logo.png` | ge-ni Geneva Network of Innovators logo |

---

## 8. Deploy to Vercel

1. Push code to `techpolicycomms/green-loop`
2. Vercel → Import / connect repo
3. Add environment variables (see §3)
4. Deploy
5. Add production URL to Supabase Auth redirect URLs

---

## 9. Post-deploy verification

- [ ] Home page loads (marketing + logged-in dashboard)
- [ ] Sign in with Google works
- [ ] Volunteer: apply to event, check-in, grade, upload photo
- [ ] Organiser: create event, approve volunteers
- [ ] Admin: view users, change roles
- [ ] Profile: edit, upload avatar
- [ ] About page: team, supporting institutions, donate links
- [ ] No hydration errors in browser console

---

## Bugs fixed in this audit

| Bug | Fix |
|-----|-----|
| Duplicate/orphan files | Removed `lib 2`, `page 2.tsx`, `layout 2.tsx`, `Nav 2.tsx`, `globals 2.css`, `middleware 2.ts` |
| Auth callback missing /profile | Added `/profile` to `ALLOWED_PATHS` |
| CSP blocking Supabase images | Added `https:` to `img-src` |
| Hydration mismatch (dates) | Centralised date formatting in `lib/formatDate.ts` with fixed locale `en-GB` |
| Footer not responsive on mobile | Added `.footer-grid` media query |
| Volunteer applications schema | Migration 009 fixes `user_id` → `volunteer_id` mismatch |
| Profile avatar cache | Cache-busting via `?v=updated_at` (already in place) |
