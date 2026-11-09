-- DiV.ai — Supabase šema (pokreni ovo u Supabase SQL Editoru)
-- https://supabase.com/dashboard/project/gjrmhsnewhewzcbyncpr/sql/new
-- Skripta je idempotentna: može se pokrenuti više puta.

-- 1. Profili — jedan red po korisniku (auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'none' check (plan in ('none', 'site', 'app', 'mobile')),
  subscription_status text not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_stripe_customer_idx on public.profiles (stripe_customer_id);

-- 2. Sajtovi — svaki korisnik vidi samo svoje
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Moj sajt',
  slug text not null,
  template_id text,
  category_id text,
  draft jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists sites_owner_id_idx on public.sites (owner_id);
create index if not exists sites_updated_at_idx on public.sites (updated_at desc);

-- 3. Upiti — dodajemo vezu sa sajtom (stare baze je nemaju)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  site_id uuid references public.sites(id) on delete set null,
  business_name text,
  client_name text not null,
  phone text not null,
  service text,
  preferred_date date,
  preferred_time text,
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

alter table public.leads add column if not exists site_id uuid references public.sites(id) on delete set null;
create index if not exists leads_site_id_idx on public.leads (site_id);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- 4. Nasleđena tabela (raniji webhook). Nova naplata koristi public.profiles.
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  email text,
  status text not null default 'trial',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Automatsko kreiranje profila pri registraciji
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Popuni profile za korisnike koji su već registrovani
insert into public.profiles (id, email, full_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', '')
from auth.users
on conflict (id) do nothing;

-- 6. Automatski updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists sites_set_updated_at on public.sites;
create trigger sites_set_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();

-- 7. Ograničenje broja sajtova po planu
create or replace function public.enforce_site_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_plan text;
  allowed integer;
  current_count integer;
begin
  select plan into owner_plan from public.profiles where id = new.owner_id;
  allowed := case owner_plan
    when 'app' then 3
    when 'mobile' then 10
    else 1
  end;

  select count(*) into current_count from public.sites where owner_id = new.owner_id;
  if current_count >= allowed then
    raise exception 'Plan % dozvoljava najviše % sajtova.', coalesce(owner_plan, 'none'), allowed
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists sites_enforce_limit on public.sites;
create trigger sites_enforce_limit
  before insert on public.sites
  for each row execute function public.enforce_site_limit();

-- 8. Row Level Security
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.leads enable row level security;
alter table public.tenants enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

-- Profil se pravi isključivo kroz trigger pri registraciji (security definer).
-- Plan, status i Stripe ID-jeve menja samo serverska API ruta (service role),
-- pa klijentu ne dajemo insert/update politiku nad profiles.
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

drop policy if exists sites_select_own on public.sites;
create policy sites_select_own on public.sites
  for select using (auth.uid() = owner_id);

drop policy if exists sites_insert_own on public.sites;
create policy sites_insert_own on public.sites
  for insert with check (auth.uid() = owner_id);

drop policy if exists sites_update_own on public.sites;
create policy sites_update_own on public.sites
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists sites_delete_own on public.sites;
create policy sites_delete_own on public.sites
  for delete using (auth.uid() = owner_id);

-- Upiti se pišu/čitaju isključivo preko serverske API rute (service role),
-- pa anonimnom klijentu ne dajemo pristup.
