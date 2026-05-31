-- Production Supabase schema for Carbon Risk Tracker.
-- Apply with: supabase db push

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  location text,
  country text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  source text not null default 'csv',
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  row_count integer not null default 0 check (row_count >= 0),
  total_co2_kg numeric(12, 3) not null default 0 check (total_co2_kg >= 0),
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.footprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_id uuid references public.imports(id) on delete set null,
  category text not null check (category in ('transport', 'energy', 'food', 'shopping', 'purchase', 'travel', 'other')),
  description text,
  activity_date date not null default current_date,
  amount numeric(12, 3) not null default 0 check (amount >= 0),
  unit text not null default 'unit',
  co2_kg numeric(12, 3) not null check (co2_kg >= 0),
  emission_factor numeric(12, 6),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  region_code text not null unique,
  name text not null,
  lat numeric(9, 6) not null,
  lng numeric(9, 6) not null,
  population bigint not null check (population >= 0),
  vulnerability_index numeric(4, 3) not null check (vulnerability_index between 0 and 1),
  exposure_fraction numeric(4, 3) not null check (exposure_fraction between 0 and 1),
  primary_risk text not null,
  climate_impacts text[] not null default '{}',
  hazard_weights jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.risk_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  footprint_id uuid references public.footprints(id) on delete set null,
  region_id uuid not null references public.regions(id) on delete cascade,
  risk_type text not null check (risk_type in ('flood', 'drought', 'heat', 'displacement', 'food_insecurity', 'storm', 'general')),
  risk_score numeric(5, 2) not null check (risk_score between 0 and 100),
  people_at_risk bigint not null default 0 check (people_at_risk >= 0),
  scenario jsonb not null default '{}'::jsonb,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists footprints_user_date_idx on public.footprints(user_id, activity_date desc);
create index if not exists footprints_import_idx on public.footprints(import_id);
create index if not exists imports_user_created_idx on public.imports(user_id, created_at desc);
create index if not exists risk_evaluations_user_created_idx on public.risk_evaluations(user_id, created_at desc);
create index if not exists risk_evaluations_region_idx on public.risk_evaluations(region_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists footprints_set_updated_at on public.footprints;
create trigger footprints_set_updated_at
before update on public.footprints
for each row execute function public.set_updated_at();

drop trigger if exists regions_set_updated_at on public.regions;
create trigger regions_set_updated_at
before update on public.regions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, location, country, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'location',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        location = coalesce(excluded.location, public.profiles.location),
        country = coalesce(excluded.country, public.profiles.country),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.regions (
  region_code,
  name,
  lat,
  lng,
  population,
  vulnerability_index,
  exposure_fraction,
  primary_risk,
  climate_impacts,
  hazard_weights
) values
  (
    'bangladesh-delta',
    'Bangladesh Delta',
    23.685000,
    90.356300,
    8500000,
    0.820,
    0.580,
    'Coastal flooding and sea level rise',
    array['Flooding', 'Cyclones', 'Saltwater intrusion'],
    '{"flood":0.88,"drought":0.22,"heat":0.48,"displacement":0.71,"food_insecurity":0.42}'::jsonb
  ),
  (
    'sahel-region',
    'Sahel Region',
    14.000000,
    2.000000,
    5600000,
    0.780,
    0.520,
    'Drought and desertification',
    array['Drought', 'Desertification', 'Food insecurity'],
    '{"flood":0.18,"drought":0.84,"heat":0.75,"displacement":0.64,"food_insecurity":0.86}'::jsonb
  ),
  (
    'pacific-islands',
    'Pacific Small Islands',
    -8.500000,
    179.000000,
    890000,
    0.910,
    0.680,
    'Sea level rise and storm surge',
    array['Sea level rise', 'Coral bleaching', 'Storm surge'],
    '{"flood":0.92,"drought":0.31,"heat":0.56,"displacement":0.78,"food_insecurity":0.48}'::jsonb
  ),
  (
    'central-america-highlands',
    'Central America Highlands',
    14.634900,
    -90.506900,
    3200000,
    0.730,
    0.460,
    'Extreme weather and crop failure',
    array['Hurricanes', 'Drought', 'Crop failure'],
    '{"flood":0.58,"drought":0.62,"heat":0.44,"displacement":0.46,"food_insecurity":0.72}'::jsonb
  ),
  (
    'east-african-highlands',
    'East African Highlands',
    1.000000,
    37.000000,
    6800000,
    0.710,
    0.500,
    'Irregular rainfall and food insecurity',
    array['Irregular rainfall', 'Food insecurity', 'Pastoral conflicts'],
    '{"flood":0.36,"drought":0.69,"heat":0.59,"displacement":0.50,"food_insecurity":0.82}'::jsonb
  )
on conflict (region_code) do update set
  name = excluded.name,
  lat = excluded.lat,
  lng = excluded.lng,
  population = excluded.population,
  vulnerability_index = excluded.vulnerability_index,
  exposure_fraction = excluded.exposure_fraction,
  primary_risk = excluded.primary_risk,
  climate_impacts = excluded.climate_impacts,
  hazard_weights = excluded.hazard_weights,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.imports enable row level security;
alter table public.footprints enable row level security;
alter table public.regions enable row level security;
alter table public.risk_evaluations enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "imports_select_own" on public.imports;
drop policy if exists "imports_insert_own" on public.imports;
drop policy if exists "imports_update_own" on public.imports;
drop policy if exists "footprints_select_own" on public.footprints;
drop policy if exists "footprints_insert_own" on public.footprints;
drop policy if exists "footprints_update_own" on public.footprints;
drop policy if exists "footprints_delete_own" on public.footprints;
drop policy if exists "regions_read_all" on public.regions;
drop policy if exists "risk_evaluations_select_own" on public.risk_evaluations;
drop policy if exists "risk_evaluations_insert_own" on public.risk_evaluations;
drop policy if exists "risk_evaluations_delete_own" on public.risk_evaluations;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "imports_select_own"
on public.imports for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "imports_insert_own"
on public.imports for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "imports_update_own"
on public.imports for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "footprints_select_own"
on public.footprints for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "footprints_insert_own"
on public.footprints for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    import_id is null
    or exists (
      select 1
      from public.imports
      where imports.id = footprints.import_id
        and imports.user_id = (select auth.uid())
    )
  )
);

create policy "footprints_update_own"
on public.footprints for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    import_id is null
    or exists (
      select 1
      from public.imports
      where imports.id = footprints.import_id
        and imports.user_id = (select auth.uid())
    )
  )
);

create policy "footprints_delete_own"
on public.footprints for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "regions_read_all"
on public.regions for select
to anon, authenticated
using (true);

create policy "risk_evaluations_select_own"
on public.risk_evaluations for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "risk_evaluations_insert_own"
on public.risk_evaluations for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    footprint_id is null
    or exists (
      select 1
      from public.footprints
      where footprints.id = risk_evaluations.footprint_id
        and footprints.user_id = (select auth.uid())
    )
  )
);

create policy "risk_evaluations_delete_own"
on public.risk_evaluations for delete
to authenticated
using ((select auth.uid()) = user_id);
