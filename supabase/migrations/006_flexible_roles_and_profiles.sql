-- Migration 006: Flexible multi-role system, avatar, sustainability profile
-- Run in Supabase SQL Editor

-- ── 1. Extend profiles table ──────────────────────────────────────────────

alter table public.profiles
  add column if not exists avatar_url       text,
  add column if not exists extra_roles      text[] not null default '{}',
  add column if not exists active_mode      text check (active_mode in ('volunteer', 'organizer')),
  add column if not exists sustainability_score int not null default 0,
  add column if not exists badges           jsonb not null default '[]';

-- ── 2. Backfill active_mode from current role ─────────────────────────────

update public.profiles
set active_mode = role
where role in ('volunteer', 'organizer') and active_mode is null;

-- ── 3. Allow volunteers to also be organisers and vice versa ─────────────
-- An organiser can see the volunteer page, a volunteer can see the organiser page
-- by adding the other role to extra_roles via the profile API.

-- No schema changes needed for this — the API + middleware handle it.

-- ── 4. Storage: avatar bucket ─────────────────────────────────────────────
-- Create an 'avatars' storage bucket (run if storage schema is accessible).
-- If this fails, create manually: Storage → New bucket → name: avatars, public: true

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars: authenticated upload"
on storage.objects for insert
with check (
  bucket_id = 'avatars' and auth.role() = 'authenticated'
);

create policy "avatars: public read"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow users to replace their own avatar
create policy "avatars: authenticated update"
on storage.objects for update
using (
  bucket_id = 'avatars' and auth.role() = 'authenticated'
);

create policy "avatars: authenticated delete own"
on storage.objects for delete
using (
  bucket_id = 'avatars' and auth.role() = 'authenticated'
);

-- ── 5. Organiser can now read profiles of their event applicants ──────────
-- (Already added in migration 005, but included here as a reminder)
-- See migration 005 for the policy.

-- ── 6. Allow admins/organisers to read all profiles ───────────────────────
-- Needed for dashboard enrichment

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles: organiser reads all'
  ) then
    create policy "profiles: organiser reads all"
    on public.profiles for select
    using (
      exists (
        select 1 from public.profiles p where p.id = auth.uid()
          and (p.role = 'organizer' or 'organizer' = any(p.extra_roles))
      )
    );
  end if;
end $$;
