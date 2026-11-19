import BookingForm from '../blocks/booking-form';
import { LogoMark } from '../blocks/site-parts';
import { GalleryPlaceholder, SiteImage } from '../blocks/site-image';
import { SiteIcon, siteIconFor } from '../blocks/site-icons';
import {
  bookingCopy,
  durationLabel,
  mapsEmbedLink,
  mapsSearchLink,
  paletteOf,
  whatsappLink,
  type LayoutProps,
} from '../blocks/site-types';

// Editorial — magazinski ritam: serif naslovi, asimetrija, hairline linije
// umesto okvira i kartica. Za advokate, agencije, škole, konsultante.
export default function EditorialLayout({ draft, bookings, onBooking, bookingMessage, variant = 'preview' }: LayoutProps) {
  const visible = (id: (typeof draft.visibleBlocks)[number]) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const waLink = whatsappLink(draft.phone, `Zdravo, zanima me termin u ${draft.businessName}.`);
  const meta = [draft.address, draft.phone, draft.hours.weekdays].filter(Boolean);
  const p = paletteOf(draft.accentColor);
  const icon = siteIconFor(draft);

  const wrapperClass = variant === 'page'
    ? 'site-font mx-auto min-h-screen w-full bg-white'
    : 'site-font mx-auto min-h-[740px] max-w-[980px] overflow-hidden bg-white shadow-lg';

  return <div className={wrapperClass} style={{ '--site-accent': p.accent, '--site-serif': 'var(--font-fraunces)' } as React.CSSProperties}>
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <a href="#site-top" className="flex items-center gap-3">
          <LogoMark draft={draft} rounded="rounded-none" size="sm" />
          <span className="flex flex-col leading-tight">
            <span className="site-serif text-lg tracking-tight text-slate-950">{draft.businessName || 'Naziv vašeg biznisa'}</span>
            {draft.businessType && <span className="text-[8px] uppercase tracking-[0.28em] text-slate-400">{draft.businessType}</span>}
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:flex">
          {visible('about') && <a href="#site-about" className="transition hover:text-slate-950">O nama</a>}
          {visible('services') && <a href="#site-services" className="transition hover:text-slate-950">Usluge</a>}
          {visible('reviews') && <a href="#site-reviews" className="transition hover:text-slate-950">Recenzije</a>}
          {visible('contact') && <a href="#site-contact" className="transition hover:text-slate-950">Kontakt</a>}
        </nav>
        {visible('booking') && (
          <a href="#site-booking" className="border-b border-slate-900 pb-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:border-slate-400">
            {copy.nav} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </header>

    {visible('hero') && <section id="site-top" className="border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-[1.15fr_0.85fr] sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: p.accent }}>
              <SiteIcon name={icon} className="h-3 w-3" /> {draft.businessType || 'Dobrodošli'}
            </p>
            <h1 className="mt-5 site-serif text-3xl leading-[1.08] tracking-tight text-slate-950 sm:text-5xl">
              {draft.tagline || 'Vaša poruka dobrodošlice'}
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-600">{draft.description}</p>
            {visible('booking') && (
              <a href="#site-booking" className="mt-8 inline-block border-b-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950" style={{ borderColor: draft.accentColor }}>
                {copy.hero} <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-slate-200" style={{ backgroundColor: p.tint }}>
            {draft.heroImageUrl ? (
              <img src={draft.heroImageUrl} alt={draft.businessName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col justify-between p-5">
                <span className="text-[9px] uppercase tracking-[0.28em] text-slate-400">Portret prostora</span>
                <span style={{ color: p.accent }}><SiteIcon name={icon} className="h-10 w-10" strokeWidth={1.2} /></span>
                <span className="text-[10px] leading-5 text-slate-500">{draft.businessName}</span>
              </div>
            )}
          </div>
        </div>
        {meta.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-200 pt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {meta.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ul>
        )}
      </div>
    </section>}

    {visible('about') && <section id="site-about" className="border-b border-slate-200">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-[0.6fr_1.4fr] sm:px-10">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">01 — O nama</p>
          <h2 className="mt-3 site-serif text-2xl leading-tight tracking-tight text-slate-950">Dobro došli u {draft.businessName}.</h2>
        </div>
        <div>
          <p className="max-w-xl site-serif text-lg leading-8 text-slate-700 first-letter:float-left first-letter:mr-2 first-letter:site-serif first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-slate-950">
            {draft.description}
          </p>
          <a href="#site-contact" className="mt-5 inline-block border-b border-slate-300 pb-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-900 hover:text-slate-950">
            Saznajte više <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>}

    {visible('services') && <section id="site-services" className="border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-900 pb-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">02 — Usluge</p>
            <h2 className="mt-2 site-serif text-2xl tracking-tight text-slate-950">Šta nudimo</h2>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Cene i trajanje</span>
        </div>
        <ul className="divide-y divide-slate-200">
          {draft.services.map((service, index) => (
            <li key={`${service.name}-${index}`} className="grid gap-2 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-8">
              <span className="site-serif text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="site-serif text-lg leading-snug text-slate-950">{service.name || 'Naziv usluge'}</h3>
                <p className="mt-1 max-w-xl text-xs leading-6 text-slate-500">{service.description}</p>
                {(service.durationMinutes || service.durationDays) ? (
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-400">Trajanje · {durationLabel({ days: service.durationDays ?? 0, minutes: service.durationMinutes ?? 0 })}</p>
                ) : null}
              </div>
              <span className="site-serif text-base text-slate-950 sm:text-right">{service.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>}

    {visible('gallery') && <section className="border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">03 — Galerija</p>
            <h2 className="mt-2 site-serif text-2xl tracking-tight text-slate-950">Naš rad</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {draft.gallery.map((item, index) => (
            <figure key={`${item.label}-${index}`}>
              <div className="aspect-[4/5] w-full overflow-hidden border border-slate-200" style={{ backgroundColor: p.tint }}>
                <SiteImage src={item.imageUrl} alt={item.label} className="h-full w-full object-cover" fallback={<GalleryPlaceholder label={item.label} icon={icon} accent={p.accent} />} />
              </div>
              <figcaption className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>}

    {visible('reviews') && <section id="site-reviews" className="border-b border-slate-200" style={{ backgroundColor: p.wash }}>
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">04 — Reč klijenata</p>
        <h2 className="mt-2 site-serif text-2xl tracking-tight text-slate-950">Šta kažu oni koji su bili</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {draft.reviews.map((review, index) => (
            <blockquote key={`${review.name}-${index}`} className="border-t-2 pt-4" style={{ borderColor: draft.accentColor }}>
              <p className="site-serif text-base leading-7 text-slate-800">„{review.text}“</p>
              <footer className="mt-4 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-slate-500">
                <span className="font-bold text-slate-700">{review.name}</span>
                <span aria-label={`${review.rating} od 5`} style={{ color: draft.accentColor }}>{'★'.repeat(review.rating)}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>}

    {visible('faq') && <section className="border-b border-slate-200">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-12 sm:grid-cols-[0.6fr_1.4fr] sm:px-10">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">05 — Pitanja</p>
          <h2 className="mt-2 site-serif text-2xl tracking-tight text-slate-950">Česta pitanja</h2>
        </div>
        <div className="border-t border-slate-200">
          {draft.faq.map((item, index) => (
            <details key={`${item.question}-${index}`} className="group border-b border-slate-200 py-3">
              <summary className="flex cursor-pointer items-center justify-between gap-3 site-serif text-sm text-slate-900">
                {item.question}
                <span className="text-slate-300 transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-2 max-w-xl text-xs leading-6 text-slate-500">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>}

    {visible('hours') && <section className="border-b border-slate-200">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-[0.6fr_1.4fr] sm:px-10">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">06 — Vreme</p>
          <h2 className="mt-2 site-serif text-2xl tracking-tight text-slate-950">Radno vreme</h2>
          <p className="mt-3 max-w-xs text-xs leading-6 text-slate-500">Pozovite nas ukoliko vam je potreban termin van redovnog radnog vremena.</p>
        </div>
        <dl className="border-t border-slate-200 text-xs">
          {[['Ponedeljak – petak', draft.hours.weekdays], ['Subota', draft.hours.saturday], ['Nedelja', draft.hours.sunday]].map(([day, time]) => (
            <div key={day} className="flex items-baseline justify-between gap-4 border-b border-slate-200 py-3">
              <dt className="uppercase tracking-[0.16em] text-slate-500">{day}</dt>
              <dd className="site-serif text-sm text-slate-900">{time}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>}

    {visible('booking') && <section id="site-booking" className="border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <div className="grid gap-8 sm:grid-cols-[0.6fr_1.4fr]">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">07 — Termin</p>
            <h2 className="mt-2 site-serif text-2xl leading-tight tracking-tight text-slate-950">{copy.hero}</h2>
            <p className="mt-3 max-w-xs text-xs leading-6 text-slate-500">{copy.section}. Popunite formu, a naš tim će vas kontaktirati radi potvrde.</p>
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b border-slate-300 pb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 transition hover:border-slate-900 hover:text-slate-950">
                Ili pišite na WhatsApp <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
          <BookingForm
            draft={draft}
            bookings={bookings}
            onBooking={onBooking}
            bookingMessage={bookingMessage}
            theme="flat"
          />
        </div>
      </div>
    </section>}

    {visible('map') && <section className="border-b border-slate-200">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-[0.6fr_1.4fr] sm:px-10">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">08 — Lokacija</p>
          <h2 className="mt-2 site-serif text-2xl tracking-tight text-slate-950">Gde se nalazimo</h2>
          <p className="mt-3 text-xs leading-6 text-slate-500">{draft.address || 'Unesite adresu da bi se prikazala mapa.'}</p>
          {draft.address && (
            <a href={mapsSearchLink(draft.address)} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b border-slate-300 pb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 transition hover:border-slate-900 hover:text-slate-950">
              Otvori u Google mapama <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        {draft.address ? (
          <div className="border border-slate-200">
            <iframe title={`Mapa — ${draft.businessName}`} src={mapsEmbedLink(draft.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[260px] w-full border-0" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center border border-slate-200 text-[10px] text-slate-400">Bez adrese nema mape</div>
        )}
      </div>
    </section>}

    {visible('contact') && <section id="site-contact" className="border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <div className="grid gap-8 sm:grid-cols-[1.2fr_0.8fr] sm:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">09 — Kontakt</p>
            <h2 className="mt-2 site-serif text-2xl tracking-tight text-slate-950">Posetite nas ili pozovite.</h2>
            <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="mt-4 inline-block site-serif text-2xl tracking-tight text-slate-950 transition hover:opacity-70">
              {draft.phone}
            </a>
            <p className="mt-2 text-xs text-slate-500">{draft.address}</p>
          </div>
          <div className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
            <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="flex items-center justify-between border-b border-slate-200 pb-2 text-slate-700 transition hover:text-slate-950">
              Telefon <span aria-hidden="true">→</span>
            </a>
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-slate-200 pb-2 text-slate-700 transition hover:text-slate-950">
                WhatsApp <span aria-hidden="true">→</span>
              </a>
            )}
            <a href={`mailto:${draft.email}`} className="flex items-center justify-between border-b border-slate-200 pb-2 text-slate-700 transition hover:text-slate-950">
              Email <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>}

    <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-[9px] uppercase tracking-[0.18em] text-slate-400 sm:px-10">
      <span>© {new Date().getFullYear()} {draft.businessName}</span>
      <span>Sva prava zadržana · DiV.ai</span>
    </footer>
  </div>;
}
