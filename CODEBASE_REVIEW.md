# GreenLoop Codebase Review

## Executive Summary

| Area | Status | Issues |
|------|--------|--------|
| Sign up / Login | ⚠️ Partial | OAuth only; no explicit "Sign up" label; depends on Supabase URL config |
| Photo upload | ❌ Stub | Returns metadata only; no Supabase Storage; no DB persistence |
| GPS data | ❌ Not persisted | Captured in browser only; never saved to database |
| User management | ⚠️ Read-only | Admin can view users; cannot change roles |

---

## 1. Auth Flow (Sign up / Login)

### Current
- Login page: "Continue with Google" / "Sign in with Apple"
- OAuth flow: signInWithOAuth → Supabase → provider → /auth/callback → exchangeCodeForSession
- **Sign up = Sign in** with OAuth (first-time users are auto-created)

### Issues
- No explicit "Sign up" button or label (confusing for new users)
- Login fails if Supabase Redirect URLs not configured
- handle_new_user trigger creates profile with role=volunteer on first sign-in

### Fix
- Add "Sign up / Sign in" label to clarify
- Ensure Supabase Auth URL config is documented

---

## 2. Photo Upload

### Current
- `/api/uploads` receives file, returns `{ ok, name, type, size }` — **no storage**
- Comment: "MVP: return metadata. Next step: upload to Supabase Storage bucket."

### Missing
- Supabase Storage bucket
- Actual file upload to Storage
- `photos` table for metadata
- RLS policies for Storage

### Fix
- Create `photos` bucket in Supabase
- Upload file to Storage, save path to `photos` table
- Add storage policies

---

## 3. GPS Data

### Current
- Volunteer page: `getLocation()` uses `navigator.geolocation`
- Displays coords in UI only — **never saved**

### Missing
- `check_ins` table (user_id, lat, lng, accuracy, event_id?, created_at)
- API to save check-in
- "Save location" action

### Fix
- Add `check_ins` table
- POST /api/check-ins
- Volunteer page: "Save my location" after getting coords

---

## 4. User Account Management (Admin)

### Current
- GET /api/admin/users — lists profiles (email, role)
- Admin page: table view only

### Missing
- **Update role** — admin cannot promote volunteer → organizer or admin
- profiles table: no UPDATE policy for admin

### Fix
- Add PATCH /api/admin/users/[id] to update role
- Add RLS policy: admin can update profiles.role
- Admin UI: role dropdown + save button

---

## 5. Database Schema Gaps

### Existing
- profiles (id, email, role)
- events (id, name, location, created_by, created_at)

### To Add
- check_ins (id, user_id, event_id?, lat, lng, accuracy, created_at)
- photos (id, user_id, storage_path, event_id?, created_at)
- Storage bucket: photos (public)

---

## Implementation Order

1. Schema: check_ins, photos, storage bucket ✅
2. API: POST /api/check-ins, update /api/uploads for Storage ✅
3. Volunteer page: save GPS, show upload success ✅
4. Admin: role update API + UI ✅
5. Login: clarify Sign up / Sign in ✅

---

## Implemented (Latest)

- **check_ins** table + POST /api/check-ins for GPS
- **photos** table + Supabase Storage upload in /api/uploads
- **Admin**: PATCH /api/admin/users/[id] for role updates; dropdown in UI
- **Login**: "Sign up / Sign in" label
- **profiles**: admin can update role (RLS policy)

### Required: Run new schema in Supabase

1. Run updated `supabase/schema.sql` (includes check_ins, photos, profiles update policy)
2. Create Storage bucket `photos` (see SUPABASE_SETUP.md)
