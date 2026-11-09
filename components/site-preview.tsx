'use client';

import { FormEvent, useState } from 'react';

export type BookingType = 'appointment' | 'reservation' | 'group' | 'consultation' | 'quote';
export type BlockId = 'hero' | 'about' | 'services' | 'gallery' | 'reviews' | 'faq' | 'hours' | 'booking' | 'map' | 'contact';

type Service = { name: string; description: string; price: string };
type Review = { name: string; text: string; rating: number };
type Faq = { question: string; answer: string };
type GalleryItem = { label: string; emoji: string };
type DayAvailability = { open: boolean; start: string; end: string };

export type Availability = {
  week: DayAvailability[];
  slotMinutes: number;
  bufferMinutes: number;
  blockedDates: string[];
};

export type Booking = {
  id: string;
  businessName: string;
  clientName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  siteId?: string | null;
};

export type SiteDraft = {
  templateId: string;
  categoryId: string;
  bookingType: BookingType;
  icon: string;
  businessName: string;
  businessType?: string;
  slug: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  hours: { weekdays: string; saturday: string; sunday: string };
  accentColor: string;
  services: Service[];
  reviews: Review[];
  faq: Faq[];
  gallery: GalleryItem[];
  visibleBlocks: BlockId[];
  availability: Availability;
};

const WEEKDAY_LABELS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
const WEEKDAY_FULL = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const MONTH_NAMES = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];

const bookingCopy: Record<BookingType, { nav: string; hero: string; section: string; submit: string; service: string }> = {
  appointment: { nav: 'Zakaži termin', hero: 'Zakažite svoj termin', section: 'Nekoliko klikova do vašeg termina', submit: 'Pošalji zahtev za termin', service: 'Usluga' },
  reservation: { nav: 'Rezerviši', hero: 'Rezervišite svoj termin', section: 'Rezervišite sto ili termin', submit: 'Pošalji rezervaciju', service: 'Vrsta rezervacije' },
  group: { nav: 'Prijavi se', hero: 'Rezervišite svoje mesto', section: 'Osigurajte mesto na vreme', submit: 'Pošalji prijavu', service: 'Aktivnost / čas' },
  consultation: { nav: 'Zakaži konsultaciju', hero: 'Zakažite konsultaciju', section: 'Razgovor ili sastanak po vašoj meri', submit: 'Zakaži konsultaciju', service: 'Tema konsultacije' },
  quote: { nav: 'Pošalji upit', hero: 'Zatražite ponudu', section: 'Opišite potrebu, javićemo se', submit: 'Pošalji upit', service: 'Vrsta usluge' },
};

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function weekdayIndexOf(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function minutesFromTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function timeFromMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function slotsForDate(date: Date, availability: Availability, bookedTimes: string[]): string[] {
  const day = availability.week[weekdayIndexOf(date)];
  if (!day?.open) return [];
  const start = minutesFromTime(day.start);
  const end = minutesFromTime(day.end);
  const step = availability.slotMinutes + availability.bufferMinutes;
  if (step <= 0 || end <= start) return [];
  const slots: string[] = [];
  for (let cursor = start; cursor + availability.slotMinutes <= end; cursor += step) {
    const value = timeFromMinutes(cursor);
    if (!bookedTimes.includes(value)) slots.push(value);
  }
  return slots;
}

export function SitePreview({ draft, onBooking, bookingMessage, bookings, variant = 'preview' }: { draft: SiteDraft; onBooking: (event: FormEvent<HTMLFormElement>) => void; bookingMessage: string; bookings: Booking[]; variant?: 'preview' | 'page' }) {
  const visible = (id: BlockId) => draft.visibleBlocks.includes(id);
  const copy = bookingCopy[draft.bookingType];
  const isQuote = draft.bookingType === 'quote';

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const todayIso = toISODate(new Date());
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const bookedTimes = selectedDate ? bookings.filter((booking) => booking.date === selectedDate).map((booking) => booking.time) : [];
  const availableSlots = selectedDate
    ? slotsForDate(parseISODate(selectedDate), draft.availability, bookedTimes)
        .filter((slot) => selectedDate !== todayIso || minutesFromTime(slot) > nowMinutes)
    : [];

  const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const leadingBlanks = weekdayIndexOf(monthStart);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));

  const isDayAvailable = (date: Date) => {
    const iso = toISODate(date);
    if (iso < todayIso) return false;
    if (draft.availability.blockedDates.includes(iso)) return false;
    if (!(draft.availability.week[weekdayIndexOf(date)]?.open ?? false)) return false;
    const dayBooked = bookings.filter((booking) => booking.date === iso).map((booking) => booking.time);
    const slots = slotsForDate(date, draft.availability, dayBooked);
    return (iso === todayIso ? slots.filter((slot) => minutesFromTime(slot) > nowMinutes) : slots).length > 0;
  };

  const changeMonth = (delta: number) => {
    setMonthCursor(new Date(year, month + delta, 1));
    setSelectedDate('');
    setSelectedTime('');
  };

  const selectedDateValue = selectedDate ? parseISODate(selectedDate) : null;
  const selectedDateLabel = selectedDateValue
    ? `${WEEKDAY_FULL[weekdayIndexOf(selectedDateValue)]}, ${selectedDateValue.getDate()}. ${MONTH_NAMES[selectedDateValue.getMonth()]}`
    : '';

  const wrapperClass = variant === 'page'
    ? 'mx-auto min-h-screen w-full bg-white'
    : 'mx-auto min-h-[740px] max-w-[980px] overflow-hidden rounded-2xl bg-white shadow-lg';

  return <div className={wrapperClass} style={{ '--site-accent': draft.accentColor } as React.CSSProperties}>
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 sm:px-8">
      <a href="#site-top" className="max-w-[60%] truncate text-sm font-black tracking-tight">{draft.businessName || 'Naziv vašeg biznisa'}</a>
      <nav className="hidden items-center gap-5 text-[10px] font-semibold text-slate-500 sm:flex">
        {visible('services') && <a href="#site-services" className="hover:text-slate-900">Usluge</a>}
        {visible('about') && <a href="#site-about" className="hover:text-slate-900">O nama</a>}
        {visible('reviews') && <a href="#site-reviews" className="hover:text-slate-900">Recenzije</a>}
        {visible('contact') && <a href="#site-contact" className="hover:text-slate-900">Kontakt</a>}
      </nav>
      {visible('booking') && <a href="#site-booking" className="rounded-full px-3 py-2 text-[9px] font-bold text-white" style={{ backgroundColor: draft.accentColor }}>{copy.nav}</a>}
    </div>

    {visible('hero') && <section id="site-top" className="relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20" style={{ background: `linear-gradient(135deg, ${draft.accentColor}1c 0%, #ffffff 75%)` }}>
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em]" style={{ color: draft.accentColor, backgroundColor: `${draft.accentColor}12` }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: draft.accentColor }} />{draft.icon} {draft.businessName}</span>
      <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{draft.tagline || 'Vaša poruka dobrodošlice'}</h1>
      <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-600 sm:text-sm">{draft.description}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">{visible('booking') && <a href="#site-booking" className="rounded-full px-5 py-3 text-[10px] font-bold text-white" style={{ backgroundColor: draft.accentColor }}>{copy.hero} <span aria-hidden="true">→</span></a>}{visible('services') && <a href="#site-services" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-[10px] font-bold text-slate-700">Pogledaj usluge</a>}</div>
      <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: draft.accentColor }} />
    </section>}

    {visible('about') && <section id="site-about" className="grid gap-6 px-6 py-9 sm:grid-cols-[0.8fr_1.2fr] sm:px-12 sm:py-12">
      <div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Upoznajte nas</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Dobro došli u {draft.businessName}.</h2></div>
      <div><p className="text-xs leading-6 text-slate-600 sm:text-sm">{draft.description}</p><a href="#site-contact" className="mt-3 inline-block text-[10px] font-bold" style={{ color: draft.accentColor }}>Saznajte više <span aria-hidden="true">→</span></a></div>
    </section>}

    {visible('services') && <section id="site-services" className="bg-[#fafafa] px-6 py-9 sm:px-12 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Šta nudimo</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Naše usluge</h2></div><span className="text-[10px] text-slate-400">Kvalitet i pažnja u svakom detalju</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{draft.services.map((service, index) => <article key={`${service.name}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black" style={{ color: draft.accentColor, backgroundColor: `${draft.accentColor}12` }}>0{index + 1}</span><h3 className="mt-3 text-xs font-black sm:text-sm">{service.name || 'Naziv usluge'}</h3><p className="mt-1.5 min-h-9 text-[10px] leading-5 text-slate-500">{service.description}</p><p className="mt-3 text-[10px] font-extrabold" style={{ color: draft.accentColor }}>{service.price}</p></article>)}</div>
    </section>}

    {visible('gallery') && <section className="px-6 py-9 sm:px-12 sm:py-12">
      <div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Naš rad</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Galerija</h2></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{draft.gallery.map((item, index) => <div key={`${item.label}-${index}`} className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100" style={{ backgroundColor: `${draft.accentColor}0c` }}><span className="text-3xl">{item.emoji}</span><span className="text-[10px] font-bold text-slate-600">{item.label}</span></div>)}</div>
    </section>}

    {visible('reviews') && <section id="site-reviews" className="bg-[#fafafa] px-6 py-9 sm:px-12 sm:py-12">
      <div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Šta kažu klijenti</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Recenzije</h2></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{draft.reviews.map((review, index) => <article key={`${review.name}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="text-xs tracking-widest" style={{ color: draft.accentColor }}>{'★'.repeat(review.rating)}</div><p className="mt-2 text-[10px] leading-5 text-slate-600">{review.text}</p><p className="mt-3 text-[10px] font-black text-slate-800">{review.name}</p></article>)}</div>
    </section>}

    {visible('faq') && <section className="px-6 py-9 sm:px-12 sm:py-12">
      <div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Najčešća pitanja</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Česta pitanja</h2></div>
      <div className="mt-5 space-y-2">{draft.faq.map((item, index) => <details key={`${item.question}-${index}`} className="group rounded-2xl border border-slate-100 bg-white p-4"><summary className="cursor-pointer text-xs font-bold text-slate-800">{item.question}</summary><p className="mt-2 text-[10px] leading-5 text-slate-500">{item.answer}</p></details>)}</div>
    </section>}

    {visible('hours') && <section className="grid gap-5 px-6 py-9 sm:grid-cols-2 sm:px-12 sm:py-11">
      <div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Planirajte posetu</p><h2 className="mt-2 text-xl font-black tracking-tight">Radno vreme</h2><p className="mt-2 text-[10px] leading-5 text-slate-500">Pozovite nas ukoliko vam je potreban termin van redovnog radnog vremena.</p></div>
      <div className="space-y-2 rounded-2xl bg-[#fafafa] p-4 text-[10px]"><HoursRow day="Ponedeljak – petak" time={draft.hours.weekdays} /><HoursRow day="Subota" time={draft.hours.saturday} /><HoursRow day="Nedelja" time={draft.hours.sunday} /></div>
    </section>}

    {visible('booking') && <section id="site-booking" className="px-6 py-9 sm:px-12 sm:py-12" style={{ background: `linear-gradient(145deg, ${draft.accentColor}0c, #fff 55%)` }}>
      <div className="mx-auto max-w-2xl text-center"><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>{copy.section}</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{copy.hero}</h2><p className="mt-2 text-[10px] leading-5 text-slate-500">Popunite formu, a naš tim će vas kontaktirati radi potvrde.</p></div>
      <form onSubmit={onBooking} className="mx-auto mt-5 grid max-w-2xl gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5">
        <PreviewInput label="Ime i prezime" name="clientName" placeholder="Vaše ime" required />
        <PreviewInput label="Broj telefona" name="clientPhone" placeholder="06x xxx xxxx" required type="tel" />
        <label className="block text-[9px] font-bold text-slate-600">{copy.service}<select name="service" required defaultValue="" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium outline-none focus:border-indigo-400"><option value="" disabled>Izaberite</option>{draft.services.map((service, index) => <option key={`${service.name}-${index}`} value={service.name}>{service.name}</option>)}</select></label>
        {!isQuote ? (
          <>
            <input type="hidden" name="date" value={selectedDate} />
            <input type="hidden" name="time" value={selectedTime} />
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:col-span-2 sm:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <button type="button" aria-label="Prethodni mesec" onClick={() => changeMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-100">‹</button>
                  <p className="text-[11px] font-black capitalize text-slate-800">{MONTH_NAMES[month]} {year}.</p>
                  <button type="button" aria-label="Sledeći mesec" onClick={() => changeMonth(1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-100">›</button>
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  {WEEKDAY_LABELS.map((label) => <span key={label}>{label}</span>)}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {Array.from({ length: leadingBlanks }, (_, index) => <span key={`blank-${index}`} />)}
                  {days.map((date) => {
                    const iso = toISODate(date);
                    const available = isDayAvailable(date);
                    const selected = iso === selectedDate;
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={!available}
                        aria-label={`${date.getDate()}. ${MONTH_NAMES[month]}${available ? '' : ' – nedostupno'}`}
                        aria-pressed={selected}
                        onClick={() => { setSelectedDate(iso); setSelectedTime(''); }}
                        className={`aspect-square rounded-lg text-[10px] font-bold transition ${selected ? 'text-white' : available ? 'text-slate-700 hover:bg-slate-100' : 'cursor-not-allowed text-slate-300'}`}
                        style={selected ? { backgroundColor: draft.accentColor } : undefined}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[8px] leading-4 text-slate-400">Sivi datumi su nedostupni ili već prošli.</p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Slobodni termini</p>
                {!selectedDate ? (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-6 text-center text-[10px] leading-5 text-slate-500">Izaberite datum u kalendaru da vidite slobodne termine.</p>
                ) : (
                  <>
                    <p className="mt-1 text-[11px] font-black text-slate-800">{selectedDateLabel}</p>
                    {availableSlots.length === 0 ? (
                      <p className="mt-2 rounded-lg bg-rose-50 px-3 py-4 text-center text-[10px] font-semibold leading-5 text-rose-700">Nema slobodnih termina za izabrani dan. Probajte drugi datum.</p>
                    ) : (
                      <div className="mt-2 grid max-h-[190px] grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                        {availableSlots.map((slot) => {
                          const active = slot === selectedTime;
                          return (
                            <button
                              key={slot}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setSelectedTime(slot)}
                              className={`rounded-lg border px-1 py-2 text-[10px] font-bold transition ${active ? 'border-transparent text-white' : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                              style={active ? { backgroundColor: draft.accentColor } : undefined}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <PreviewInput label="Napomena" name="time" placeholder="Kratak opis potrebe" />
        )}
        <button type="submit" disabled={!isQuote && (!selectedDate || !selectedTime)} className="rounded-xl px-4 py-3 text-xs font-extrabold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2" style={{ backgroundColor: draft.accentColor }}>{copy.submit} <span aria-hidden="true">→</span></button>
        {bookingMessage && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold leading-5 text-emerald-800 sm:col-span-2">{bookingMessage}</p>}
      </form>
    </section>}

    {visible('map') && <section className="px-6 py-9 sm:px-12 sm:py-11">
      <div className="grid gap-5 sm:grid-cols-2 sm:items-center"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Gde se nalazimo</p><h2 className="mt-2 text-xl font-black tracking-tight">Nađite nas na mapi</h2><p className="mt-2 text-[10px] leading-5 text-slate-500">{draft.address}</p></div><div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-slate-100 bg-[#fafafa]"><div className="text-center"><span className="text-2xl">📍</span><p className="mt-2 text-[10px] font-bold text-slate-500">{draft.address}</p></div></div></div>
    </section>}

    {visible('contact') && <section id="site-contact" className="border-t border-slate-100 px-6 py-8 sm:px-12">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Tu smo za vas</p><h2 className="mt-1 text-lg font-black">Posetite nas ili pozovite.</h2><p className="mt-1 text-[10px] text-slate-500">{draft.address}</p></div><div className="flex flex-wrap gap-2"><a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="rounded-xl px-4 py-2.5 text-[10px] font-bold text-white" style={{ backgroundColor: draft.accentColor }}>Pozovi {draft.phone}</a><a href={`mailto:${draft.email}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-bold text-slate-700">Pošalji email</a></div></div>
    </section>}

    <footer className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-6 py-4 text-[9px] text-slate-400 sm:px-12"><span>© {new Date().getFullYear()} {draft.businessName}. Sva prava zadržana.</span><span>Izrađeno uz DiV.ai</span></footer>
  </div>;
}

function PreviewInput({ label, name, placeholder, type = 'text', required = false }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="block text-left text-[9px] font-bold text-slate-600">{label}<input name={name} type={type} placeholder={placeholder} required={required} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none transition placeholder:text-slate-300 focus:border-indigo-400" /></label>;
}

function HoursRow({ day, time }: { day: string; time: string }) {
  return <div className="flex justify-between gap-3 border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0"><span className="text-slate-600">{day}</span><span className="font-bold text-slate-800">{time}</span></div>;
}
