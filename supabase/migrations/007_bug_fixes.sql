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
