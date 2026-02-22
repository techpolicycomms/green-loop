-- Migration 007: Bug fixes for storage buckets and RLS policies
-- Run this in the Supabase SQL Editor
-- Fixes:
--   Bug #1: avatars bucket missing (profile photo upload "Bucket not found")
--   Bug #4: photos and lanyard_grades tables missing INSERT RLS policies

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- (Re-)create avatars bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Create photos bucket (for volunteer photo documentation)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- STORAGE POLICIES: avatars bucket
-- ============================================================

do $$
begin
  -- Allow authenticated users to upload their own avatar
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'avatars: authenticated users can upload'
  ) then
    create policy "avatars: authenticated users can upload"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;

  -- Allow public read of all avatars
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'avatars: public read'
  ) then
    create policy "avatars: public read"
    on storage.objects for select
    to public
    using (bucket_id = 'avatars');
  end if;

  -- Allow users to update their own avatar
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'avatars: users can update own avatar'
  ) then
    create policy "avatars: users can update own avatar"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;

  -- Allow users to delete their own avatar
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'avatars: users can delete own avatar'
  ) then
    create policy "avatars: users can delete own avatar"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
end $$;

-- ============================================================
-- STORAGE POLICIES: photos bucket
-- ============================================================

do $$
begin
  -- Allow authenticated users to upload photos
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'photos: authenticated users can upload'
  ) then
    create policy "photos: authenticated users can upload"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'photos');
  end if;

  -- Allow authenticated users to read photos
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'photos: authenticated users can read'
  ) then
    create policy "photos: authenticated users can read"
    on storage.objects for select
    to authenticated
    using (bucket_id = 'photos');
  end if;
end $$;

-- ============================================================
-- RLS POLICIES: photos table
-- ============================================================

-- Enable RLS (safe if already enabled)
alter table public.photos enable row level security;

do $$
begin
  -- Allow authenticated users to insert their own photo records
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'photos'
    and policyname = 'photos: authenticated users can insert own'
  ) then
    create policy "photos: authenticated users can insert own"
    on public.photos for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  -- Allow authenticated users to read all photos (for admin/organizer views)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'photos'
    and policyname = 'photos: authenticated users can read all'
  ) then
    create policy "photos: authenticated users can read all"
    on public.photos for select
    to authenticated
    using (true);
  end if;
end $$;

-- ============================================================
-- RLS POLICIES: lanyard_grades table
-- ============================================================

-- Enable RLS (safe if already enabled)
alter table public.lanyard_grades enable row level security;

do $$
begin
  -- Allow authenticated users to insert their own grade records
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lanyard_grades'
    and policyname = 'lanyard_grades: authenticated users can insert own'
  ) then
    create policy "lanyard_grades: authenticated users can insert own"
    on public.lanyard_grades for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  -- Allow authenticated users to read all grades
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lanyard_grades'
    and policyname = 'lanyard_grades: authenticated users can read all'
  ) then
    create policy "lanyard_grades: authenticated users can read all"
    on public.lanyard_grades for select
    to authenticated
    using (true);
  end if;

  -- Allow users to update their own grade records
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lanyard_grades'
    and policyname = 'lanyard_grades: users can update own'
  ) then
    create policy "lanyard_grades: users can update own"
    on public.lanyard_grades for update
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;


-- ============================================================
-- PROFILES TABLE: Add extra_roles column if missing (from migration 006)
-- Fixes admin login: middleware queries "role, extra_roles" on profiles
-- If extra_roles doesn't exist the query fails silently → role = "" → access denied
-- ============================================================

alter table public.profiles
  add column if not exists extra_roles text[] default '{}';

-- ============================================================
-- RLS POLICIES: profiles table
-- Needed so the auth callback and middleware can read the user's profile
-- ============================================================

alter table public.profiles enable row level security;

do $$
begin
  -- Allow users to read their own profile
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
    and policyname = 'profiles: users can read own profile'
  ) then
    create policy "profiles: users can read own profile"
    on public.profiles for select
    to authenticated
    using (auth.uid() = id);
  end if;

  -- Allow users to update their own profile
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
    and policyname = 'profiles: users can update own profile'
  ) then
    create policy "profiles: users can update own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id);
  end if;

  -- Allow users to insert their own profile (for new sign-ups)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
    and policyname = 'profiles: users can insert own profile'
  ) then
    create policy "profiles: users can insert own profile"
    on public.profiles for insert
    to authenticated
    with check (auth.uid() = id);
  end if;
end $$;

-- ============================================================
-- EVENT_APPLICATIONS TABLE: Ensure it exists and has proper RLS
-- Fixes "Could not find the table 'public.event_applications' in the schema cache"
-- ============================================================

create table if not exists public.event_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  organizer_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_applications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_applications'
    and policyname = 'event_applications: users can insert own'
  ) then
    create policy "event_applications: users can insert own"
    on public.event_applications for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_applications'
    and policyname = 'event_applications: users can read own'
  ) then
    create policy "event_applications: users can read own"
    on public.event_applications for select
    to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_applications'
    and policyname = 'event_applications: users can update own'
  ) then
    create policy "event_applications: users can update own"
    on public.event_applications for update
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- ADMIN ROLE SETUP
-- Run this separately with your admin email to grant admin access:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL_HERE');
--
-- ============================================================

-- ============================================================
-- RELOAD POSTGREST SCHEMA CACHE
-- This fixes "table not found in schema cache" errors
-- ============================================================
notify pgrst, 'reload schema';
