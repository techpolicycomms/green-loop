-- Migration 009: Fix event_applications schema mismatch
-- Migration 007 created event_applications with user_id, but the API uses volunteer_id.
-- This migration aligns the schema with the API (volunteer_id, event_id not null, unique constraint).

-- Drop 007 policies FIRST (they depend on user_id; must be removed before we can drop the column)
drop policy if exists "event_applications: users can insert own" on public.event_applications;
drop policy if exists "event_applications: users can read own" on public.event_applications;
drop policy if exists "event_applications: users can update own" on public.event_applications;

-- If table has user_id, migrate to volunteer_id
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'event_applications' and column_name = 'user_id'
  ) then
    -- Add volunteer_id, copy data, drop user_id
    alter table public.event_applications add column if not exists volunteer_id uuid references auth.users(id) on delete cascade;
    update public.event_applications set volunteer_id = user_id where volunteer_id is null;
    alter table public.event_applications alter column volunteer_id set not null;
    alter table public.event_applications drop column if exists user_id;
  end if;
end $$;

-- Ensure event_id is not null (007 had it nullable)
do $$
begin
  -- Delete any orphan rows with null event_id before adding constraint
  delete from public.event_applications where event_id is null;
  alter table public.event_applications alter column event_id set not null;
exception when others then
  null; -- column may already be not null
end $$;

-- Add unique constraint if missing
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'event_applications_event_id_volunteer_id_key'
  ) then
    alter table public.event_applications add constraint event_applications_event_id_volunteer_id_key unique (event_id, volunteer_id);
  end if;
exception when others then
  null; -- constraint may already exist
end $$;

-- Add organizer_reply, organizer_notes, updated_at if missing
alter table public.event_applications add column if not exists organizer_reply text;
alter table public.event_applications add column if not exists organizer_notes text;
alter table public.event_applications add column if not exists updated_at timestamptz default now();

-- Recreate correct RLS policies (matching migration 005)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'event_applications' and policyname = 'applications: volunteers read own') then
    create policy "applications: volunteers read own" on public.event_applications for select
    using (auth.uid() = volunteer_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'event_applications' and policyname = 'applications: volunteers can apply') then
    create policy "applications: volunteers can apply" on public.event_applications for insert
    with check (auth.uid() = volunteer_id and status = 'pending');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'event_applications' and policyname = 'applications: volunteers can withdraw') then
    create policy "applications: volunteers can withdraw" on public.event_applications for update
    using (auth.uid() = volunteer_id and status in ('pending', 'approved'))
    with check (status = 'withdrawn');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'event_applications' and policyname = 'applications: organiser reads event applications') then
    create policy "applications: organiser reads event applications" on public.event_applications for select
    using (exists (select 1 from public.events e where e.id = event_id and e.created_by = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'event_applications' and policyname = 'applications: organiser updates event applications') then
    create policy "applications: organiser updates event applications" on public.event_applications for update
    using (exists (select 1 from public.events e where e.id = event_id and e.created_by = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'event_applications' and policyname = 'applications: admin read all') then
    create policy "applications: admin read all" on public.event_applications for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'event_applications' and policyname = 'applications: admin update all') then
    create policy "applications: admin update all" on public.event_applications for update
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
  end if;
end $$;

-- updated_at trigger
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

notify pgrst, 'reload schema';
