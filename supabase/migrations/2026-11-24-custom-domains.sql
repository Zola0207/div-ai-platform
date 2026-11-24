-- Sopstveni domen kupca (npr. vasbiznis.rs).
-- Pokrenuti u Supabase → SQL Editor (jednom). Skripta je idempotentna.

alter table public.sites add column if not exists custom_domain text;

-- Domen mora biti jedinstven na celoj platformi, bez obzira na velika/mala slova.
create unique index if not exists sites_custom_domain_key
  on public.sites (lower(custom_domain))
  where custom_domain is not null;

-- Provera da li je DNS aktivan ide preko Vercel API-ja, pa dodatna kolona nije potrebna.
