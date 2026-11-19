import BookingForm from '../blocks/booking-form';
import { LogoMark } from '../blocks/site-parts';
import { GalleryPlaceholder, SiteImage } from '../blocks/site-image';
import { SiteIcon, siteIconFor } from '../blocks/site-icons';
import {
  accentOnDark,
  averageRating,
  bookingCopy,
  mapsEmbedLink,
  mapsSearchLink,
  paletteOf,
  whatsappLink,
  type LayoutProps,
} from '../blocks/site-types';

// Premium — tamna pozadina, tanke zlatne linije, serif naslovi i jelovnik
// umesto kartica. Za restorane, kafiće, hotele i proslave.
export default function PremiumLayout({ draft, bookings, onBooking, bookingMessage, variant = 'preview' }: LayoutProps) {
  const visible = (id: (typeof draft.visibleBlocks)[number]) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const waLink = whatsappLink(draft.phone, `Zdravo, zanima me termin u ${draft.businessName}.`);
  const p = paletteOf(draft.accentColor);
  const gold = accentOnDark(draft.accentColor);
  const rating = averageRating(draft.reviews);
  const icon = siteIconFor(draft);

  const wrapperClass = variant === 'page'
    ? 'site-font mx-auto min-h-screen w-full bg-[#12110f]'
    : 'site-font mx-auto min-h-[740px] max-w-[980px] overflow-hidden bg-[#12110f] shadow-lg';

  return <div className={wrapperClass} style={{ '--site-accent': p.accent, '--site-serif': 'var(--font-cormorant)' } as React.CSSProperties}>
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <a href="#site-top" className="flex items-center gap-3">
          <LogoMark draft={draft} rounded="rounded-none" size="sm" />
          <span className="site-serif text-lg tracking-wide text-[#f6f1e7]">{draft.businessName || 'Naziv vašeg biznisa'}</span>
        </a>
        <nav className="hidden items-center gap-6 text-[9px] font-semibold uppercase tracking-[0.26em] text-white/45 sm:flex">
          {visible('services') && <a href="#site-services" className="transition hover:text-white">Ponuda</a>}
          {visible('gallery') && <a href="#site-gallery" className="transition hover:text-white">Ambijent</a>}
          {visible('reviews') && <a href="#site-reviews" className="transition hover:text-white">Utisci</a>}
          {visible('contact') && <a href="#site-contact" className="transition hover:text-white">Kontakt</a>}
        </nav>
        {visible('booking') && (
          <a href="#site-booking" className="border px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.22em]" style={{ borderColor: gold, color: gold }}>
            {copy.nav}
          </a>
        )}
      </div>
    </header>

    {visible('hero') && <section id="site-top" className="relative overflow-hidden border-b border-white/10">
      {draft.heroImageUrl && (
        <>
          <SiteImage src={draft.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" fallback={<></>} />
          <div className="absolute inset-0 bg-[#12110f]/80" aria-hidden="true" />
        </>
      )}
      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:px-10 sm:py-24">
        <p className="flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.4em]" style={{ color: gold }}><SiteIcon name={icon} className="h-3 w-3" /> {draft.businessType || 'Dobrodošli'}</p>
        <h1 className="mt-6 site-serif text-3xl leading-[1.15] tracking-tight text-[#f8f3e9] sm:text-5xl">{draft.tagline || 'Vaša poruka dobrodošlice'}</h1>
        <span className="mx-auto mt-7 block h-px w-16" style={{ backgroundColor: gold }} aria-hidden="true" />
        <p className="mx-auto mt-6 max-w-lg text-xs leading-7 text-white/55 sm:text-sm">{draft.description}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {visible('booking') && (
            <a href="#site-booking" className="border px-6 py-3 text-[9px] font-bold uppercase tracking-[0.22em]" style={{ borderColor: gold, color: gold }}>
              {copy.hero}
            </a>
          )}
          {visible('services') && (
            <a href="#site-services" className="border border-white/15 px-6 py-3 text-[9px] font-bold uppercase tracking-[0.22em] text-white/60 transition hover:border-white/40 hover:text-white">
              Pogledajte ponudu
            </a>
          )}
        </div>
        {rating && (
          <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-white/40">
            <span style={{ color: gold }}>{'★'.repeat(Math.round(rating))}</span> · {rating.toFixed(1).replace('.', ',')} iz {draft.reviews.length} utisaka
          </p>
        )}
      </div>
    </section>}

    {visible('about') && <section id="site-about" className="border-b border-white/10">
      <div className="mx-auto grid max-w-3xl gap-6 px-6 py-12 sm:grid-cols-[auto_1fr] sm:gap-10 sm:px-10">
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Naša priča</p>
        <div>
          <p className="site-serif text-lg leading-8 text-[#efe8dc]">{draft.description}</p>
          <a href="#site-contact" className="mt-4 inline-block border-b pb-0.5 text-[9px] font-bold uppercase tracking-[0.22em]" style={{ borderColor: gold, color: gold }}>
            Posetite nas <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>}

    {visible('services') && <section id="site-services" className="border-b border-white/10">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:px-10">
        <div className="text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Ponuda</p>
          <h2 className="mt-3 site-serif text-2xl tracking-tight text-[#f8f3e9] sm:text-3xl">Naša ponuda</h2>
        </div>
        <ul className="mt-9">
          {draft.services.map((service, index) => (
            <li key={`${service.name}-${index}`} className="border-b border-white/10 py-4 last:border-b-0">
              <div className="flex items-baseline gap-3">
                <h3 className="site-serif text-base text-[#f8f3e9]">{service.name || 'Naziv usluge'}</h3>
                <span className="mb-1 h-px flex-1 border-b border-dotted border-white/20" aria-hidden="true" />
                <span className="site-serif text-sm whitespace-nowrap" style={{ color: gold }}>{service.price}</span>
              </div>
              <p className="mt-1 max-w-md text-[11px] leading-5 text-white/45">{service.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.22em] text-white/30">Cene su informativne · potvrda pri rezervaciji</p>
      </div>
    </section>}

    {visible('gallery') && <section id="site-gallery" className="border-b border-white/10">
      <div className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
        <div className="text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Ambijent</p>
          <h2 className="mt-3 site-serif text-2xl tracking-tight text-[#f8f3e9]">Galerija</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {draft.gallery.map((item, index) => (
            <figure key={`${item.label}-${index}`} className="group relative aspect-[4/5] overflow-hidden border border-white/10" style={{ backgroundColor: `${p.accent}0d` }}>
              <SiteImage src={item.imageUrl} alt={item.label} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" fallback={<GalleryPlaceholder label={item.label} icon={icon} accent={p.accent} tone="dark" />} />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/70">{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>}

    {visible('reviews') && <section id="site-reviews" className="border-b border-white/10">
      <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-10">
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Utisci gostiju</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {draft.reviews.map((review, index) => (
            <blockquote key={`${review.name}-${index}`}>
              <p className="text-[10px] tracking-[0.3em]" style={{ color: gold }}>{'★'.repeat(review.rating)}</p>
              <p className="mt-3 site-serif text-sm italic leading-7 text-[#efe8dc]">„{review.text}“</p>
              <footer className="mt-3 text-[9px] uppercase tracking-[0.22em] text-white/40">{review.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>}

    {visible('faq') && <section className="border-b border-white/10">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-10">
        <h2 className="text-center site-serif text-2xl tracking-tight text-[#f8f3e9]">Česta pitanja</h2>
        <div className="mt-6 border-t border-white/10">
          {draft.faq.map((item, index) => (
            <details key={`${item.question}-${index}`} className="group border-b border-white/10 py-3">
              <summary className="flex cursor-pointer items-center justify-between gap-3 site-serif text-sm text-[#efe8dc]">
                {item.question}
                <span className="text-white/30 transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-2 text-[11px] leading-6 text-white/45">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>}

    {visible('hours') && <section className="border-b border-white/10">
      <div className="mx-auto grid max-w-2xl gap-6 px-6 py-12 sm:grid-cols-2 sm:px-10">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Radno vreme</p>
          <h2 className="mt-3 site-serif text-2xl tracking-tight text-[#f8f3e9]">Kada nas nađete</h2>
        </div>
        <dl className="text-[11px]">
          {[['Ponedeljak – petak', draft.hours.weekdays], ['Subota', draft.hours.saturday], ['Nedelja', draft.hours.sunday]].map(([day, time]) => (
            <div key={day} className="flex items-baseline gap-3 border-b border-white/10 py-2.5 last:border-b-0">
              <dt className="uppercase tracking-[0.18em] text-white/40">{day}</dt>
              <span className="mb-1 h-px flex-1 border-b border-dotted border-white/15" aria-hidden="true" />
              <dd className="site-serif text-sm text-[#f8f3e9]">{time}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>}

    {visible('booking') && <section id="site-booking" className="border-b border-white/10">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:px-10">
        <div className="text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Rezervacija</p>
          <h2 className="mt-3 site-serif text-2xl tracking-tight text-[#f8f3e9] sm:text-3xl">{copy.hero}</h2>
          <p className="mt-2 text-[11px] leading-6 text-white/45">{copy.section}. Potvrdu dobijate telefonom.</p>
        </div>
        <BookingForm
          draft={draft}
          bookings={bookings}
          onBooking={onBooking}
          bookingMessage={bookingMessage}
          waLink={waLink}
          theme="dark"
          className="mt-7"
        />
      </div>
    </section>}

    {visible('map') && <section className="border-b border-white/10">
      <div className="mx-auto grid max-w-3xl gap-6 px-6 py-12 sm:grid-cols-2 sm:items-center sm:px-10">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Lokacija</p>
          <h2 className="mt-3 site-serif text-2xl tracking-tight text-[#f8f3e9]">Gde se nalazimo</h2>
          <p className="mt-3 text-[11px] leading-6 text-white/50">{draft.address || 'Unesite adresu da bi se prikazala mapa.'}</p>
          {draft.address && (
            <a href={mapsSearchLink(draft.address)} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b pb-0.5 text-[9px] font-bold uppercase tracking-[0.22em]" style={{ borderColor: gold, color: gold }}>
              Otvori u Google mapama <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        {draft.address ? (
          <div className="overflow-hidden border border-white/10">
            <iframe title={`Mapa — ${draft.businessName}`} src={mapsEmbedLink(draft.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[230px] w-full border-0" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center border border-white/10 text-[10px] text-white/30">Bez adrese nema mape</div>
        )}
      </div>
    </section>}

    {visible('contact') && <section id="site-contact" className="border-b border-white/10">
      <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-10">
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>Kontakt</p>
        <h2 className="mt-3 site-serif text-2xl tracking-tight text-[#f8f3e9]">Posetite nas ili pozovite.</h2>
        <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="mt-4 inline-block site-serif text-3xl tracking-tight text-[#f8f3e9] transition hover:opacity-70 sm:text-4xl">
          {draft.phone}
        </a>
        <p className="mt-2 text-[11px] text-white/45">{draft.address}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-[9px] font-bold uppercase tracking-[0.22em]">
          <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="border-b pb-0.5" style={{ borderColor: gold, color: gold }}>Telefon</a>
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer" className="border-b border-white/25 pb-0.5 text-white/60 transition hover:text-white">WhatsApp</a>
          )}
          <a href={`mailto:${draft.email}`} className="border-b border-white/25 pb-0.5 text-white/60 transition hover:text-white">Email</a>
        </div>
      </div>
    </section>}

    <footer className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-[8px] uppercase tracking-[0.24em] text-white/25 sm:px-10">
      <span>© {new Date().getFullYear()} {draft.businessName}</span>
      <span>Izrađeno uz DiV.ai</span>
    </footer>
  </div>;
}
