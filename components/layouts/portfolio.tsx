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

// Portfolio — rad je na prvom mestu: galerija ide odmah ispod naslova,
// tekst je tih i mali. Za tetovaže, nokte, fotografiju, nakit, cveće.
export default function PortfolioLayout({ draft, bookings, onBooking, bookingMessage, variant = 'preview' }: LayoutProps) {
  const visible = (id: (typeof draft.visibleBlocks)[number]) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const waLink = whatsappLink(draft.phone, `Zdravo, zanima me termin u ${draft.businessName}.`);
  const heights = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]'];
  const p = paletteOf(draft.accentColor);
  const icon = siteIconFor(draft);

  const wrapperClass = variant === 'page'
    ? 'site-font mx-auto min-h-screen w-full bg-white'
    : 'site-font mx-auto min-h-[740px] max-w-[980px] overflow-hidden bg-white shadow-lg';

  return <div className={wrapperClass} style={{ '--site-accent': p.accent, '--site-sans': 'var(--font-instrument)' } as React.CSSProperties}>
    <header className="border-b border-slate-100">
      <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-9">
        <a href="#site-top" className="flex items-center gap-2.5">
          <LogoMark draft={draft} rounded="rounded-full" size="sm" />
          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-900">{draft.businessName || 'Naziv vašeg biznisa'}</span>
        </a>
        <nav className="hidden items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:flex">
          {visible('services') && <a href="#site-services" className="transition hover:text-slate-900">Usluge</a>}
          {visible('reviews') && <a href="#site-reviews" className="transition hover:text-slate-900">Utisci</a>}
          {visible('contact') && <a href="#site-contact" className="transition hover:text-slate-900">Kontakt</a>}
        </nav>
        {visible('booking') && (
          <a href="#site-booking" className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: draft.accentColor }}>
            {copy.nav} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </header>

    {visible('hero') && <section id="site-top" className="px-6 pb-8 pt-10 sm:px-9 sm:pb-10 sm:pt-12">
      <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: p.accent }}><SiteIcon name={icon} className="h-3 w-3" /> {draft.businessType || 'Portfolio'}</p>
      <h1 className="mt-3 max-w-2xl text-3xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">{draft.tagline || 'Vaša poruka dobrodošlice'}</h1>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-md text-xs leading-6 text-slate-500">{draft.description}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {draft.address && <span>{draft.address}</span>}
          {draft.phone && <span>{draft.phone}</span>}
        </div>
      </div>
    </section>}

    {visible('gallery') && <section className="px-3 pb-10 sm:px-4">
      <div className="columns-2 gap-3 sm:columns-3">
        {draft.gallery.map((item, index) => (
          <figure key={`${item.label}-${index}`} className="mb-3 break-inside-avoid">
            <div className={`group relative w-full overflow-hidden ${heights[index % heights.length]}`} style={{ backgroundColor: p.tint }}>
              <SiteImage src={item.imageUrl} alt={item.label} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" fallback={<GalleryPlaceholder label={item.label} icon={icon} accent={p.accent} />} />
            </div>
            <figcaption className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>}

    {visible('about') && <section id="site-about" className="border-t border-slate-100 px-6 py-10 sm:px-9">
      <div className="grid gap-4 sm:grid-cols-[0.4fr_1.6fr]">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">O nama</p>
        <div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">{draft.description}</p>
          <a href="#site-contact" className="mt-3 inline-block text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: draft.accentColor }}>
            Saznajte više <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>}

    {visible('services') && <section id="site-services" className="border-t border-slate-100 px-6 py-10 sm:px-9">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Usluge</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Šta radimo</h2>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Cene i trajanje</span>
      </div>
      <div className="mt-5 grid gap-x-10 sm:grid-cols-2">
        {draft.services.map((service, index) => (
          <div key={`${service.name}-${index}`} className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-3">
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-slate-900">{service.name || 'Naziv usluge'}</h3>
              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                {service.description}
                {(service.durationMinutes || service.durationDays) ? ` · ${durationLabel({ days: service.durationDays ?? 0, minutes: service.durationMinutes ?? 0 })}` : ''}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-black" style={{ color: draft.accentColor }}>{service.price}</span>
          </div>
        ))}
      </div>
    </section>}

    {visible('reviews') && <section id="site-reviews" className="border-t border-slate-100 px-6 py-10 sm:px-9" style={{ backgroundColor: p.tint }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Utisci</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {draft.reviews.map((review, index) => (
          <article key={`${review.name}-${index}`} className="border-t border-slate-200 pt-3">
            <p className="text-[10px] tracking-widest" style={{ color: draft.accentColor }}>{'★'.repeat(review.rating)}</p>
            <p className="mt-2 text-xs leading-6 text-slate-600">{review.text}</p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{review.name}</p>
          </article>
        ))}
      </div>
    </section>}

    {visible('faq') && <section className="border-t border-slate-100 px-6 py-10 sm:px-9">
      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Pitanja</p>
      <div className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
        {draft.faq.map((item, index) => (
          <details key={`${item.question}-${index}`} className="group py-3">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs font-bold text-slate-900">
              {item.question}
              <span className="text-slate-300 transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-2 max-w-xl text-[11px] leading-5 text-slate-500">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>}

    {visible('hours') && <section className="border-t border-slate-100 px-6 py-10 sm:px-9">
      <div className="grid gap-4 sm:grid-cols-[0.4fr_1.6fr]">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Radno vreme</p>
        <div className="grid gap-2 text-[11px] sm:grid-cols-3">
          {[['Pon – pet', draft.hours.weekdays], ['Subota', draft.hours.saturday], ['Nedelja', draft.hours.sunday]].map(([day, time]) => (
            <div key={day} className="border-b border-slate-100 pb-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">{day}</p>
              <p className="mt-0.5 font-bold text-slate-800">{time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>}

    {visible('booking') && <section id="site-booking" className="border-t border-slate-100 px-6 py-10 sm:px-9">
      <div className="grid gap-6 sm:grid-cols-[0.4fr_1.6fr]">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Termin</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{copy.hero}</h2>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">{copy.section}.</p>
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>
              WhatsApp <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
        <BookingForm
          draft={draft}
          bookings={bookings}
          onBooking={onBooking}
          bookingMessage={bookingMessage}
          waLink={waLink}
          theme="light"
        />
      </div>
    </section>}

    {visible('map') && <section className="border-t border-slate-100 px-6 py-10 sm:px-9">
      <div className="grid gap-4 sm:grid-cols-[0.4fr_1.6fr] sm:items-center">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Lokacija</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">{draft.address || 'Unesite adresu da bi se prikazala mapa.'}</p>
          {draft.address && (
            <a href={mapsSearchLink(draft.address)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>
              Otvori u mapama <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        {draft.address ? (
          <iframe title={`Mapa — ${draft.businessName}`} src={mapsEmbedLink(draft.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[220px] w-full border border-slate-100" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center border border-slate-100 text-[10px] text-slate-400">Bez adrese nema mape</div>
        )}
      </div>
    </section>}

    {visible('contact') && <section id="site-contact" className="px-6 py-10 sm:px-9" style={{ backgroundColor: p.deep, color: p.onDeep }}>
      <div className="grid gap-5 sm:grid-cols-[1.3fr_0.7fr] sm:items-end">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] opacity-60">Kontakt</p>
          <h2 className="mt-1 text-xl font-black tracking-tight">Posetite nas ili pozovite.</h2>
          <p className="mt-1 text-xs opacity-60">{draft.address}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[10px] font-bold" style={{ color: p.deep }}>
            <SiteIcon name="phone" className="h-3 w-3" /> Pozovi
          </a>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-4 py-2.5 text-[10px] font-bold text-white">WhatsApp</a>}
          <a href={`mailto:${draft.email}`} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[10px] font-bold" style={{ color: p.onDeep, boxShadow: `inset 0 0 0 1px ${p.onDeep}33` }}>
            <SiteIcon name="mail" className="h-3 w-3" /> Email
          </a>
        </div>
      </div>
    </section>}

    <footer className="flex flex-wrap items-center justify-between gap-2 px-6 py-5 text-[8px] font-bold uppercase tracking-[0.2em] sm:px-9" style={{ backgroundColor: p.deep, color: `${p.onDeep}80` }}>
      <span>© {new Date().getFullYear()} {draft.businessName}</span>
      <span>DiV.ai</span>
    </footer>
  </div>;
}
