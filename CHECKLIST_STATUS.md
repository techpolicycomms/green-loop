# Checklist status

## Done automatically

| Item | Status |
|------|--------|
| Build passes | Done |
| Static assets (`public/team/rahul-jha.png`, `ge-ni-logo.png`) | Done |
| `.env.local` created from example | Done — **add your real Supabase URL and anon key** |

---

## You must do (requires your accounts)

### 1. Supabase migrations
Run each migration file in order in **Supabase → SQL Editor**:
- `002_storage.sql` → `003` → `004` → `005` → `006` → `007_events_expected_lanyards.sql` → `007_bug_fixes.sql` → `008_events_event_date.sql` → `008_fix_photo_upload.sql` → `009_event_applications_schema_fix.sql`

### 2. Supabase Storage
In **Supabase → Storage**, ensure buckets `avatars` (public) and `photos` (private) exist.

### 3. Environment variables
- **Local:** Edit `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Vercel:** Add the same variables in Project → Settings → Environment Variables

### 4. Supabase Auth
**Supabase → Authentication → URL Configuration:**
- Site URL: `https://green-loop-id.com`
- Redirect URLs: `http://localhost:3000/auth/callback`, `https://green-loop-id.com/auth/callback`

### 5. Google OAuth
**Supabase → Authentication → Providers → Google:** Enable and add Client ID + Secret from [Google Cloud Console](https://console.cloud.google.com).

### 6. Admin user
Run in Supabase SQL Editor (replace the email):
```sql
UPDATE public.profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com');
```

### 7. Deploy
```bash
git add .
git commit -m "Audit fixes, migrations, checklist"
git push origin main
```
Then in **Vercel**: deploy (or it will auto-deploy on push).

---

## Post-deploy
Verify: sign-in, volunteer apply, organiser create event, admin panel, profile avatar, About page.
