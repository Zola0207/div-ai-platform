import BookingForm from '../blocks/booking-form';
import { LogoMark } from '../blocks/site-parts';
import { GalleryPlaceholder, SiteImage } from '../blocks/site-image';
import { SiteIcon, siteIconFor } from '../blocks/site-icons';
import {
  accentOnDark,
  averageRating,
  bookingCopy,
  contrastText,
  durationLabel,
  mapsEmbedLink,
  mapsSearchLink,
  paletteOf,
  whatsappLink,
  type LayoutProps,
} from '../blocks/site-types';

// Bold — jaka boja preko celog heroja, krupna slova, oštri uglovi i
// numerisane sekcije. Za teretane, ples, tattoo, škole borilačkih veština.
export default function BoldLayout({ draft, bookings, onBooking, bookingMessage, variant = 'preview' }: LayoutProps) {
  const visible = (id: (typeof draft.visibleBlocks)[number]) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const waLink = whatsappLink(draft.phone, `Zdravo, zanima me termin u ${draft.businessName}.`);
  const rating = averageRating(draft.reviews);
  const onAccent = contrastText(draft.accentColor);
  const onDark = accentOnDark(draft.accentColor);
  const p = paletteOf(draft.accentColor);
  const icon = siteIconFor(draft);

  const stats = [
    { value: String(draft.services.length).padStart(2, '0'), label: 'usluga u ponudi' },
    { value: rating ? rating.toFixed(1).replace('.', ',') : '—', label: 'prosečna ocena' },
    { value: String(draft.reviews.length).padStart(2, '0'), label: 'recenzija klijenata' },
  ];

  const wrapperClass = variant === 'page'
    ? 'site-font mx-auto min-h-screen w-full bg-white'
    : 'site-font mx-auto min-h-[740px] max-w-[980px] overflow-hidden bg-white shadow-lg';

  return <div className={wrapperClass} style={{ '--site-accent': p.accent, '--site-sans': 'var(--font-archivo)' } as React.CSSProperties}>
    <header className="text-white" style={{ backgroundColor: p.deep }}>
      <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <a href="#site-top" className="flex items-center gap-3">
          <LogoMark draft={draft} rounded="rounded-none" size="sm" />
          <span className="text-sm font-black uppercase tracking-[0.16em]">{draft.businessName || 'Naziv vašeg biznisa'}</span>
        </a>
        <nav className="hidden items-center gap-6 text-[9px] font-bold uppercase tracking-[0.22em] text-white/50 sm:flex">
          {visible('services') && <a href="#site-services" className="transition hover:text-white">Usluge</a>}
          {visible('reviews') && <a href="#site-reviews" className="transition hover:text-white">Recenzije</a>}
          {visible('hours') && <a href="#site-hours" className="transition hover:text-white">Vreme</a>}
          {visible('contact') && <a href="#site-contact" className="transition hover:text-white">Kontakt</a>}
        </nav>
        {visible('booking') && (
          <a href="#site-booking" className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em]" style={{ backgroundColor: draft.accentColor, color: onAccent }}>
            {copy.nav}
          </a>
        )}
      </div>
    </header>

    {visible('hero') && <section id="site-top" className="relative overflow-hidden" style={{ backgroundColor: p.accent, color: onAccent }}>
      {draft.heroImageUrl && (
        <SiteImage src={draft.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" fallback={<></>} />
      )}
      <div className="relative px-6 pb-10 pt-12 sm:px-10 sm:pb-12 sm:pt-16">
        <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.32em] opacity-70"><SiteIcon name={icon} className="h-3.5 w-3.5" /> {draft.businessType || 'Dobrodošli'}</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
          {draft.tagline || 'Vaša poruka dobrodošlice'}
        </h1>
        <p className="mt-5 max-w-lg text-xs font-medium leading-6 opacity-80 sm:text-sm">{draft.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {visible('booking') && (
            <a href="#site-booking" className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] transition hover:opacity-90" style={{ backgroundColor: p.deep, color: p.onDeep }}>
              {copy.hero} <SiteIcon name="arrowRight" className="inline h-3 w-3" />
            </a>
          )}
          {visible('services') && (
            <a href="#site-services" className="border px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] transition hover:bg-white/10" style={{ borderColor: `${onAccent}80`, color: onAccent }}>
              Pogledaj ponudu
            </a>
          )}
        </div>
      </div>
      <div className="relative grid grid-cols-3 border-t" style={{ borderColor: `${onAccent}33` }}>
        {stats.map((stat, index) => (
          <div key={stat.label} className="px-4 py-4 sm:px-10" style={index > 0 ? { borderLeft: `1px solid ${onAccent}33` } : undefined}>
            <p className="text-xl font-black leading-none tracking-tight sm:text-2xl">{stat.value}</p>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] opacity-70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>}

    {visible('about') && <section id="site-about" className="grid gap-6 bg-white px-6 py-12 sm:grid-cols-[0.9fr_1.1fr] sm:px-10">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: draft.accentColor }}>01 — O nama</p>
        <h2 className="mt-3 text-2xl font-black uppercase leading-tight tracking-tight text-slate-950">Ko smo mi</h2>
      </div>
      <div>
        <p className="text-sm leading-7 text-slate-600">{draft.description}</p>
        <a href="#site-contact" className="mt-4 inline-block border-b-2 border-slate-950 pb-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">
          Saznajte više <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>}

    {visible('services') && <section id="site-services" className="px-6 py-12 text-white sm:px-10" style={{ backgroundColor: p.deep }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/40">02 — Ponuda</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">Naše usluge</h2>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Bez skrivenih troškova</span>
      </div>
      <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
        {draft.services.map((service, index) => (
          <article key={`${service.name}-${index}`} className="group grid gap-2 py-5 transition sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
            <span className="text-2xl font-black leading-none tracking-tight text-white/15 transition group-hover:text-white/40 sm:text-3xl">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.04em]">{service.name || 'Naziv usluge'}</h3>
              <p className="mt-1 max-w-xl text-[11px] leading-5 text-white/50">{service.description}</p>
              {(service.durationMinutes || service.durationDays) ? (
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">Trajanje · {durationLabel({ days: service.durationDays ?? 0, minutes: service.durationMinutes ?? 0 })}</p>
              ) : null}
            </div>
            <span className="text-sm font-black uppercase tracking-[0.06em]" style={{ color: onDark }}>{service.price}</span>
          </article>
        ))}
      </div>
    </section>}

    {visible('gallery') && <section className="bg-white px-6 py-12 sm:px-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: draft.accentColor }}>03 — Galerija</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-950">Naš rad</h2>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {draft.gallery.map((item, index) => (
          <div key={`${item.label}-${index}`} className="group relative aspect-square overflow-hidden" style={{ backgroundColor: p.tint }}>
            <SiteImage src={item.imageUrl} alt={item.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" fallback={<GalleryPlaceholder label={item.label} icon={icon} accent={p.accent} />} />
            <span className="absolute inset-x-0 bottom-0 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white" style={{ backgroundColor: `${p.deep}e6` }}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>}

    {visible('reviews') && <section id="site-reviews" className="bg-white px-6 pb-12 sm:px-10">
      <div className="border-t-4 pt-8" style={{ borderColor: draft.accentColor }}>
        <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: draft.accentColor }}>04 — Rezultati</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-950">Šta kažu klijenti</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {draft.reviews.map((review, index) => (
            <article key={`${review.name}-${index}`} className="border border-slate-200 p-4 transition hover:border-slate-950">
              <p className="text-xs font-black tracking-widest" style={{ color: draft.accentColor }}>{'★'.repeat(review.rating)}</p>
              <p className="mt-2 text-[11px] leading-5 text-slate-600">{review.text}</p>
              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-950">{review.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>}

    {visible('faq') && <section className="bg-slate-50 px-6 py-12 sm:px-10">
      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400">05 — Pitanja</p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-950">Česta pitanja</h2>
      <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
        {draft.faq.map((item, index) => (
          <details key={`${item.question}-${index}`} className="group py-3">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.06em] text-slate-950">
              {item.question}
              <span className="text-slate-300 transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>}

    {visible('hours') && <section id="site-hours" className="grid gap-6 bg-white px-6 py-12 sm:grid-cols-[0.8fr_1.2fr] sm:px-10">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: draft.accentColor }}>06 — Vreme</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-950">Radno vreme</h2>
        <p className="mt-2 text-[11px] leading-5 text-slate-500">Pozovite nas ukoliko vam je potreban termin van redovnog radnog vremena.</p>
      </div>
      <div className="divide-y divide-slate-200 border-y border-slate-200 text-[11px]">
        {[['Ponedeljak – petak', draft.hours.weekdays], ['Subota', draft.hours.saturday], ['Nedelja', draft.hours.sunday]].map(([day, time]) => (
          <div key={day} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="font-bold uppercase tracking-[0.16em] text-slate-400">{day}</span>
            <span className="font-black text-slate-950">{time}</span>
          </div>
        ))}
      </div>
    </section>}

    {visible('booking') && <section id="site-booking" className="relative overflow-hidden px-6 py-12 text-white sm:px-10" style={{ backgroundColor: p.deep }}>
      <div className="absolute right-0 top-0 h-32 w-32" style={{ backgroundColor: draft.accentColor, opacity: 0.15 }} aria-hidden="true" />
      <div className="relative grid gap-8 sm:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/40">07 — Termin</p>
          <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-tight">{copy.hero}</h2>
          <p className="mt-3 text-[11px] leading-5 text-white/50">{copy.section}. Popunite formu, a naš tim će vas kontaktirati radi potvrde.</p>
        </div>
        <BookingForm
          draft={draft}
          bookings={bookings}
          onBooking={onBooking}
          bookingMessage={bookingMessage}
          waLink={waLink}
          theme="dark"
        />
      </div>
    </section>}

    {visible('map') && <section className="grid gap-6 bg-white px-6 py-12 sm:grid-cols-[0.8fr_1.2fr] sm:px-10">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: draft.accentColor }}>08 — Lokacija</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-950">Gde se nalazimo</h2>
        <p className="mt-2 text-[11px] leading-5 text-slate-500">{draft.address || 'Unesite adresu da bi se prikazala mapa.'}</p>
        {draft.address && (
          <a href={mapsSearchLink(draft.address)} target="_blank" rel="noreferrer" className="mt-3 inline-block border-b-2 border-slate-950 pb-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950">
            Otvori u mapama <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      {draft.address ? (
        <iframe title={`Mapa — ${draft.businessName}`} src={mapsEmbedLink(draft.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[260px] w-full border border-slate-200" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center border border-slate-200 text-[10px] text-slate-400">Bez adrese nema mape</div>
      )}
    </section>}

    {visible('contact') && <section id="site-contact" className="px-6 py-10 sm:px-10" style={{ backgroundColor: draft.accentColor, color: onAccent }}>
      <div className="grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-end">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] opacity-70">09 — Kontakt</p>
          <h2 className="mt-2 text-2xl font-black uppercase leading-tight tracking-tight">Posetite nas ili pozovite</h2>
          <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="mt-3 inline-block text-2xl font-black tracking-tight sm:text-3xl" style={{ color: onAccent }}>
            {draft.phone}
          </a>
          <p className="mt-1 text-[11px] opacity-80">{draft.address}</p>
        </div>
        <div className="flex flex-col gap-2">
          <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em]" style={{ backgroundColor: p.deep, color: p.onDeep }}>Pozovi odmah</a>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="border px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em]" style={{ borderColor: `${onAccent}55`, color: onAccent }}>WhatsApp</a>}
          <a href={`mailto:${draft.email}`} className="border px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em]" style={{ borderColor: `${onAccent}55`, color: onAccent }}>Pošalji email</a>
        </div>
      </div>
    </section>}

    <footer className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-[9px] uppercase tracking-[0.16em] text-white/40 sm:px-10" style={{ backgroundColor: p.deep }}>
      <span>© {new Date().getFullYear()} {draft.businessName}</span>
      <span>Izrađeno uz DiV.ai</span>
    </footer>
  </div>;
}
