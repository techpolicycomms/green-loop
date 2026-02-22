-- Migration 004: Extended profiles, lanyard grades, notifications
-- Run this in Supabase SQL Editor

-- ── 1. Extend profiles table ──────────────────────────────────────────────

alter table public.profiles
  add column if not exists display_name        text,
  add column if not exists phone               text,
  add column if not exists city                text,
  add column if not exists bio                 text,
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists updated_at          timestamptz default now(),
  -- Volunteer-specific
  add column if not exists availability        text check (availability in ('weekdays', 'weekends', 'both')),
  add column if not exists motivation          text,
  -- Organizer-specific
  add column if not exists organization_name   text,
  add column if not exists website             text,
  add column if not exists typical_event_size  text;

-- Users who registered before this migration are already onboarded
update public.profiles set onboarding_complete = true where onboarding_complete = false;

-- Allow users to update their own profile (needed for onboarding form)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles: users can update own'
  ) then
    create policy "profiles: users can update own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);
  end if;
end $$;

-- ── 2. Lanyard grades table ───────────────────────────────────────────────

create table if not exists public.lanyard_grades (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  event_id     uuid references public.events(id) on delete set null,
  photo_id     uuid references public.photos(id) on delete set null,
  check_in_id  uuid references public.check_ins(id) on delete set null,
  quantity     int not null default 1 check (quantity > 0 and quantity <= 10000),
  grade        text not null check (grade in ('A', 'B', 'C')),
  material     text,
  notes        text,
  created_at   timestamptz default now()
);

alter table public.lanyard_grades enable row level security;

create policy "lanyard_grades: insert own"
on public.lanyard_grades for insert
with check (auth.uid() = user_id);

create policy "lanyard_grades: read own"
on public.lanyard_grades for select
using (auth.uid() = user_id);

create policy "lanyard_grades: organizer/admin read all"
on public.lanyard_grades for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('organizer', 'admin')
  )
);

-- ── 3. Notifications log table ────────────────────────────────────────────

create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  type          text not null,
  subject       text,
  status        text not null default 'pending'
                check (status in ('pending', 'sent', 'failed', 'skipped')),
  error_message text,
  metadata      jsonb,
  sent_at       timestamptz,
  created_at    timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "notifications: admin read all"
on public.notifications for select
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "notifications: users read own"
on public.notifications for select
using (auth.uid() = user_id);

-- Service role inserts are allowed without a policy (bypasses RLS).
-- If using anon key for inserts, uncomment the policy below:
-- create policy "notifications: authenticated insert"
-- on public.notifications for insert
-- with check (true);
