# DiV.ai — Plan proizvoda i strategija

> Verzija 1 — pripremljeno novembar 2026.
> Cilj: platforma koja automatski pravi sajtove/aplikacije, uz mesečnu uslugu održavanja kao glavni izvor prihoda.

---

## 1. Pozicioniranje

**Problem:** Mali biznisi ne žele da se bave tehnikom. Hoće rezultat — profesionalan sajt, zakazivanje i stalnu podršku — bez učenja alata.

**Naša prednost (done-for-you):**
- Konkurencija (Durable, Wix, GoDaddy, Fresha, Booksy) prodaje *alat* koji korisnik sam koristi.
- Mi prodajemo *uslugu*: napravimo, objavimo i održavamo — klijent se ne bavi ničim.

**Jedna rečenica:**
> „Profesionalan sajt/aplikacija + zakazivanje + stalno održavanje, sve za jednu mesečnu cenu.“

---

## 2. Tri nivoa proizvoda

| Nivo | Šta dobija klijent | Mesečna cena | Jednokratno |
|---|---|---|---|
| **1. Sajt** | Profesionalni sajt, forma za upit, SEO, hosting, SSL, izmene, podrška | **19 €** | — |
| **2. Web aplikacija** | Sve iz nivoa 1 + online zakazivanje, kalendar dostupnosti, više zaposlenih, upiti u panelu, Google sinhronizacija | **49 €** | — |
| **3. Mobilna aplikacija** | Sve iz nivoa 2 + nativna iOS/Android app, push obaveštenja, objava u prodavnicama | **149 €** | **999 €** (dizajn + objava + Apple/Google takse) |

**Logika cena:**
- Sajt (19€) = ulazni proizvod, lako se prodaje.
- Web app (49€) = glavna vrednost, ovde je zakazivanje koje klijent želi.
- Mobilna (149€ + 999€) = premium, redak ali visokomarginalan.

**Ciljni miks prihoda (nakon 12 meseci):** 70% sajt / 20% web app / 10% mobilna.

---

## 3. Univerzalni sistem šablona (sve delatnosti)

Umesto šablona po firmi — **kategorije + preseti**.

### Kategorije (prva verzija)
1. Lepota i nega (salon, berber, spa, kozmetika)
2. Auto (mehaničar, vulkanizer, autopraonica)
3. Ugostiteljstvo (restoran, kafić, pekara)
4. Zdravlje (stomatolog, fizioterapeut, psiholog, nutricionista)
5. Sport i fitnes (teretana, personalni trener, joga, tenis)
6. Edukacija (škola jezika, časovi, kursevi)
7. Usluge u kući (moler, električar, vodoinstalater, čišćenje)
8. Profesionalne usluge (knjigovođa, advokat, konsultant)
9. Prodavnice i zanat (butik, cvećara, zlatar)

### Šta nosi svaki preset
- Početni tekstovi (naslov, opis, „o nama“)
- Lista usluga sa trajanjem i cenom
- Tip zakazivanja koji toj delatnosti odgovara
- Paleta boja + ikona
- Koji blokovi su uključeni

### Blokovi (uključi/isključi, kao sada)
Naslovna · O nama · Usluge i cene · Galerija · Cenovnik · Radno vreme · Zakazivanje · Kontakt i lokacija · Google mapa · Recenzije · Česta pitanja (FAQ) · Blog/Vesti

---

## 4. Booking engine — sve opcije

### Tipovi zakazivanja
| Tip | Primer | Karakteristike |
|---|---|---|
| **Termin** | frizer, stomatolog | usluga + trajanje + zaposleni |
| **Rezervacija** | sto, soba, teren, oprema | resurs umesto zaposlenog |
| **Grupni termin** | joga, kurs, radionica | 1 termin, N mesta |
| **Konsultacija** | poziv/video | bez fizičke posete |
| **Upit za ponudu** | majstor, moler | samo kontakt, bez termina |
| **Isporuka/preuzimanje** | praonica, pekara | bez termina, vreme preuzimanja |

### Mogućnosti koje mora da ima
- Više zaposlenih i više lokacija
- Depozit / avans (Stripe)
- Ponavljajući termini
- Lista čekanja
- Podsetnici (email + SMS)
- Politika otkazivanja i rok za otkaz
- Potvrda termina (klijent potvrđuje klikom)

---

## 5. Kalendar dostupnosti

- Radno vreme po danu, sa pauzama
- Praznici i neradni dani
- Blokade (kad zaposleni ne radi)
- Prikaz po zaposlenom (boje)
- **Sinhronizacija sa Google kalendarom** (dvosmerna) — ključni prodajni argument
- Automatska zaštita od duplih termina

---

## 6. Konkurencija i naša pozicija

| Igrač | Cena | Model | Naš odgovor |
|---|---|---|---|
| Durable | $25–49/mes | AI sajt, DIY | Mi radimo umesto njega |
| Wix / GoDaddy | ~$17–30/mes | DIY sajt | Done-for-you + održavanje |
| Fresha / Booksy | $13–70/mes | Booking + tržište | Zakazivanje ugrađeno, bez provizije |
| SimplyBook.me | $13.9+/mes | Booking alat | Sve u jednom, bez podešavanja |
| Adalo / FlutterFlow | $36–65/mes | No-code app | Mi objavimo i održavamo |

**Ključna poruka u prodaji:** „Drugi ti daju alat. Mi ti damo gotov rezultat i brinemo o njemu.“

---

## 7. Faze razvoja (roadmap)

### Faza 0 — Završeno
- Uređivač sa 2 šablona, blokovi, boja, usluge
- Demo forma za upit → Supabase (`leads` tabela)
- Stripe checkout + webhook (osnovni)

### Faza 1 — Širina (sve delatnosti) — ✅ urađeno
- Kategorije + preseti (10 kategorija, 48 šablona)
- Generički šablon „Druga delatnost“ za delatnosti kojih nema na listi
- Više blokova (galerija, recenzije, FAQ, mapa)
- Pregled po kategoriji pri izboru šablona
- Tipovi zakazivanja (termin, rezervacija, grupni, konsultacija, upit)

### Faza 2 — Zakazivanje (jezgro vrednosti) — 🟡 najveći deo urađen
- ✅ Kalendar dostupnosti: radno vreme po danu, dužina termina, pauza, blokirani datumi
- ✅ Izbor slobodnog termina u formi (zauzeti termini se ne prikazuju)
- ✅ Trajanje termina po usluzi (od 15 min do više dana) — kalendar prikazuje samo termine koji stvarno stanu
- ✅ Logo (upload) ili automatski inicijali, AI slike za naslovnu i galeriju
- ✅ Izvoz kalendara (.ics za Google / Apple / Outlook)
- ⬜ Google dvosmerna sinhronizacija (OAuth)
- ⬜ Zaposleni / resursi (više kalendara po biznisu)
- ⬜ Potvrda i podsetnici emailom / SMS-om

### Faza 3 — Nalozi i naplata — ✅ urađeno (live testiranje čeka Stripe ključeve)
- ✅ Registracija/prijava preko Supabase Auth (email + lozinka)
- ✅ Profil sa planom i statusom pretplate (`profiles`, RLS: samo vlasnik čita)
- ✅ Sajtovi po korisniku (`sites`), čuvanje na nalog i lista u „Moj nalog“
- ✅ Razdvajanje podataka: upiti se čitaju samo za sajtove sa naloga
- ✅ Ograničenje broja sajtova po planu (trigger u bazi + provera u klijentu)
- ✅ Stripe checkout po planu (19 / 49 / 149 € + 999 € jednokratno)
- ✅ Billing portal i webhook koji ažurira plan i status
- ✅ Objava sajta na javnu adresu `/s/<slug>` (bez prijave, sa SEO meta i JSON-LD)
- ⬜ Live test plaćanja (čeka prave Stripe ključeve i `STRIPE_WEBHOOK_SECRET`)

### Faza 4 — Mobilna aplikacija (premium)
- Počni kao PWA (sajt koji se instalira kao app)
- Zatim prava nativna objava (Apple + Google)
- Push obaveštenja

### Faza 5 — Rast
- Višejezičnost, analitika, automatski izveštaji klijentima

---

## 8. Ključni pokazatelji (KPI)

- **MRR** (mesečni ponavljajući prihod)
- **Broj aktivnih pretplatnika** po nivou
- **Konverzija:** poseta → pokrenut sajt → plaćen klijent
- **Churn** (otkazivanje) — cilj ispod 3%/mesec
- **Vreme do prvog sajta** — cilj ispod 10 min

---

## 9. Rizici i odgovori

| Rizik | Odgovor |
|---|---|
| Konkurencija je jeftina i velika | Fokus na done-for-you i lokalno tržište (jezik, podrška) |
| Klijenti ne plaćaju održavanje | Jasna vrednost: hosting + izmene + zakazivanje + podrška |
| Mobilna app skupa za razvoj | Počni PWA-om, pravu app samo uz avans |
| Podrška oduzima vreme | Ograniči šta ulazi u cenu (1 izmena/mes, ostalo doplata) |

---

## 10. Šta raditi SADA (preporuka)

1. **Faza 1** — kategorije + preseti: brz, vidljiv napredak, otvara tržište na sve delatnosti.
2. Paralelno: **cenovnik i ponuda** (stranica sa 3 nivoa) — može da se prodaje i pre nego što zakazivanje bude gotovo.

---

*Sledeći korak po dogovoru: krenuti sa implementacijom Faze 1.*
