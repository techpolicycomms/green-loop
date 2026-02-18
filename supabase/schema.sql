  -- Profiles table (public view of user + role)
  create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    role text not null default 'volunteer' check (role in ('volunteer','organizer','admin')),
    created_at timestamp with time zone default now()
  );

  -- Events table
  create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    location text,
    created_by uuid references auth.users(id),
    created_at timestamp with time zone default now()
  );

  -- Enable RLS
  alter table public.profiles enable row level security;
  alter table public.events enable row level security;

  -- Profiles policies
  create policy "profiles: users can read own"
  on public.profiles for select
  using (auth.uid() = id);

  create policy "profiles: admin can read all"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

  create policy "profiles: admin can update role"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (true);

  -- Events policies
  create policy "events: anyone authenticated can read"
  on public.events for select
  using (auth.uid() is not null);

  create policy "events: authenticated can insert"
  on public.events for insert
  with check (auth.uid() is not null);

  -- Auto-create profile on signup
  create or replace function public.handle_new_user()
  returns trigger as $$
  begin
    insert into public.profiles (id, email, role)
    values (new.id, new.email, 'volunteer')
    on conflict (id) do nothing;
    return new;
  end;
  $$ language plpgsql security definer;

  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

  -- Check-ins table (GPS data from volunteers)
  create table if not exists public.check_ins (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    event_id uuid references public.events(id) on delete set null,
    lat double precision not null,
    lng double precision not null,
    accuracy_m double precision,
    created_at timestamp with time zone default now()
  );

  alter table public.check_ins enable row level security;

  create policy "check_ins: authenticated insert own"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

  create policy "check_ins: users read own"
  on public.check_ins for select
  using (auth.uid() = user_id);

  create policy "check_ins: organizer/admin read all"
  on public.check_ins for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('organizer','admin'))
  );

  -- Photos table (metadata; files in Storage)
  create table if not exists public.photos (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    event_id uuid references public.events(id) on delete set null,
    storage_path text not null,
    file_name text,
    file_size bigint,
    created_at timestamp with time zone default now()
  );

  alter table public.photos enable row level security;

  create policy "photos: authenticated insert own"
  on public.photos for insert
  with check (auth.uid() = user_id);

  create policy "photos: users read own"
  on public.photos for select
  using (auth.uid() = user_id);

  create policy "photos: organizer/admin read all"
  on public.photos for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('organizer','admin'))
  );

  -- Storage bucket: run in Supabase SQL Editor or Dashboard
  -- Storage bucket "photos" must be created in Supabase Dashboard: Storage -> New bucket -> "photos" (public)
  -- Or via SQL (if storage schema exists):
  -- insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
