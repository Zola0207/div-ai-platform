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

### AI asistent

Editor ima dugme „Popuni tekstove pomoću AI“ koje iz naziva biznisa i delatnosti predlaže slogan, opis, tri usluge i FAQ.

1. Napravite besplatan ključ na https://aistudio.google.com/apikey
2. Upišite ga u `GEMINI_API_KEY` (samo server, nikad `NEXT_PUBLIC_`).
3. Po potrebi promenite model u `GEMINI_MODEL` (podrazumevano `gemini-flash-lite-latest`).

Ruta je `app/api/ai/suggest/route.ts`, logika u `lib/ai.ts`. Ako ključ nije postavljen, dugme vraća jasnu poruku i sajt normalno radi dalje. AI popunjava samo tekstove — nikada ne generiše HTML/CSS, pa dizajn ostaje stabilan.

**AI slike** idu preko `app/api/ai/images/route.ts`. Generisani tekst preko Gemini-ja je besplatan, ali generisanje slika na Gemini-ju traži plaćen plan, zato slike trenutno pravi Pollinations (besplatno, bez ključa) i čuva se samo URL u nacrtu. Ako kasnije pređete na plaćeni model ili na stock fotografije (Pexels/Unsplash), menja se samo ta ruta.

**Logo:** u uređivaču možete dodati svoj logo (PNG/JPG/WebP/SVG, automatski se smanjuje na 256 px). Ako ga nema, sajt prikazuje inicijale u boji brenda — bez ijednog spoljnog zahteva.

**Trajanje termina:** svaka usluga ima `durationMinutes` ili `durationDays`. Podrazumevano se bira po delatnosti (`CATEGORY_DURATION` u `app/site-builder.tsx`), a izuzeci su u `PRESET_DURATIONS`. Kalendar prikazuje samo termine u koje usluga stvarno staje; kada usluga traje ceo dan ili više dana, klijent bira samo datum.

## Kontakt, mapa i WhatsApp

- **Mapa:** blok „Mapa i lokacija“ prikazuje pravu Google mapu sa adresom (`https://www.google.com/maps?q=…&output=embed`, bez API ključa) i link „Otvori u Google mapama“. Blok se automatski uključuje svakom šablonu koji ima adresu; ako adrese nema, prikazuje se uputstvo umesto praznog okvira.
- **WhatsApp:** ako je telefon unet, sajt dobija dugme „WhatsApp“ u kontaktu i link „Ili pošaljite poruku na WhatsApp“ ispod forme za termin. Broj se sam prevodi iz lokalnog (`06x…`) u međunarodni format za `wa.me`.
- **Otkazani upiti:** upiti sa statusom „Otkazano“ više ne drže termin zauzetim — slot se odmah vraća u ponudu.
- **Deljenje:** posle objave u zaglavlju uređivača stoje „Otvori sajt“ i „Kopiraj link“.

## Statistika poseta

Panel **Statistika** (vidljiv prijavljenim korisnicima) prikazuje posete u poslednjih 30 dana, posete danas i u poslednjih 7 dana, broj upita, konverziju (upiti / posete) i tabelu po sajtu.

- Beleženje: `components/public-site.tsx` šalje **jedan** zahtev po sesiji posetioca na `POST /api/analytics/view`. Čuva se samo `site_id`, putanja, referrer i slučajni ID sesije — **bez IP adrese i bez kolačića**.
- Prikaz: `GET /api/analytics/summary` (samo prijavljeni vlasnik) čita posete i upite za svoje sajtove i računa dnevne serije i konverziju.
- Tabela `site_views` je bez RLS politika — upis i čitanje idu isključivo preko serverskih ruta.
- Dok tabela ne postoji, API vraća nule i panel prikazuje jasnu poruku umesto greške.

Migracija (jednom, u Supabase SQL Editoru):

```sql
alter table public.leads add column if not exists note text;

create table if not exists public.site_views (
  id bigserial primary key,
  site_id uuid references public.sites(id) on delete cascade,
  path text,
  referrer text,
  session_id text,
  created_at timestamptz not null default now()
);
create index if not exists site_views_site_created_idx on public.site_views (site_id, created_at desc);
alter table public.site_views enable row level security;
```

Isti SQL je i u `supabase/migrations/2026-11-17-notes-and-analytics.sql`.

## Dizajni sajtova (layouti)

Šablon ne određuje samo boju — određuje i **dizajn**. U nacrtu se čuva polje `layoutId`, a `components/site-preview.tsx` samo bira koji renderer crta stranu.

| `layoutId` | Ideja | Koriste ga |
|---|---|---|
| `classic` | čisto, centrirano, kartice sa senkom | većina šablona |
| `editorial` | serif naslovi, hairline linije, numerisane sekcije, bez kartica | advokat, knjigovodstvo, nekretnine, marketing, psihoterapija, škola jezika, instrukcije, IT akademija, muzička škola |
| `bold` | puna boja preko heroja, krupna velika slova, oštri uglovi, tamne sekcije | teretana, personalni trener, borilački klub, plesna škola, joga, tetovaža |

Svi ostali šabloni (i „Druga delatnost“) koriste `classic` dok se dizajn ne promeni u uređivaču.

- **Bez migracije baze:** `layoutId` živi u `sites.draft` (JSONB). Nacrti bez polja dobijaju `classic`, pa objavljeni sajtovi izgledaju identično kao pre.
- **Katalog:** kartica šablona crta minijaturu svog dizajna i bedž („Editorial dizajn“), pa se razlika vidi već u galeriji.
- **Uređivač:** kartica „Dizajn sajta“ menja raspored i tipografiju, ali ne dira tekstove, usluge ni termine.
- **Kontrast:** `contrastText()` bira taman/svetan tekst na akcentnoj boji, a `accentOnDark()` posvetljuje tamne akcente za tekst na tamnim sekcijama (npr. cene u Bold dizajnu).
- **Novi dizajn:** napraviti `components/layouts/<ime>.tsx` koji prima `LayoutProps`, dodati ID u `LAYOUT_IDS`/`LAYOUTS` (`components/blocks/site-types.ts`) i granu u `site-preview.tsx`.

Booking logika je izdvojena u `components/blocks/booking-form.tsx` i ima tri teme (`light`, `flat`, `dark`), da se kalendar ne duplira po dizajnu.

## SEO, deljenje i pravne strane

- **OG slika za deljenje:** `app/opengraph-image.tsx` pravi 1200×630 sliku sa brendom. Za svaki objavljen sajt postoji i dinamička slika u `app/s/[slug]/opengraph-image.tsx` (naziv biznisa, delatnost i boja brenda), pa link u Viberu/WhatsApp-u/Instagramu izgleda kao pravi sajt.
- **Sitemap i robots:** `app/sitemap.ts` automatski uključuje sve objavljene sajtove, `app/robots.ts` dozvoljava indeksiranje javnih strana i blokira `/api/`, `/nalog` i `/auth/`.
- **Naslovi:** šablon `%s — DiV.ai` važi za platformu, dok sajtovi klijenata koriste apsolutni naslov (`Studio Test Tri — Frizerski salon`), bez imena platforme.
- **Pravne strane:** `/privatnost` i `/uslovi` (obrađivač podataka, kolačići, pretplata, otkazivanje, odgovornost). Linkovi su u futeru početne strane.
- **404:** `app/not-found.tsx` vraća pravi status 404 uz linkove za povratak.
- Font za generisane slike je u `assets/Geist-Regular.ttf` (OFL) i podržava srpsku latinicu.

## Email obaveštenja

Kada posetilac pošalje upit sa objavljenog sajta, vlasnik dobija email sa imenom, telefonom, uslugom i terminom.

1. Napravite besplatan nalog na https://resend.com
2. Uzmite API ključ i upišite ga u `RESEND_API_KEY`.
3. Postavite `RESEND_FROM` na verifikovan domen (npr. `DiV.ai <obavestenja@div.ai>`). Bez verifikovanog domena Resend dozvoljava slanje samo na adresu vlasnika naloga.

Logika je u `lib/email.ts`, poziva se iz `app/api/leads/route.ts`. Ako ključ nije postavljen, upit se normalno čuva a email se preskače. Slanje je „best effort“ — greška u mejlu nikada ne obara upis upita.

## Upravljanje upitima

Panel **Upiti** (`components/leads-panel.tsx`) daje vlasniku:

- filter po statusu sa brojevima — **Novo / Potvrđeno / Završeno / Otkazano**
- pretragu po imenu, telefonu, usluzi i belešci
- promenu statusa direktno u redu (čuva se odmah)
- belešku do 1000 znakova (npr. „zvala, potvrdila termin“)
- klik na broj telefona za poziv sa mobilnog

Izmene idu kroz `app/api/leads/[id]/route.ts` (PATCH) i dozvoljene su samo vlasniku sajta na koji je upit vezan. Statusi se čuvaju u koloni `leads.status`, beleške u `leads.note`. Ako baza još nema `note`, status se i dalje čuva, a pokušaj beleške vraća jasnu poruku umesto greške.

## Objavljivanje sajta
- Dugme **„Objavi sajt“** u uređivaču postavlja `sites.status = 'published'` i dodeljuje jedinstvenu adresu.
- Javna strana je `app/s/[slug]/page.tsx` i radi bez prijave, sa SEO meta podacima i JSON-LD.
- Server-side renderer je `components/site-preview.tsx` (isti kod kao pregled u uređivaču), a forma za upite je u `components/public-site.tsx`.
- Adresa mora biti jedinstvena na celoj platformi — čuva je indeks `sites_slug_key`, a `app/api/sites/publish/route.ts` rešava sudare dodavanjem sufiksa (`-2`, `-3`…).
- Upiti poslati sa javne strane vezuju se za sajt preko `site_id` (samo ako je sajt objavljen).

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
