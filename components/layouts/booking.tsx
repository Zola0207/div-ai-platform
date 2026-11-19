import BookingForm from '../blocks/booking-form';
import { HoursRow, LogoMark } from '../blocks/site-parts';
import { GalleryPlaceholder, SiteImage } from '../blocks/site-image';
import { SiteIcon, siteIconFor } from '../blocks/site-icons';
import {
  averageRating,
  bookingCopy,
  durationLabel,
  mapsEmbedLink,
  mapsSearchLink,
  paletteOf,
  whatsappLink,
  type LayoutProps,
} from '../blocks/site-types';

// Termin — kalendar je prvi i stoji odmah uz naslov, jer je zakazivanje
// glavna radnja na sajtu. Ispod ide miran, uredan raspored sa koracima.
// Za salone, ordinacije, masaže, veterinare, nutricioniste, frizere za pse.
export default function BookingLayout({ draft, bookings, onBooking, bookingMessage, variant = 'preview' }: LayoutProps) {
  const visible = (id: (typeof draft.visibleBlocks)[number]) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const waLink = whatsappLink(draft.phone, `Zdravo, zanima me termin u ${draft.businessName}.`);
  const rating = averageRating(draft.reviews);
  const tel = `tel:${draft.phone.replace(/[^+\d]/g, '')}`;
  const p = paletteOf(draft.accentColor);
  const icon = siteIconFor(draft);

  // Forma živi u herou. Ako je hero isključen, dobija svoju sekciju — ali
  // nikad obe, da `#site-booking` uvek vodi na jedno mesto.
  const formInHero = visible('booking') && visible('hero');

  const steps = [
    { title: 'Izaberite uslugu', text: 'Vidite cenu i trajanje pre zakazivanja.' },
    { title: 'Izaberite termin', text: 'Kalendar prikazuje samo stvarno slobodne termine.' },
    { title: 'Potvrda', text: 'Zovemo vas da potvrdimo dolazak.' },
  ];

  const wrapperClass = variant === 'page'
    ? 'site-font mx-auto min-h-screen w-full'
    : 'site-font mx-auto min-h-[740px] max-w-[980px] overflow-hidden shadow-lg';

  return <div className={wrapperClass} style={{ '--site-accent': p.accent, '--site-sans': 'var(--font-manrope)', backgroundColor: p.tint } as React.CSSProperties}>
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-6 py-4 sm:px-9">
        <a href="#site-top" className="flex min-w-0 items-center gap-2.5">
          <LogoMark draft={draft} rounded="rounded-xl" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-black tracking-tight text-slate-950">{draft.businessName || 'Naziv vašeg biznisa'}</span>
            {draft.businessType && <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">{draft.businessType}</span>}
          </span>
        </a>
        <nav className="hidden items-center gap-5 text-[10px] font-bold text-slate-500 sm:flex">
          {visible('services') && <a href="#site-services" className="transition hover:text-slate-950">Usluge i cene</a>}
          {visible('reviews') && <a href="#site-reviews" className="transition hover:text-slate-950">Recenzije</a>}
          {visible('contact') && <a href="#site-contact" className="transition hover:text-slate-950">Kontakt</a>}
        </nav>
        <a href={tel} className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black text-slate-700 transition hover:border-slate-400">
          {draft.phone}
        </a>
      </div>
    </header>

    {visible('hero') && <section id="site-top" className="border-b border-slate-200 bg-white">
      <div className="grid gap-6 px-6 py-8 sm:grid-cols-[0.78fr_1.22fr] sm:items-center sm:gap-8 sm:px-9 sm:py-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: p.accent, backgroundColor: p.tint }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.accent }} />
            <SiteIcon name={icon} className="h-3 w-3" /> {visible('booking') ? 'Zakazivanje online' : draft.businessType || 'Dobrodošli'}
          </p>
          <h1 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-[40px]">{draft.tagline || 'Vaša poruka dobrodošlice'}</h1>
          <p className="mt-3 max-w-md text-xs leading-6 text-slate-600">{draft.description}</p>

          <ul className="mt-5 grid gap-2 text-[10px]">
            <li className="flex items-center gap-2">
              <SiteIcon name="check" className="h-3 w-3 shrink-0" style={{ color: p.accent }} />
              <span className="text-slate-600">Slobodni termini se ažuriraju u realnom vremenu</span>
            </li>
            <li className="flex items-center gap-2">
              <SiteIcon name="check" className="h-3 w-3 shrink-0" style={{ color: p.accent }} />
              <span className="text-slate-600">Zakazivanje traje manje od minute</span>
            </li>
            <li className="flex items-center gap-2">
              <SiteIcon name="check" className="h-3 w-3 shrink-0" style={{ color: p.accent }} />
              <span className="text-slate-600">{draft.hours.weekdays} · {draft.address}</span>
            </li>
          </ul>

          {rating && (
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <span style={{ color: draft.accentColor }}>{'★'.repeat(Math.round(rating))}</span> {rating.toFixed(1).replace('.', ',')} · {draft.reviews.length} recenzija
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <a href={tel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-700 transition hover:border-slate-400">Pozovi</a>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2.5 text-[10px] font-black text-[#128C7E]">WhatsApp</a>}
          </div>
        </div>

        <div id={formInHero ? 'site-booking' : undefined} className="rounded-2xl border border-slate-200 p-3 shadow-sm sm:p-4" style={{ backgroundColor: p.tint }}>
          {formInHero ? (
            <>
              <div className="mb-3 flex items-end justify-between gap-2 px-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>{copy.section}</p>
                  <p className="mt-0.5 text-sm font-black tracking-tight text-slate-950">{copy.hero}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400 ring-1 ring-slate-200">1 min</span>
              </div>
              <BookingForm
                draft={draft}
                bookings={bookings}
                onBooking={onBooking}
                bookingMessage={bookingMessage}
                theme="light"
              />
            </>
          ) : (
            <div className="p-2">
              <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>Kontakt</p>
              <a href={tel} className="mt-1 block text-xl font-black tracking-tight text-slate-950">{draft.phone}</a>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">{draft.address}</p>
              <div className="mt-3 text-[10px]">
                <HoursRow day="Ponedeljak – petak" time={draft.hours.weekdays} />
                <HoursRow day="Subota" time={draft.hours.saturday} />
                <HoursRow day="Nedelja" time={draft.hours.sunday} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>}

    {visible('services') && (
      <section id="site-services" className="border-b border-slate-200">
        <div className="px-6 py-9 sm:px-9 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>Usluge i cene</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Izaberite šta vam treba</h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Trajanje je naznačeno</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {draft.services.map((service, index) => (
              <article key={`${service.name}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[13px] font-black text-slate-950">{service.name || 'Naziv usluge'}</h3>
                  <span className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-black" style={{ color: draft.accentColor, backgroundColor: `${draft.accentColor}12` }}>{service.price}</span>
                </div>
                <p className="mt-1.5 text-[10px] leading-5 text-slate-500">{service.description}</p>
                <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {(service.durationMinutes || service.durationDays)
                    ? `Trajanje · ${durationLabel({ days: service.durationDays ?? 0, minutes: service.durationMinutes ?? 0 })}`
                    : 'Trajanje po dogovoru'}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )}

    {visible('about') && (
      <section id="site-about" className="border-b border-slate-200 bg-white">
        <div className="grid gap-4 px-6 py-9 sm:grid-cols-[0.45fr_1.55fr] sm:px-9">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">O nama</p>
          <div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">{draft.description}</p>
            <a href="#site-contact" className="mt-3 inline-block text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: draft.accentColor }}>
              Kako do nas <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    )}

    <section className="border-b border-slate-200">
      <div className="px-6 py-9 sm:px-9 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>Kako funkcioniše</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Tri koraka do termina</h2>
          </div>
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ backgroundColor: draft.accentColor }}>{index + 1}</span>
              <h3 className="mt-3 text-[12px] font-black text-slate-950">{step.title}</h3>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {visible('gallery') && (
      <section className="border-b border-slate-200 bg-white">
        <div className="px-6 py-9 sm:px-9">
          <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>Naš prostor</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Galerija</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {draft.gallery.map((item, index) => (
              <figure key={`${item.label}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-100" style={{ backgroundColor: p.tint }}>
                <SiteImage src={item.imageUrl} alt={item.label} className="h-full w-full object-cover" fallback={<GalleryPlaceholder label={item.label} icon={icon} accent={p.accent} showLabel />} />
                {item.imageUrl && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[9px] font-bold text-white">{item.label}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      </section>
    )}

    {visible('reviews') && (
      <section id="site-reviews" className="border-b border-slate-200">
        <div className="px-6 py-9 sm:px-9">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-950">Recenzije klijenata</h2>
            {rating && <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"><span style={{ color: draft.accentColor }}>{'★'.repeat(Math.round(rating))}</span> {rating.toFixed(1).replace('.', ',')} / 5</span>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {draft.reviews.map((review, index) => (
              <article key={`${review.name}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] tracking-[0.2em]" style={{ color: draft.accentColor }}>{'★'.repeat(review.rating)}</p>
                <p className="mt-2 text-[11px] leading-5 text-slate-600">{review.text}</p>
                <p className="mt-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">{review.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )}

    {visible('faq') && (
      <section className="border-b border-slate-200 bg-white">
        <div className="grid gap-4 px-6 py-9 sm:grid-cols-[0.45fr_1.55fr] sm:px-9">
          <h2 className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Česta pitanja</h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {draft.faq.map((item, index) => (
              <details key={`${item.question}-${index}`} className="group py-3">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-[12px] font-black text-slate-900">
                  {item.question}
                  <span className="text-slate-300 transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-1.5 max-w-xl text-[10px] leading-5 text-slate-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )}

    {visible('hours') && (
      <section className="border-b border-slate-200">
        <div className="grid gap-4 px-6 py-9 sm:grid-cols-2 sm:px-9">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>Radno vreme</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kada možete doći</h2>
            <p className="mt-2 max-w-xs text-[11px] leading-5 text-slate-500">Termin van radnog vremena dogovaramo telefonom.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-[10px]">
            <HoursRow day="Ponedeljak – petak" time={draft.hours.weekdays} />
            <HoursRow day="Subota" time={draft.hours.saturday} />
            <HoursRow day="Nedelja" time={draft.hours.sunday} />
          </div>
        </div>
      </section>
    )}

    {visible('booking') && !formInHero && (
      <section id="site-booking" className="border-b border-slate-200 bg-white">
        <div className="px-6 py-9 sm:px-9">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: draft.accentColor }}>{copy.section}</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{copy.hero}</h2>
          </div>
          <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-slate-200 p-3 shadow-sm sm:p-4" style={{ backgroundColor: p.tint }}>
            <BookingForm
              draft={draft}
              bookings={bookings}
              onBooking={onBooking}
              bookingMessage={bookingMessage}
              waLink={waLink}
              theme="light"
            />
          </div>
        </div>
      </section>
    )}

    {visible('map') && (
      <section className="border-b border-slate-200 bg-white">
        <div className="grid gap-4 px-6 py-9 sm:grid-cols-[0.45fr_1.55fr] sm:items-center sm:px-9">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Lokacija</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-600">{draft.address || 'Unesite adresu da bi se prikazala mapa.'}</p>
            {draft.address && (
              <a href={mapsSearchLink(draft.address)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: draft.accentColor }}>
                Otvori u Google mapama <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          {draft.address ? (
            <iframe title={`Mapa — ${draft.businessName}`} src={mapsEmbedLink(draft.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[220px] w-full rounded-2xl border border-slate-200" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-slate-200 text-[10px] text-slate-400">Bez adrese nema mape</div>
          )}
        </div>
      </section>
    )}

    {visible('contact') && (
      <section id="site-contact" style={{ backgroundColor: p.deep, color: p.onDeep }}>
        <div className="grid gap-5 px-6 py-9 sm:grid-cols-[1.3fr_0.7fr] sm:items-end sm:px-9">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-60">Kontakt</p>
            <h2 className="mt-1 text-xl font-black tracking-tight">Posetite nas ili pozovite.</h2>
            <a href={tel} className="mt-2 inline-block text-xl font-black tracking-tight transition hover:opacity-80">{draft.phone}</a>
            <p className="mt-1 text-[11px] opacity-60">{draft.address} · {draft.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={tel} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black" style={{ color: p.deep }}>
              <SiteIcon name="phone" className="h-3 w-3" /> Pozovi
            </a>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="rounded-xl bg-[#25D366] px-4 py-2.5 text-[10px] font-black text-white">WhatsApp</a>}
            <a href={`mailto:${draft.email}`} className="rounded-xl px-4 py-2.5 text-[10px] font-black" style={{ boxShadow: `inset 0 0 0 1px ${p.onDeep}33` }}>Email</a>
          </div>
        </div>
      </section>
    )}

    <footer className="flex flex-wrap items-center justify-between gap-2 px-6 py-5 text-[9px] font-bold uppercase tracking-[0.14em] sm:px-9" style={{ backgroundColor: p.deep, color: `${p.onDeep}66` }}>
      <span>© {new Date().getFullYear()} {draft.businessName}</span>
      <span>DiV.ai</span>
    </footer>
  </div>;
}
