# DiV.ai — platforma za sajtove, zakazivanje i pretplate

Web aplikacija za male biznise: izbor šablona po delatnosti, uređivanje sajta, kalendar dostupnosti, upiti i mesečne pretplate.

## Tehnologije

- Next.js 16 (App Router, Webpack build)
- Tailwind CSS 4
- Supabase (Auth, Postgres, RLS)
- Stripe (pretplate, billing portal, webhook)

## Pokretanje lokalno

```bash
npm install
npm run dev
```

Aplikacija radi i bez Supabase/Stripe ključeva — u tom režimu nacrti se čuvaju u `localStorage`, a upiti u pregledaču.

## Podešavanje okruženja

Kopirajte `.env.example` u `.env.local` i popunite vrednosti.

### Supabase

1. Otvorite SQL Editor projekta `gjrmhsnewhewzcbyncpr`.
2. Pokrenite ceo `supabase/schema.sql` (idempotentan je).
3. U `Authentication → Providers` uključite Email.
4. Po želji isključite „Confirm email“ za brži lokalni razvoj.
5. U `Authentication → URL Configuration` dodajte `http://localhost:3000` i produkcijski domen.

Šema pravi:

- `profiles` — plan, status pretplate, Stripe ID-jevi
- `sites` — sajtovi po korisniku (RLS: samo vlasnik)
- `leads` — upiti, opciono vezani za `site_id`
- trigger koji pravi profil pri registraciji
- ograničenje broja sajtova po planu

Skripta je idempotentna i dopunjava i starije baze (npr. `leads` tabelu iz prve verzije), pa je bezbedno pokrenuti je ponovo nakon izmena.

### Stripe

1. U Dashboard → Developers → Webhooks dodajte endpoint:
   `https://<domen>/api/webhook`
2. Dogађаји:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
3. Kopirajte signing secret u `STRIPE_WEBHOOK_SECRET`.
4. Opciono: napravite mesečne cene u Stripe-u i upišite ID-jeve u `STRIPE_PRICE_SITE`, `STRIPE_PRICE_APP`, `STRIPE_PRICE_MOBILE`. Bez njih checkout koristi inline cene iz `lib/plans.ts`.
5. Uključite Customer Billing Portal u Stripe podešavanjima (za promenu plana i kartice).

## Nalozi i naplata

- Registracija/prijava ide preko Supabase Auth (email + lozinka).
- Sajt se čuva na nalog klikom na „Sačuvaj na nalog“.
- „Moj nalog“ prikazuje plan, status pretplate i listu sajtova.
- Cena i sadržaj planova: `lib/plans.ts`.
- Checkout: `app/api/checkout/route.ts`
- Portal: `app/api/billing-portal/route.ts`
- Webhook: `app/api/webhook/route.ts`

## Skripte

```bash
npm run dev      # razvoj (webpack)
npm run build    # produkcijski build
npm run start    # pokretanje build-a
npm run lint     # ESLint
npx tsc --noEmit # TypeScript provera
```
