import BookingForm from '../blocks/booking-form';
import { HoursRow, LogoMark } from '../blocks/site-parts';
import {
  bookingCopy,
  durationLabel,
  mapsEmbedLink,
  mapsSearchLink,
  whatsappLink,
  type LayoutProps,
} from '../blocks/site-types';

// Servis — za zanatlije i majstore. Gusto, telefonski raspoređeno: poziv je
// uvek pri ruci, cene su u tabeli, a ne u karticama. Za vodoinstalatera,
// električara, molera, čišćenje, klimu, stolariju, selidbe, autoservis.
export default function UtilityLayout({ draft, bookings, onBooking, bookingMessage, variant = 'preview' }: LayoutProps) {
  const visible = (id: (typeof draft.visibleBlocks)[number]) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const waLink = whatsappLink(draft.phone, `Zdravo, potrebna mi je usluga — ${draft.businessName}.`);
  const tel = `tel:${draft.phone.replace(/[^+\d]/g, '')}`;

  const wrapperClass = variant === 'page'
    ? 'mx-auto min-h-screen w-full bg-[#fbfbf9] pb-16 sm:pb-0'
    : 'mx-auto min-h-[740px] max-w-[980px] overflow-hidden bg-[#fbfbf9] shadow-lg';

  // Lepljiva traka i mobilna traka za poziv imaju smisla samo na pravoj strani —
  // u pregledu uređivača bi prekrile sam uređivač.
  const topBarClass = variant === 'page' ? 'sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur' : 'border-b border-slate-200 bg-white';

  return <div className={wrapperClass} style={{ '--site-accent': draft.accentColor } as React.CSSProperties}>
    <div className={topBarClass}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <a href="#site-top" className="flex min-w-0 items-center gap-2.5">
          <LogoMark draft={draft} rounded="rounded-md" size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-black tracking-tight text-slate-950">{draft.businessName || 'Naziv vašeg biznisa'}</span>
            <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">{draft.businessType || 'Servis'}</span>
          </span>
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <a href={tel} className="hidden text-[12px] font-black tracking-tight text-slate-950 sm:block">{draft.phone}</a>
          <a href={tel} className="rounded-lg px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-white" style={{ backgroundColor: draft.accentColor }}>
            Pozovi
          </a>
        </div>
      </div>
    </div>

    {visible('hero') && <section id="site-top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-[1.25fr_0.75fr] sm:px-8 sm:py-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: draft.accentColor }} />
            {draft.icon} {draft.businessType || 'Dostupni smo danas'}
          </p>
          <h1 className="mt-4 text-3xl font-black leading-[1.06] tracking-tight text-slate-950 sm:text-[42px]">{draft.tagline || 'Vaša poruka dobrodošlice'}</h1>
          <p className="mt-3 max-w-lg text-xs leading-6 text-slate-600 sm:text-[13px]">{draft.description}</p>
          <div className="mt-6 flex flex-wrap items-stretch gap-2">
            <a href={tel} className="flex items-center gap-2 px-5 py-3.5 text-[11px] font-black text-white" style={{ backgroundColor: draft.accentColor }}>
              <span aria-hidden="true">☎</span> {draft.phone}
            </a>
            {visible('booking') && (
              <a href="#site-booking" className="flex items-center gap-2 border border-slate-300 px-5 py-3.5 text-[11px] font-black text-slate-900 transition hover:border-slate-900">
                {copy.nav} <span aria-hidden="true">→</span>
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-3.5 text-[11px] font-black text-[#128C7E]">
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="border border-slate-200 bg-[#fbfbf9] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Brze informacije</p>
          <dl className="mt-2 divide-y divide-slate-200 text-[11px]">
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-slate-500">Radno vreme</dt>
              <dd className="text-right font-black text-slate-900">{draft.hours.weekdays}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-slate-500">Subota</dt>
              <dd className="text-right font-black text-slate-900">{draft.hours.saturday}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-slate-500">Adresa</dt>
              <dd className="max-w-[60%] text-right font-bold text-slate-900">{draft.address || 'Po dogovoru'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-slate-500">Usluga</dt>
              <dd className="text-right font-bold text-slate-900">{draft.services.length} u ponudi</dd>
            </div>
          </dl>
          <p className="mt-3 border-t border-slate-200 pt-2 text-[9px] leading-4 text-slate-400">
            Pozovite pre dolaska — javljamo se radnim danima u radno vreme.
          </p>
        </div>
      </div>
    </section>}

    {visible('services') && <section id="site-services" className="border-b border-slate-200 bg-[#fbfbf9]">
      <div className="mx-auto max-w-5xl px-4 py-9 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 pb-2" style={{ borderColor: draft.accentColor }}>
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950 sm:text-xl">Cenovnik usluga</h2>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Bez skrivenih troškova</span>
        </div>
        <div className="divide-y divide-slate-200">
          {draft.services.map((service, index) => (
            <div key={`${service.name}-${index}`} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 py-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="min-w-0">
                <h3 className="text-[13px] font-black text-slate-950">{service.name || 'Naziv usluge'}</h3>
                <p className="mt-0.5 text-[10px] leading-5 text-slate-500">{service.description}</p>
              </div>
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:block sm:text-right">
                {(service.durationMinutes || service.durationDays) ? durationLabel({ days: service.durationDays ?? 0, minutes: service.durationMinutes ?? 0 }) : '—'}
              </span>
              <span className="whitespace-nowrap text-right text-[12px] font-black" style={{ color: draft.accentColor }}>{service.price}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[9px] leading-4 text-slate-400">Cene su okvirne. Konačnu cenu potvrđujemo pre početka rada, nakon kratkog opisa posla.</p>
      </div>
    </section>}

    {visible('about') && <section id="site-about" className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-9 sm:grid-cols-[0.55fr_1.45fr] sm:px-8">
        <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950">Ko smo mi</h2>
        <div>
          <p className="max-w-2xl text-xs leading-6 text-slate-600">{draft.description}</p>
          <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-500">
            Radimo na teritoriji grada i okoline. Dolazimo na adresu, procenjujemo posao i dogovaramo termin koji vam odgovara.
          </p>
          <a href="#site-contact" className="mt-3 inline-block border-b-2 pb-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-900" style={{ borderColor: draft.accentColor }}>
            Kontakt podaci <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>}

    {visible('gallery') && <section className="border-b border-slate-200 bg-[#fbfbf9]">
      <div className="mx-auto max-w-5xl px-4 py-9 sm:px-8">
        <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950">Naši radovi</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {draft.gallery.map((item, index) => (
            <figure key={`${item.label}-${index}`} className="relative aspect-square overflow-hidden border border-slate-200 bg-white">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.label} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">{item.emoji}</div>
              )}
              <figcaption className="absolute inset-x-0 bottom-0 bg-white/90 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-600">{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>}

    {visible('reviews') && <section id="site-reviews" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-9 sm:px-8">
        <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950">Iskustva klijenata</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {draft.reviews.map((review, index) => (
            <article key={`${review.name}-${index}`} className="border-l-2 pl-3" style={{ borderColor: draft.accentColor }}>
              <p className="text-[10px] tracking-[0.2em]" style={{ color: draft.accentColor }}>{'★'.repeat(review.rating)}</p>
              <p className="mt-1.5 text-[11px] leading-5 text-slate-600">{review.text}</p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">{review.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>}

    {visible('faq') && <section className="border-b border-slate-200 bg-[#fbfbf9]">
      <div className="mx-auto max-w-5xl px-4 py-9 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-[0.55fr_1.45fr]">
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950">Česta pitanja</h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {draft.faq.map((item, index) => (
              <details key={`${item.question}-${index}`} className="group py-2.5">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-[11px] font-black text-slate-900">
                  {item.question}
                  <span className="text-slate-400 transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-1.5 max-w-2xl text-[10px] leading-5 text-slate-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>}

    {visible('hours') && <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-9 sm:grid-cols-2 sm:px-8">
        <div>
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950">Radno vreme</h2>
          <p className="mt-2 max-w-sm text-[11px] leading-5 text-slate-500">Za hitne intervencije pozovite — trudimo se da izađemo istog dana.</p>
          <a href={tel} className="mt-3 inline-block text-[15px] font-black tracking-tight text-slate-950">{draft.phone}</a>
        </div>
        <div className="border border-slate-200 bg-[#fbfbf9] p-3 text-[10px]">
          <HoursRow day="Ponedeljak – petak" time={draft.hours.weekdays} />
          <HoursRow day="Subota" time={draft.hours.saturday} />
          <HoursRow day="Nedelja" time={draft.hours.sunday} />
        </div>
      </div>
    </section>}

    {visible('booking') && <section id="site-booking" className="border-b border-slate-200" style={{ backgroundColor: `${draft.accentColor}0a` }}>
      <div className="mx-auto max-w-4xl px-4 py-9 sm:px-8">
        <div className="border-l-4 pl-3" style={{ borderColor: draft.accentColor }}>
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950 sm:text-xl">{copy.hero}</h2>
          <p className="mt-1 text-[11px] leading-5 text-slate-600">{copy.section}. Ostavite podatke i kratak opis — javljamo se sa terminom i cenom.</p>
        </div>
        <BookingForm
          draft={draft}
          bookings={bookings}
          onBooking={onBooking}
          bookingMessage={bookingMessage}
          waLink={waLink}
          theme="flat"
          className="mt-4 bg-white"
        />
      </div>
    </section>}

    {visible('map') && <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-9 sm:grid-cols-[0.55fr_1.45fr] sm:items-center sm:px-8">
        <div>
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-slate-950">Gde radimo</h2>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">{draft.address || 'Unesite adresu da bi se prikazala mapa.'}</p>
          {draft.address && (
            <a href={mapsSearchLink(draft.address)} target="_blank" rel="noreferrer" className="mt-2 inline-block border-b pb-0.5 text-[9px] font-black uppercase tracking-[0.12em]" style={{ borderColor: draft.accentColor, color: draft.accentColor }}>
              Otvori u mapama <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        {draft.address ? (
          <iframe title={`Mapa — ${draft.businessName}`} src={mapsEmbedLink(draft.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[220px] w-full border border-slate-200" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center border border-slate-200 text-[10px] text-slate-400">Bez adrese nema mape</div>
        )}
      </div>
    </section>}

    {visible('contact') && <section id="site-contact" className="bg-slate-950">
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-8 sm:grid-cols-[1.2fr_0.8fr] sm:items-center sm:px-8">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: draft.accentColor }}>Kontakt</p>
          <a href={tel} className="mt-1 block text-2xl font-black tracking-tight text-white sm:text-3xl">{draft.phone}</a>
          <p className="mt-1 text-[11px] text-white/60">{draft.address} · {draft.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={tel} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-white" style={{ backgroundColor: draft.accentColor }}>Pozovi odmah</a>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="border border-white/25 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-white/80">WhatsApp</a>}
          <a href={`mailto:${draft.email}`} className="border border-white/25 px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-white/80">Email</a>
        </div>
      </div>
    </section>}

    <footer className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-4 py-4 text-[9px] text-white/40 sm:px-8">
      <span>© {new Date().getFullYear()} {draft.businessName}</span>
      <span>Izrađeno uz DiV.ai</span>
    </footer>

    {variant === 'page' && (
      <a href={tel} className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.1em] text-white sm:hidden" style={{ backgroundColor: draft.accentColor }}>
        <span aria-hidden="true">☎</span> Pozovi {draft.phone}
      </a>
    )}
  </div>;
}
