'use client';

import { FormEvent, useState } from 'react';
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  bookingCopy,
  contrastText,
  durationLabel,
  minutesFromTime,
  parseISODate,
  serviceTiming,
  slotsForDate,
  toISODate,
  weekdayIndexOf,
  type Booking,
  type SiteDraft,
} from './site-types';

type Theme = 'light' | 'dark' | 'flat';

// Ista logika kalendara za sve dizajne — menjaju se samo okviri.
const themes: Record<Theme, Record<string, string>> = {
  light: {
    form: 'rounded-2xl border border-slate-100 bg-white p-4 shadow-sm',
    label: 'text-[9px] font-bold text-slate-600',
    input: 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium outline-none transition placeholder:text-slate-300 focus:border-indigo-400',
    panel: 'rounded-2xl border border-slate-100 bg-slate-50/70 p-3',
    card: 'rounded-xl bg-white p-3 shadow-sm',
    muted: 'text-[10px] font-semibold text-slate-500',
    strong: 'text-[11px] font-black capitalize text-slate-800',
    nav: 'flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-100',
    weekday: 'text-[8px] font-bold uppercase tracking-wide text-slate-400',
    day: 'aspect-square rounded-lg text-[10px] font-bold transition text-slate-700 hover:bg-slate-100',
    dayOff: 'aspect-square rounded-lg text-[10px] font-bold text-slate-300 cursor-not-allowed',
    slot: 'rounded-lg border px-1 py-2 text-[10px] font-bold transition border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    hint: 'text-[8px] leading-4 text-slate-400',
    empty: 'rounded-lg bg-slate-50 px-3 py-6 text-center text-[10px] leading-5 text-slate-500',
    warn: 'rounded-lg bg-rose-50 px-3 py-4 text-center text-[10px] font-semibold leading-5 text-rose-700',
    submit: 'rounded-xl px-4 py-3 text-xs font-extrabold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50',
    wa: 'text-[10px] font-bold text-[#128C7E] hover:underline',
    notice: 'rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold leading-5 text-emerald-800',
  },
  flat: {
    form: 'rounded-none border border-slate-200 bg-white p-5',
    label: 'text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400',
    input: 'mt-2 w-full rounded-none border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm font-medium outline-none transition placeholder:text-slate-300 focus:border-slate-900',
    panel: 'rounded-none border-y border-slate-200 bg-white p-0',
    card: 'rounded-none bg-white p-4',
    muted: 'text-[10px] font-semibold text-slate-500',
    strong: 'text-sm font-black capitalize text-slate-900',
    nav: 'flex h-7 w-7 items-center justify-center rounded-none border border-slate-300 text-xs font-bold text-slate-600 transition hover:bg-slate-900 hover:text-white',
    weekday: 'text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400',
    day: 'aspect-square rounded-none text-[10px] font-bold transition text-slate-700 hover:bg-slate-100',
    dayOff: 'aspect-square rounded-none text-[10px] font-bold text-slate-300 cursor-not-allowed',
    slot: 'rounded-none border px-1 py-2 text-[10px] font-bold transition border-slate-300 text-slate-700 hover:border-slate-900',
    hint: 'text-[8px] leading-4 text-slate-400',
    empty: 'px-3 py-6 text-center text-[10px] leading-5 text-slate-500',
    warn: 'px-3 py-4 text-center text-[10px] font-semibold leading-5 text-rose-700',
    submit: 'rounded-none px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50',
    wa: 'text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 hover:text-slate-900',
    notice: 'border-l-2 border-emerald-500 bg-emerald-50/60 px-3 py-2 text-[10px] font-semibold leading-5 text-emerald-800',
  },
  dark: {
    form: 'rounded-none border border-white/15 bg-white/[0.04] p-4 sm:p-5',
    label: 'text-[9px] font-bold uppercase tracking-[0.16em] text-white/50',
    input: 'mt-1.5 w-full rounded-none border border-white/20 bg-white/[0.06] px-3 py-2.5 text-xs font-medium text-white outline-none transition placeholder:text-white/30 focus:border-white/60',
    panel: 'rounded-none border border-white/15 bg-black/20 p-3',
    card: 'rounded-none bg-white/[0.04] p-3',
    muted: 'text-[10px] font-semibold text-white/50',
    strong: 'text-[11px] font-black capitalize text-white',
    nav: 'flex h-7 w-7 items-center justify-center rounded-none border border-white/25 text-xs font-bold text-white/70 transition hover:bg-white hover:text-slate-950',
    weekday: 'text-[8px] font-bold uppercase tracking-[0.14em] text-white/40',
    day: 'aspect-square rounded-none text-[10px] font-bold transition text-white/80 hover:bg-white/10',
    dayOff: 'aspect-square rounded-none text-[10px] font-bold text-white/20 cursor-not-allowed',
    slot: 'rounded-none border px-1 py-2 text-[10px] font-bold transition border-white/25 text-white/80 hover:border-white/60 hover:bg-white/10',
    hint: 'text-[8px] leading-4 text-white/35',
    empty: 'px-3 py-6 text-center text-[10px] leading-5 text-white/50',
    warn: 'px-3 py-4 text-center text-[10px] font-semibold leading-5 text-rose-300',
    submit: 'rounded-none px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40',
    wa: 'text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 hover:text-white',
    notice: 'border-l-2 border-emerald-400 bg-emerald-400/10 px-3 py-2 text-[10px] font-semibold leading-5 text-emerald-200',
  },
};

export default function BookingForm({
  draft,
  bookings,
  onBooking,
  bookingMessage,
  theme = 'light',
  className = '',
  waLink,
  columns = 2,
}: {
  draft: SiteDraft;
  bookings: Booking[];
  onBooking: (event: FormEvent<HTMLFormElement>) => void;
  bookingMessage: string;
  theme?: Theme;
  className?: string;
  waLink?: string | null;
  columns?: 1 | 2;
}) {
  const t = themes[theme];
  const copy = bookingCopy[draft.bookingType];
  const isQuote = draft.bookingType === 'quote';
  const gridCols = columns === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-2';
  const spanner = columns === 1 ? 'sm:col-span-1' : 'sm:col-span-2';

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState('');

  const selectedService = draft.services.find((service) => service.name === selectedServiceName);
  const timing = serviceTiming(selectedService, draft.availability);

  // Otkazani upiti ne drže termin zauzetim.
  const activeBookings = bookings.filter((booking) => booking.status !== 'Otkazano');

  const todayIso = toISODate(new Date());
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const bookedTimes = selectedDate ? activeBookings.filter((booking) => booking.date === selectedDate).map((booking) => booking.time) : [];
  const availableSlots = selectedDate && !timing.fullDay
    ? slotsForDate(parseISODate(selectedDate), draft.availability, bookedTimes, timing.minutes)
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
    const dayBookings = activeBookings.filter((booking) => booking.date === iso);
    if (timing.fullDay) return dayBookings.length === 0;
    const dayBooked = dayBookings.map((booking) => booking.time);
    const slots = slotsForDate(date, draft.availability, dayBooked, timing.minutes);
    return (iso === todayIso ? slots.filter((slot) => minutesFromTime(slot) > nowMinutes) : slots).length > 0;
  };

  const changeMonth = (delta: number) => {
    setMonthCursor(new Date(year, month + delta, 1));
    setSelectedDate('');
    setSelectedTime('');
  };

  const selectedDateValue = selectedDate ? parseISODate(selectedDate) : null;
  const selectedDateLabel = selectedDateValue
    ? `${['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'][weekdayIndexOf(selectedDateValue)]}, ${selectedDateValue.getDate()}. ${MONTH_NAMES[selectedDateValue.getMonth()]}`
    : '';

  return (
    <form onSubmit={onBooking} className={`grid gap-3 ${gridCols} ${t.form} ${className}`}>
      <label className={`block text-left ${t.label}`}>
        Ime i prezime
        <input name="clientName" placeholder="Vaše ime" required className={t.input} />
      </label>
      <label className={`block text-left ${t.label}`}>
        Broj telefona
        <input name="clientPhone" type="tel" placeholder="06x xxx xxxx" required className={t.input} />
      </label>
      <label className={`block text-left ${t.label}`}>
        {copy.service}
        <select
          name="service"
          required
          value={selectedServiceName}
          onChange={(event) => {
            setSelectedServiceName(event.target.value);
            setSelectedDate('');
            setSelectedTime('');
          }}
          className={t.input}
        >
          <option value="" disabled className={theme === 'dark' ? 'text-slate-900' : undefined}>Izaberite</option>
          {draft.services.map((service, index) => (
            <option key={`${service.name}-${index}`} value={service.name} className={theme === 'dark' ? 'text-slate-900' : undefined}>{service.name}</option>
          ))}
        </select>
      </label>
      {selectedService && (
        <p className={`-mt-1 ${spanner} ${t.muted}`}>Trajanje: {durationLabel(timing)} · {timing.fullDay ? 'zauzima ceo dan' : 'termin po dogovoru'}</p>
      )}

      {!isQuote ? (
        <>
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="time" value={selectedTime} />
          <div className={`grid gap-3 ${spanner} ${t.panel} ${columns === 1 || timing.fullDay ? 'sm:grid-cols-1' : 'sm:grid-cols-[1.05fr_0.95fr]'}`}>
            <div className={t.card}>
              <div className="flex items-center justify-between gap-2">
                <button type="button" aria-label="Prethodni mesec" onClick={() => changeMonth(-1)} className={t.nav}>‹</button>
                <p className={`whitespace-nowrap ${t.strong}`}>{MONTH_NAMES[month]} {year}.</p>
                <button type="button" aria-label="Sledeći mesec" onClick={() => changeMonth(1)} className={t.nav}>›</button>
              </div>
              <div className={`mt-2 grid grid-cols-7 gap-1 text-center ${t.weekday}`}>
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
                      className={selected ? t.day : available ? t.day : t.dayOff}
                      style={selected ? { backgroundColor: draft.accentColor, color: contrastText(draft.accentColor) } : undefined}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              <p className={`mt-2 ${t.hint}`}>Sivi datumi su nedostupni ili već prošli.</p>
            </div>

            {!timing.fullDay && (
              <div className={t.card}>
                <p className={`text-[9px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Slobodni termini</p>
                {!selectedDate ? (
                  <p className={`mt-2 ${t.empty}`}>Izaberite datum u kalendaru da vidite slobodne termine.</p>
                ) : (
                  <>
                    <p className={`mt-1 ${t.strong}`}>{selectedDateLabel}</p>
                    {availableSlots.length === 0 ? (
                      <p className={`mt-2 ${t.warn}`}>Nema slobodnih termina za izabrani dan. Probajte drugi datum.</p>
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
                              className={active ? `${t.slot} border-transparent` : t.slot}
                              style={active ? { backgroundColor: draft.accentColor, color: contrastText(draft.accentColor) } : undefined}
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
            )}

            {timing.fullDay && (
              <p className={`${t.card} text-[10px] font-semibold leading-5 ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                {timing.days >= 1
                  ? `Ova usluga traje ${durationLabel(timing)}. Izaberite početni datum — ostatak termina dogovaramo telefonom.`
                  : `Ova usluga zauzima ceo dan (${durationLabel(timing)}). Izaberite datum.`}
              </p>
            )}
          </div>
        </>
      ) : (
        <label className={`block text-left ${spanner} ${t.label}`}>
          Napomena
          <input name="time" placeholder="Kratak opis potrebe" className={t.input} />
        </label>
      )}

      <button
        type="submit"
        disabled={!isQuote && (!selectedDate || (!timing.fullDay && !selectedTime))}
        className={`${spanner} ${t.submit}`}
        style={{ backgroundColor: draft.accentColor, color: contrastText(draft.accentColor) }}
      >
        {copy.submit} <span aria-hidden="true">→</span>
      </button>

      {waLink && (
        <a href={waLink} target="_blank" rel="noreferrer" className={`text-center ${spanner} ${t.wa}`}>
          Ili pošaljite poruku na WhatsApp →
        </a>
      )}

      {bookingMessage && <p role="status" className={`${spanner} ${t.notice}`}>{bookingMessage}</p>}
    </form>
  );
}
