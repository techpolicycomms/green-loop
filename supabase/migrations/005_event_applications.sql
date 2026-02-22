-- Migration 005: Event applications (volunteer ↔ organiser matching)
-- Run in Supabase SQL Editor

-- ── 1. event_applications table ──────────────────────────────────────────

create table if not exists public.event_applications (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.events(id) on delete cascade,
  volunteer_id     uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  message          text,          -- volunteer's note when applying
  organizer_reply  text,          -- organiser's message back to volunteer
  organizer_notes  text,          -- organiser's private notes (not shown to volunteer)
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (event_id, volunteer_id)
);

alter table public.event_applications enable row level security;

-- ── 2. RLS policies ───────────────────────────────────────────────────────

-- Volunteers can read their own applications
create policy "applications: volunteers read own"
on public.event_applications for select
using (auth.uid() = volunteer_id);

-- Volunteers can apply to events (insert their own application)
create policy "applications: volunteers can apply"
on public.event_applications for insert
with check (auth.uid() = volunteer_id and status = 'pending');

-- Volunteers can withdraw (update status to 'withdrawn') their own pending application
create policy "applications: volunteers can withdraw"
on public.event_applications for update
using (auth.uid() = volunteer_id and status in ('pending', 'approved'))
with check (status = 'withdrawn');

-- Organisers can read applications for events they created
create policy "applications: organiser reads event applications"
on public.event_applications for select
using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.created_by = auth.uid()
  )
);

-- Organisers can update status + reply for applications on their events
create policy "applications: organiser updates event applications"
on public.event_applications for update
using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.created_by = auth.uid()
  )
);

-- Admins can read all applications
create policy "applications: admin read all"
on public.event_applications for select
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Admins can update all applications
create policy "applications: admin update all"
on public.event_applications for update
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ── 3. updated_at trigger ─────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_event_applications_updated_at on public.event_applications;
create trigger set_event_applications_updated_at
before update on public.event_applications
for each row execute function public.set_updated_at();

-- ── 4. Allow organisers to read profiles of their applicants ──────────────
-- Organisers need volunteer profile data (display_name, email, etc.)

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles: organiser reads applicant profiles'
  ) then
    create policy "profiles: organiser reads applicant profiles"
    on public.profiles for select
    using (
      exists (
        select 1 from public.event_applications ea
        join public.events e on e.id = ea.event_id
        where ea.volunteer_id = profiles.id
          and e.created_by = auth.uid()
      )
    );
  end if;
end $$;
