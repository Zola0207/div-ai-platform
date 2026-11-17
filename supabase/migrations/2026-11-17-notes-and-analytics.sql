-- Migracija za beleške na upitima i statistiku poseta.
-- Pokrenuti u Supabase → SQL Editor (jednom). Skripta je idempotentna.

-- 1. Beleške uz upit (panel „Upiti“)
alter table public.leads add column if not exists note text;

-- 2. Posete objavljenih sajtova (panel „Statistika“)
create table if not exists public.site_views (
  id bigserial primary key,
  site_id uuid references public.sites(id) on delete cascade,
  path text,
  referrer text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists site_views_site_created_idx on public.site_views (site_id, created_at desc);

-- Bez politika: upis ide preko /api/analytics/view, čitanje preko /api/analytics/summary,
-- oba koriste service role i proveravaju vlasništvo.
alter table public.site_views enable row level security;
