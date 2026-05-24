-- Migration 017: Green ICT audit (Scope 1 + Scope 2), monthly reporting, and offsets

create table if not exists public.emission_activity_logs (
  id uuid primary key default gen_random_uuid(),
  period_month date not null,
  scope smallint not null check (scope in (1, 2)),
  source_type text not null,
  source_name text not null,
  activity_value numeric(14,4) not null check (activity_value >= 0),
  activity_unit text not null,
  emission_factor_location numeric(14,8),
  emission_factor_market numeric(14,8),
  factor_unit text not null default 'kgCO2e_per_unit',
  data_quality text not null default 'estimated' check (data_quality in ('measured', 'estimated', 'assumed')),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_emission_activity_logs_month_source
  on public.emission_activity_logs (period_month, scope, source_type, source_name);

create index if not exists idx_emission_activity_logs_period
  on public.emission_activity_logs (period_month desc);

create table if not exists public.emission_offsets (
  id uuid primary key default gen_random_uuid(),
  period_month date not null,
  provider text not null,
  project_name text not null,
  registry_name text,
  credit_type text not null default 'carbon_credit',
  quantity_kg numeric(14,4) not null check (quantity_kg >= 0),
  vintage_year int,
  retirement_reference text,
  certificate_url text,
  status text not null default 'planned' check (status in ('planned', 'purchased', 'retired')),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_emission_offsets_period
  on public.emission_offsets (period_month desc);

create table if not exists public.emission_reports_monthly (
  id uuid primary key default gen_random_uuid(),
  period_month date not null unique,
  methodology_version text not null default 'v1-switzerland-eu-default',
  scope1_kg numeric(14,4) not null default 0,
  scope2_location_kg numeric(14,4) not null default 0,
  scope2_market_kg numeric(14,4) not null default 0,
  gross_location_kg numeric(14,4) not null default 0,
  gross_market_kg numeric(14,4) not null default 0,
  offsets_kg numeric(14,4) not null default 0,
  residual_location_kg numeric(14,4) not null default 0,
  residual_market_kg numeric(14,4) not null default 0,
  assumptions jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  archive_markdown text,
  archive_sha256 text,
  published boolean not null default true,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_emission_reports_period
  on public.emission_reports_monthly (period_month desc);

alter table public.emission_activity_logs enable row level security;
alter table public.emission_offsets enable row level security;
alter table public.emission_reports_monthly enable row level security;

-- Admin access for all Green ICT audit tables
create policy "emission_activity_logs: admin read"
  on public.emission_activity_logs for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "emission_activity_logs: admin write"
  on public.emission_activity_logs for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "emission_offsets: admin read"
  on public.emission_offsets for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "emission_offsets: admin write"
  on public.emission_offsets for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "emission_reports: admin read all"
  on public.emission_reports_monthly for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "emission_reports: admin write"
  on public.emission_reports_monthly for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Public transparency access to published monthly reports
create policy "emission_reports: public read published"
  on public.emission_reports_monthly for select
  using (published = true);

comment on table public.emission_activity_logs is 'Activity data for Scope 1 and Scope 2 emissions accounting.';
comment on table public.emission_offsets is 'Monthly carbon offset actions linked to residual emissions.';
comment on table public.emission_reports_monthly is 'Archived monthly emissions reports for transparent public disclosure.';
