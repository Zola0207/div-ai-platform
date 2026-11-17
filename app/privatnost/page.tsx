import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description: 'Kako DiV.ai prikuplja, koristi i čuva podatke korisnika i posetilaca sajtova napravljenih preko platforme.',
  alternates: { canonical: '/privatnost' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Pravne informacije" title="Politika privatnosti" updated="17. novembar 2026.">
      <LegalSection title="1. Ko obrađuje podatke">
        <p>
          DiV.ai (u daljem tekstu „mi“) je platforma za izradu i održavanje sajtova malih biznisa. Za pitanja o privatnosti
          pišite na <a className="font-semibold text-slate-800 hover:underline" href="mailto:podrska@div.ai">podrska@div.ai</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Koje podatke prikupljamo">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Podaci naloga:</strong> email adresa i lozinka (čuvana u hešovanom obliku), ime koje uneste.</li>
          <li><strong>Podaci sajta:</strong> naziv biznisa, opis, usluge, cene, radno vreme, logo i slike koje unesete.</li>
          <li><strong>Upiti posetilaca:</strong> ime, telefon, izabrana usluga i termin — ono što posetilac pošalje preko forme na vašem sajtu.</li>
          <li><strong>Tehnički podaci:</strong> IP adresa i vreme zahteva u server logovima, radi bezbednosti i sprečavanja zloupotrebe.</li>
          <li><strong>Podaci o plaćanju:</strong> obrađuje Stripe. Mi ne vidimo i ne čuvamo broj kartice.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Zašto ih obrađujemo">
        <p>
          Podatke koristimo da vam omogućimo izradu i objavljivanje sajta, prijem upita, slanje obaveštenja o novim upitima,
          naplatu pretplate i podršku. Pravni osnov je izvršenje ugovora, naš legitimni interes za bezbednost platforme i,
          gde je potrebno, vaša saglasnost.
        </p>
      </LegalSection>

      <LegalSection title="4. Ko ima pristup">
        <p>
          Vaš sajt i upiti vidljivi su samo vama. Za obradu koristimo proverene partnere koji podatke čuvaju u naše ime:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Supabase</strong> — baza podataka i prijava korisnika.</li>
          <li><strong>Vercel</strong> — hosting i objavljivanje sajtova.</li>
          <li><strong>Stripe</strong> — obrada plaćanja pretplate.</li>
          <li><strong>Resend</strong> — slanje email obaveštenja o upitima.</li>
          <li><strong>Google (Gemini)</strong> — generisanje tekstova kada kliknete dugme za AI pomoć.</li>
        </ul>
        <p>Podatke ne prodajemo i ne delimo u marketinške svrhe.</p>
      </LegalSection>

      <LegalSection title="5. Upiti sa vašeg sajta">
        <p>
          Kada posetilac pošalje upit preko sajta koji ste napravili, vi ste taj koji odlučuje o tim podacima. Mi ih samo
          čuvamo i prikazujemo vama. Preporučujemo da u svojoj politici privatnosti na sajtu navedete koje podatke tražite i
          koliko ih dugo čuvate.
        </p>
      </LegalSection>

      <LegalSection title="6. Koliko dugo čuvamo podatke">
        <p>
          Podatke naloga i sajta čuvamo dok god imate nalog. Upiti ostaju sačuvani dok ih vi ne obrišete ili dok ne obrišete
          sajt. Nakon brisanja naloga podaci se uklanjaju u roku od 30 dana, osim onoga što smo dužni da čuvamo po zakonu
          (npr. računovodstvena dokumentacija).
        </p>
      </LegalSection>

      <LegalSection title="7. Vaša prava">
        <p>
          Možete zatražiti pristup, ispravku, brisanje ili prenos svojih podataka, kao i da uložite pritužbu Povereniku za
          informacije od javnog značaja i zaštitu podataka o ličnosti. Zahtev pošaljite na email adresu iz tačke 1.
        </p>
      </LegalSection>

      <LegalSection title="8. Kolačići">
        <p>
          Koristimo samo neophodne kolačiće i lokalno skladište pregledača: za prijavu, za čuvanje nacrta sajta i za pamćenje
          izbora u formi. Ne koristimo reklamne ni analitičke kolačiće trećih strana, pa nema ni banera za saglasnost.
        </p>
      </LegalSection>

      <LegalSection title="9. Bezbednost">
        <p>
          Podaci su zaštićeni na nivou baze (Row Level Security), saobraćaj je šifrovan (HTTPS), a pristup podacima imaju
          samo ovlašćeni sistemi. Uprkos merama, nijedan sistem nije sto posto siguran.
        </p>
      </LegalSection>

      <LegalSection title="10. Izmene">
        <p>
          Ovu politiku možemo povremeno ažurirati. Značajne izmene ćemo objaviti na ovoj strani sa novim datumom.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
