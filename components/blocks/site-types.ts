import type { FormEvent } from 'react';

export type BookingType = 'appointment' | 'reservation' | 'group' | 'consultation' | 'quote';
export type BlockId = 'hero' | 'about' | 'services' | 'gallery' | 'reviews' | 'faq' | 'hours' | 'booking' | 'map' | 'contact';

// Dizajn sajta. Nije isto što i boja — menja raspored, tipografiju i oblike.
export type LayoutId = 'classic' | 'editorial' | 'bold' | 'premium' | 'portfolio' | 'utility' | 'booking';

export type Service = {
  name: string;
  description: string;
  price: string;
  durationMinutes?: number;
  durationDays?: number;
};
export type Review = { name: string; text: string; rating: number };
export type Faq = { question: string; answer: string };
export type GalleryItem = { label: string; emoji: string; imageUrl?: string };
export type DayAvailability = { open: boolean; start: string; end: string };

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
  status?: string;
};

export type SiteDraft = {
  templateId: string;
  categoryId: string;
  bookingType: BookingType;
  icon: string;
  businessName: string;
  businessType?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  slug: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  hours: { weekdays: string; saturday: string; sunday: string };
  accentColor: string;
  layoutId?: LayoutId;
  services: Service[];
  reviews: Review[];
  faq: Faq[];
  gallery: GalleryItem[];
  visibleBlocks: BlockId[];
  availability: Availability;
};

export type LayoutProps = {
  draft: SiteDraft;
  onBooking: (event: FormEvent<HTMLFormElement>) => void;
  bookingMessage: string;
  bookings: Booking[];
  variant?: 'preview' | 'page';
};

export const DEFAULT_LAYOUT: LayoutId = 'classic';

export const LAYOUT_IDS: LayoutId[] = ['classic', 'editorial', 'bold', 'premium', 'portfolio', 'utility', 'booking'];

export const LAYOUTS: { id: LayoutId; label: string; note: string }[] = [
  { id: 'classic', label: 'Klasičan', note: 'Čisto i pregledno, sa karticama' },
  { id: 'editorial', label: 'Editorial', note: 'Serif naslovi i tanke linije' },
  { id: 'bold', label: 'Bold', note: 'Jaka boja, krupna slova, oštri uglovi' },
  { id: 'premium', label: 'Premium', note: 'Tamna pozadina i zlatne linije' },
  { id: 'portfolio', label: 'Portfolio', note: 'Galerija je glavna, tekst je tih' },
  { id: 'utility', label: 'Servis', note: 'Cenovnik i telefonski poziv odmah' },
  { id: 'booking', label: 'Termin', note: 'Kalendar je prvi, odmah uz naslov' },
];

export function layoutOf(draft: { layoutId?: LayoutId }): LayoutId {
  return draft.layoutId && LAYOUT_IDS.includes(draft.layoutId) ? draft.layoutId : DEFAULT_LAYOUT;
}

export const WEEKDAY_LABELS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
export const WEEKDAY_FULL = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
export const MONTH_NAMES = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];

export const bookingCopy: Record<BookingType, { nav: string; hero: string; section: string; submit: string; service: string }> = {
  appointment: { nav: 'Zakaži termin', hero: 'Zakažite svoj termin', section: 'Nekoliko klikova do vašeg termina', submit: 'Pošalji zahtev za termin', service: 'Usluga' },
  reservation: { nav: 'Rezerviši', hero: 'Rezervišite svoj termin', section: 'Rezervišite sto ili termin', submit: 'Pošalji rezervaciju', service: 'Vrsta rezervacije' },
  group: { nav: 'Prijavi se', hero: 'Rezervišite svoje mesto', section: 'Osigurajte mesto na vreme', submit: 'Pošalji prijavu', service: 'Aktivnost / čas' },
  consultation: { nav: 'Zakaži konsultaciju', hero: 'Zakažite konsultaciju', section: 'Razgovor ili sastanak po vašoj meri', submit: 'Zakaži konsultaciju', service: 'Tema konsultacije' },
  quote: { nav: 'Pošalji upit', hero: 'Zatražite ponudu', section: 'Opišite potrebu, javićemo se', submit: 'Pošalji upit', service: 'Vrsta usluge' },
};

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function weekdayIndexOf(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function minutesFromTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function timeFromMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function slotsForDate(date: Date, availability: Availability, bookedTimes: string[], durationMinutes = availability.slotMinutes): string[] {
  const day = availability.week[weekdayIndexOf(date)];
  if (!day?.open) return [];
  const start = minutesFromTime(day.start);
  const end = minutesFromTime(day.end);
  const step = Math.max(availability.slotMinutes, durationMinutes) + availability.bufferMinutes;
  if (step <= 0 || end <= start) return [];
  const slots: string[] = [];
  for (let cursor = start; cursor + durationMinutes <= end; cursor += step) {
    const value = timeFromMinutes(cursor);
    if (!bookedTimes.includes(value)) slots.push(value);
  }
  return slots;
}

export function serviceTiming(service: Service | undefined, availability: Availability) {
  const days = Math.max(0, service?.durationDays ?? 0);
  const minutes = Math.max(0, service?.durationMinutes ?? availability.slotMinutes);
  return { days, minutes, fullDay: days >= 1 || minutes >= 480 };
}

export function durationLabel(timing: { days: number; minutes: number }): string {
  if (timing.days >= 1) return timing.days === 1 ? 'oko 1 dan' : `oko ${timing.days} dana`;
  if (timing.minutes >= 60) {
    const hours = Math.round((timing.minutes / 60) * 10) / 10;
    return `${hours} h`;
  }
  return `${timing.minutes} min`;
}

export function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Di';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

// Srpski brojevi su najčešće u lokalnom formatu (06x…), a WhatsApp traži
// međunarodni bez plusa i bez vodeće nule.
export function whatsappLink(phone: string, message: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (!digits.startsWith('381') && digits.startsWith('0')) digits = `381${digits.slice(1)}`;
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Boja teksta koja se čita na datoj akcentnoj boji (svetla ili tamna).
export function isLightColor(hex: string): boolean {
  const value = hex.replace('#', '');
  if (value.length !== 6) return false;
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  if ([red, green, blue].some((channel) => Number.isNaN(channel))) return false;
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.62;
}

export function contrastText(hex: string): string {
  return isLightColor(hex) ? '#0f172a' : '#ffffff';
}

// Posvetljavanje akcentne boje — za tekst na tamnoj podlozi, gde tamna
// akcentna boja ne bi bila čitljiva.
export function lightenColor(hex: string, amount = 0.5): string {
  const value = hex.replace('#', '');
  if (value.length !== 6) return hex;
  const channel = (offset: number) => parseInt(value.slice(offset, offset + 2), 16);
  if ([0, 2, 4].some((offset) => Number.isNaN(channel(offset)))) return hex;
  const mix = (offset: number) => Math.round(channel(offset) + (255 - channel(offset)) * amount).toString(16).padStart(2, '0');
  return `#${mix(0)}${mix(2)}${mix(4)}`;
}

export function accentOnDark(hex: string): string {
  return isLightColor(hex) ? hex : lightenColor(hex, 0.5);
}

function channels(hex: string): [number, number, number] | null {
  const value = hex.replace('#', '');
  if (value.length !== 6) return null;
  const parsed = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  return parsed.some((channel) => Number.isNaN(channel)) ? null : (parsed as [number, number, number]);
}

// Mešanje dve boje. `amount` je udeo druge boje (0 = prva, 1 = druga).
export function mixColor(from: string, to: string, amount: number): string {
  const a = channels(from);
  const b = channels(to);
  if (!a || !b) return from;
  const mix = (index: 0 | 1 | 2) => Math.round(a[index] + (b[index] - a[index]) * amount).toString(16).padStart(2, '0');
  return `#${mix(0)}${mix(1)}${mix(2)}`;
}

// Iz jedne akcentne boje izvodimo celu paletu. Bez ovoga sajtovi izgledaju
// kao „bela strana sa jednom obojenom dugmetom“: nemaju tonirane sekcije,
// meke granice ni tamne CTA blokove.
export type SitePalette = {
  accent: string;
  onAccent: string;
  tint: string;
  wash: string;
  line: string;
  soft: string;
  deep: string;
  onDeep: string;
  glow: string;
};

export function paletteOf(hex: string): SitePalette {
  const accent = channels(hex) ? hex : '#4f46e5';
  const deep = mixColor(accent, '#0c1015', 0.8);
  return {
    accent,
    onAccent: contrastText(accent),
    tint: mixColor(accent, '#ffffff', 0.94),
    wash: mixColor(accent, '#ffffff', 0.87),
    line: mixColor(accent, '#ffffff', 0.7),
    soft: mixColor(accent, '#ffffff', 0.5),
    deep,
    onDeep: contrastText(deep),
    glow: `${accent}1f`,
  };
}

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function mapsSearchLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function mapsEmbedLink(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
