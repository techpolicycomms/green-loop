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

-- Events policies
create policy "events: anyone authenticated can read"
on public.events for select
using (auth.uid() is not null);

create policy "events: organizer/admin can insert"
on public.events for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('organizer','admin'))
);

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
