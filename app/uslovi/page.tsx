import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Uslovi korišćenja',
  description: 'Uslovi korišćenja DiV.ai platforme: nalog, pretplata, objavljivanje sajta, odgovornost i otkazivanje.',
  alternates: { canonical: '/uslovi' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Pravne informacije" title="Uslovi korišćenja" updated="17. novembar 2026.">
      <LegalSection title="1. Šta je DiV.ai">
        <p>
          DiV.ai je servis koji vam pomaže da napravite i objavite sajt za svoj biznis, sa formom za upite i opcionim
          zakazivanjem termina. Vi birate šablon i sadržaj, a mi obezbeđujemo tehnologiju, hosting i održavanje.
        </p>
      </LegalSection>

      <LegalSection title="2. Nalog">
        <p>
          Nalog pravite email adresom i lozinkom. Odgovorni ste za tačnost podataka i za čuvanje lozinke. Nalog je namenjen
          jednom biznisu; za više sajtova koristite odgovarajući plan.
        </p>
      </LegalSection>

      <LegalSection title="3. Pretplata i plaćanje">
        <p>
          Pretplata se plaća mesečno ili godišnje preko Stripe-a. Cene su iskazane u evrima i mogu se menjati uz najavu od
          30 dana. Ne naplaćujemo proviziju na vaše upite ni na promet.
        </p>
        <p>
          Ako plaćanje ne prođe, sajt ostaje dostupan 7 dana, a zatim se privremeno isključuje dok se pretplata ne obnovi.
          Podaci se čuvaju i vraćaju se odmah nakon uplate.
        </p>
      </LegalSection>

      <LegalSection title="4. Otkazivanje">
        <p>
          Pretplatu možete otkazati u svakom trenutku iz panela. Sajt radi do kraja plaćenog perioda. Nakon toga ga možete
          preuzeti (sadržaj i slike) ili obrisati.
        </p>
      </LegalSection>

      <LegalSection title="5. Vaš sadržaj">
        <p>
          Sadržaj koji unesete ostaje vaš. Dajete nam dozvolu da ga prikazujemo i obrađujemo isključivo radi pružanja
          usluge. Garantujete da imate pravo na tekstove, logo i slike koje unesete i da ne krše prava trećih lica.
        </p>
      </LegalSection>

      <LegalSection title="6. Pravila ponašanja">
        <p>Zabranjeno je koristiti platformu za:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>nelegalne sadržaje, obmanjivanje ili prevaru,</li>
          <li>slanje neželjenih poruka preko forme za upite,</li>
          <li>automatizovano opterećivanje servisa ili pokušaje neovlašćenog pristupa,</li>
          <li>objavljivanje tuđih ličnih podataka bez osnova.</li>
        </ul>
        <p>U slučaju kršenja možemo privremeno ili trajno ukinuti pristup.</p>
      </LegalSection>

      <LegalSection title="7. Dostupnost">
        <p>
          Trudimo se da servis radi bez prekida, ali ne garantujemo 100% dostupnost. Planirano održavanje najavljujemo
          unapred. Ne odgovaramo za prekide uzrokovane višom silom ili pružaocima infrastrukture.
        </p>
      </LegalSection>

      <LegalSection title="8. Ograničenje odgovornosti">
        <p>
          Ne garantujemo broj upita, prodaju ni poziciju na pretraživačima. Naša odgovornost je ograničena na iznos
          pretplate plaćene u poslednja tri meseca.
        </p>
      </LegalSection>

      <LegalSection title="9. Mobilna aplikacija">
        <p>
          Mobilna aplikacija je posebna usluga sa posebnom cenom i rokom izrade koji se dogovaraju pre početka rada. Ovim
          uslovima nije obuhvaćen obim te usluge.
        </p>
      </LegalSection>

      <LegalSection title="10. Izmene i pravo">
        <p>
          Uslove možemo menjati uz obaveštenje od 15 dana. Na odnose se primenjuje pravo Republike Srbije, a za sporove je
          nadležan sud u Beogradu.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
