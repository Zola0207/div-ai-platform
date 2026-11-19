import BookingForm from '../blocks/booking-form';
import { HoursRow, LogoMark } from '../blocks/site-parts';
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

// Klasičan dizajn — čist, centriran, sa karticama.
export default function ClassicLayout({ draft, bookings, onBooking, bookingMessage, variant = 'preview' }: LayoutProps) {
  const visible = (id: (typeof draft.visibleBlocks)[number]) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const waLink = whatsappLink(draft.phone, `Zdravo, zanima me termin u ${draft.businessName}.`);
  const p = paletteOf(draft.accentColor);
  const icon = siteIconFor(draft);

  const wrapperClass = variant === 'page'
    ? 'site-font mx-auto min-h-screen w-full bg-white'
    : 'site-font mx-auto min-h-[740px] max-w-[980px] overflow-hidden rounded-2xl bg-white shadow-lg';

  return <div className={wrapperClass} style={{ '--site-accent': p.accent } as React.CSSProperties}>
    <div className="flex items-center justify-between border-b px-5 py-3 sm:px-8" style={{ borderColor: p.line }}>
      <a href="#site-top" className="flex max-w-[60%] items-center gap-2 truncate text-sm font-black tracking-tight">
        <LogoMark draft={draft} />
        <span className="truncate">{draft.businessName || 'Naziv vašeg biznisa'}</span>
      </a>
      <nav className="hidden items-center gap-5 text-[10px] font-semibold text-slate-500 sm:flex">
        {visible('services') && <a href="#site-services" className="transition hover:text-slate-900">Usluge</a>}
        {visible('about') && <a href="#site-about" className="transition hover:text-slate-900">O nama</a>}
        {visible('reviews') && <a href="#site-reviews" className="transition hover:text-slate-900">Recenzije</a>}
        {visible('contact') && <a href="#site-contact" className="transition hover:text-slate-900">Kontakt</a>}
      </nav>
      {visible('booking') && <a href="#site-booking" className="rounded-full px-3 py-2 text-[9px] font-bold text-white" style={{ backgroundColor: p.accent, color: p.onAccent }}>{copy.nav}</a>}
    </div>

    {visible('hero') && <section id="site-top" className="relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20" style={{ background: draft.heroImageUrl ? `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.94)), url(${draft.heroImageUrl}) center/cover no-repeat` : `linear-gradient(135deg, ${p.wash} 0%, #ffffff 72%)` }}>
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em]" style={{ color: p.accent, backgroundColor: p.tint }}>
        <SiteIcon name={icon} className="h-3 w-3" />
        {draft.businessName}
      </span>
      <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{draft.tagline || 'Vaša poruka dobrodošlice'}</h1>
      <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-600 sm:text-sm">{draft.description}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {visible('booking') && <a href="#site-booking" className="inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-[10px] font-bold shadow-sm transition hover:opacity-90" style={{ backgroundColor: p.accent, color: p.onAccent }}>{copy.hero} <SiteIcon name="arrowRight" className="h-3 w-3" /></a>}
        {visible('services') && <a href="#site-services" className="rounded-full border bg-white px-5 py-3 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50" style={{ borderColor: p.line }}>Pogledaj usluge</a>}
      </div>
      <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full blur-3xl" style={{ backgroundColor: p.soft, opacity: 0.35 }} />
    </section>}

    {visible('about') && <section id="site-about" className="grid gap-6 px-6 py-9 sm:grid-cols-[0.8fr_1.2fr] sm:px-12 sm:py-12">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>Upoznajte nas</p>
        <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Dobro došli u {draft.businessName}.</h2>
      </div>
      <div>
        <p className="text-xs leading-6 text-slate-600 sm:text-sm">{draft.description}</p>
        <a href="#site-contact" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: p.accent }}>Saznajte više <SiteIcon name="arrowRight" className="h-3 w-3" /></a>
      </div>
    </section>}

    {visible('services') && <section id="site-services" className="px-6 py-9 sm:px-12 sm:py-12" style={{ backgroundColor: p.wash }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>Šta nudimo</p>
          <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Naše usluge</h2>
        </div>
        <span className="text-[10px] text-slate-500">Kvalitet i pažnja u svakom detalju</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{draft.services.map((service, index) => <article key={`${service.name}-${index}`} className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: p.line }}><span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black" style={{ color: p.accent, backgroundColor: p.tint }}>0{index + 1}</span><h3 className="mt-3 text-xs font-black sm:text-sm">{service.name || 'Naziv usluge'}</h3><p className="mt-1.5 min-h-9 text-[10px] leading-5 text-slate-500">{service.description}</p><p className="mt-3 text-[10px] font-extrabold" style={{ color: p.accent }}>{service.price}</p>{(service.durationMinutes || service.durationDays) ? <p className="mt-1 text-[9px] font-semibold text-slate-400">Trajanje: {durationLabel({ days: service.durationDays ?? 0, minutes: service.durationMinutes ?? 0 })}</p> : null}</article>)}</div>
    </section>}

    {visible('gallery') && <section className="px-6 py-9 sm:px-12 sm:py-12">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>Naš rad</p>
        <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Galerija</h2>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{draft.gallery.map((item, index) => <div key={`${item.label}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border" style={{ backgroundColor: p.tint, borderColor: p.line }}><SiteImage src={item.imageUrl} alt={item.label} className="h-full w-full object-cover" fallback={<GalleryPlaceholder label={item.label} icon={icon} accent={p.accent} showLabel />} />{item.imageUrl && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-[10px] font-bold text-white">{item.label}</span>}</div>)}</div>
    </section>}

    {visible('reviews') && <section id="site-reviews" className="px-6 py-9 sm:px-12 sm:py-12" style={{ backgroundColor: p.wash }}>
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>Šta kažu klijenti</p>
        <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Recenzije</h2>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{draft.reviews.map((review, index) => <article key={`${review.name}-${index}`} className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: p.line }}><div className="text-xs tracking-widest" style={{ color: p.accent }}>{'★'.repeat(review.rating)}</div><p className="mt-2 text-[10px] leading-5 text-slate-600">{review.text}</p><p className="mt-3 text-[10px] font-black text-slate-800">{review.name}</p></article>)}</div>
    </section>}

    {visible('faq') && <section className="px-6 py-9 sm:px-12 sm:py-12">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>Najčešća pitanja</p>
        <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Česta pitanja</h2>
      </div>
      <div className="mt-5 space-y-2">{draft.faq.map((item, index) => <details key={`${item.question}-${index}`} className="group rounded-2xl border bg-white p-4" style={{ borderColor: p.line }}><summary className="cursor-pointer text-xs font-bold text-slate-800">{item.question}</summary><p className="mt-2 text-[10px] leading-5 text-slate-500">{item.answer}</p></details>)}</div>
    </section>}

    {visible('hours') && <section className="grid gap-5 px-6 py-9 sm:grid-cols-2 sm:px-12 sm:py-11">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>Planirajte posetu</p>
        <h2 className="mt-2 text-xl font-black tracking-tight">Radno vreme</h2>
        <p className="mt-2 text-[10px] leading-5 text-slate-500">Pozovite nas ukoliko vam je potreban termin van redovnog radnog vremena.</p>
      </div>
      <div className="space-y-2 rounded-2xl p-4 text-[10px]" style={{ backgroundColor: p.tint }}>
        <HoursRow day="Ponedeljak – petak" time={draft.hours.weekdays} />
        <HoursRow day="Subota" time={draft.hours.saturday} />
        <HoursRow day="Nedelja" time={draft.hours.sunday} />
      </div>
    </section>}

    {visible('booking') && <section id="site-booking" className="px-6 py-9 sm:px-12 sm:py-12" style={{ background: `linear-gradient(145deg, ${p.wash}, #ffffff 60%)` }}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>{copy.section}</p>
        <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{copy.hero}</h2>
        <p className="mt-2 text-[10px] leading-5 text-slate-500">Popunite formu, a naš tim će vas kontaktirati radi potvrde.</p>
      </div>
      <BookingForm
        draft={draft}
        bookings={bookings}
        onBooking={onBooking}
        bookingMessage={bookingMessage}
        waLink={waLink}
        theme="light"
        className="mx-auto mt-5 max-w-2xl"
      />
    </section>}

    {visible('map') && <section className="px-6 py-9 sm:px-12 sm:py-11">
      <div className="grid gap-5 sm:grid-cols-2 sm:items-center">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: p.accent }}>Gde se nalazimo</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">Nađite nas na mapi</h2>
          <p className="mt-2 text-[10px] leading-5 text-slate-500">{draft.address}</p>
          {draft.address && <a href={mapsSearchLink(draft.address)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: p.accent }}>Otvori u Google mapama <SiteIcon name="arrowRight" className="h-3 w-3" /></a>}
        </div>
        {draft.address ? (
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: p.line, backgroundColor: p.tint }}>
            <iframe title={`Mapa — ${draft.businessName}`} src={mapsEmbedLink(draft.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[240px] w-full border-0 sm:h-[265px]" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border" style={{ borderColor: p.line, backgroundColor: p.tint }}>
            <div className="text-center">
              <SiteIcon name="mapPin" className="mx-auto h-6 w-6" />
              <p className="mt-2 text-[10px] font-bold text-slate-500">Unesite adresu da bi se prikazala mapa</p>
            </div>
          </div>
        )}
      </div>
    </section>}

    {visible('contact') && <section id="site-contact" className="px-6 py-9 sm:px-12" style={{ backgroundColor: p.deep, color: p.onDeep }}>
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] opacity-60">Tu smo za vas</p>
          <h2 className="mt-1.5 text-lg font-black">Posetite nas ili pozovite.</h2>
          <p className="mt-1.5 text-[10px] opacity-60">{draft.address}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[10px] font-bold" style={{ color: p.deep }}>
            <SiteIcon name="phone" className="h-3 w-3" /> {draft.phone}
          </a>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="rounded-xl bg-[#25D366] px-4 py-2.5 text-[10px] font-bold text-white">WhatsApp</a>}
          <a href={`mailto:${draft.email}`} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[10px] font-bold" style={{ color: p.onDeep, boxShadow: `inset 0 0 0 1px ${p.onDeep}33` }}>
            <SiteIcon name="mail" className="h-3 w-3" /> Pošalji email
          </a>
        </div>
      </div>
    </section>}

    <footer className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-[9px] sm:px-12" style={{ backgroundColor: p.deep, color: `${p.onDeep}80`, borderTop: `1px solid ${p.onDeep}14` }}>
      <span>© {new Date().getFullYear()} {draft.businessName}. Sva prava zadržana.</span>
      <span>Izrađeno uz DiV.ai</span>
    </footer>
  </div>;
}
