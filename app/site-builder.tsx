'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getSupabaseClient } from '@/lib/supabase';
import { PLANS, planName, siteLimitForPlan } from '@/lib/plans';
import type { SiteRecord } from '@/lib/sites';
import AccountScreen from './account-screen';
import AuthScreen from './auth-screen';
import PricingScreen from './pricing-screen';

type BookingType = 'appointment' | 'reservation' | 'group' | 'consultation' | 'quote';
type BlockId = 'hero' | 'about' | 'services' | 'gallery' | 'reviews' | 'faq' | 'hours' | 'booking' | 'map' | 'contact';
type CategoryId = 'beauty' | 'auto' | 'hospitality' | 'health' | 'fitness' | 'education' | 'home' | 'professional' | 'retail' | 'other';
type Screen = 'home' | 'editor' | 'bookings' | 'pricing' | 'auth' | 'account';

type Service = {
  name: string;
  description: string;
  price: string;
};

type Review = {
  name: string;
  text: string;
  rating: number;
};

type Faq = {
  question: string;
  answer: string;
};

type GalleryItem = {
  label: string;
  emoji: string;
};

type DayAvailability = {
  open: boolean;
  start: string;
  end: string;
};

type Availability = {
  week: DayAvailability[];
  slotMinutes: number;
  bufferMinutes: number;
  blockedDates: string[];
};

type SiteDraft = {
  templateId: string;
  categoryId: CategoryId;
  bookingType: BookingType;
  icon: string;
  businessName: string;
  slug: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  accentColor: string;
  services: Service[];
  reviews: Review[];
  faq: Faq[];
  gallery: GalleryItem[];
  availability: Availability;
  visibleBlocks: BlockId[];
};

type Booking = {
  id: string;
  businessName: string;
  clientName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  siteId?: string | null;
};

type LeadRow = {
  id: string;
  business_name: string | null;
  client_name: string;
  phone: string;
  service: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
};

function mapLead(row: LeadRow): Booking {
  return {
    id: row.id,
    businessName: row.business_name ?? '',
    clientName: row.client_name ?? '',
    phone: row.phone ?? '',
    service: row.service ?? '',
    date: row.preferred_date ?? '',
    time: row.preferred_time ?? '',
  };
}

const DRAFT_KEY = 'div-site-draft-v1';
const BOOKINGS_KEY = 'div-demo-bookings-v1';

const bookingTypes: { id: BookingType; label: string }[] = [
  { id: 'appointment', label: 'Zakazivanje termina' },
  { id: 'reservation', label: 'Rezervacija (sto, soba, teren)' },
  { id: 'group', label: 'Grupni termin / čas' },
  { id: 'consultation', label: 'Konsultacija / poziv' },
  { id: 'quote', label: 'Upit za ponudu' },
];

const bookingCopy: Record<BookingType, { nav: string; hero: string; section: string; submit: string; service: string }> = {
  appointment: { nav: 'Zakaži termin', hero: 'Zakažite svoj termin', section: 'Nekoliko klikova do vašeg termina', submit: 'Pošalji zahtev za termin', service: 'Usluga' },
  reservation: { nav: 'Rezerviši', hero: 'Rezervišite svoj termin', section: 'Rezervišite sto ili termin', submit: 'Pošalji rezervaciju', service: 'Vrsta rezervacije' },
  group: { nav: 'Prijavi se', hero: 'Rezervišite svoje mesto', section: 'Osigurajte mesto na vreme', submit: 'Pošalji prijavu', service: 'Aktivnost / čas' },
  consultation: { nav: 'Zakaži konsultaciju', hero: 'Zakažite konsultaciju', section: 'Razgovor ili sastanak po vašoj meri', submit: 'Zakaži konsultaciju', service: 'Tema konsultacije' },
  quote: { nav: 'Pošalji upit', hero: 'Zatražite ponudu', section: 'Opišite potrebu, javićemo se', submit: 'Pošalji upit', service: 'Vrsta usluge' },
};

const categories: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'beauty', label: 'Lepota i nega', icon: '✂️' },
  { id: 'auto', label: 'Auto i moto', icon: '🔧' },
  { id: 'hospitality', label: 'Ugostiteljstvo', icon: '🍽️' },
  { id: 'health', label: 'Zdravlje', icon: '🩺' },
  { id: 'fitness', label: 'Sport i fitnes', icon: '💪' },
  { id: 'education', label: 'Edukacija', icon: '📚' },
  { id: 'home', label: 'Usluge u kući', icon: '🏠' },
  { id: 'professional', label: 'Profesionalne usluge', icon: '💼' },
  { id: 'retail', label: 'Prodavnice i zanat', icon: '🛍️' },
  { id: 'other', label: 'Druga delatnost', icon: '✨' },
];

const blockOptions: { id: BlockId; label: string; description: string }[] = [
  { id: 'hero', label: 'Naslovna sekcija', description: 'Prvi utisak i glavno dugme' },
  { id: 'about', label: 'O nama', description: 'Kratko predstavljanje biznisa' },
  { id: 'services', label: 'Usluge i cene', description: 'Ponuda koju klijenti pregledaju' },
  { id: 'gallery', label: 'Galerija', description: 'Prostor za fotografije radova' },
  { id: 'reviews', label: 'Recenzije', description: 'Utisci zadovoljnih klijenata' },
  { id: 'faq', label: 'Česta pitanja', description: 'Odgovori koji smanjuju pozive' },
  { id: 'hours', label: 'Radno vreme', description: 'Kada ste dostupni' },
  { id: 'booking', label: 'Zakazivanje / upit', description: 'Forma za nove klijente' },
  { id: 'map', label: 'Mapa i lokacija', description: 'Google mapa sa adresom' },
  { id: 'contact', label: 'Kontakt', description: 'Telefon, email i adresa' },
];

const DEFAULT_HOURS = { weekdays: '09:00 – 17:00', saturday: '09:00 – 14:00', sunday: 'Zatvoreno' };
const DEFAULT_BLOCKS: BlockId[] = ['hero', 'about', 'services', 'gallery', 'reviews', 'faq', 'hours', 'booking', 'contact'];
const WEEKDAY_LABELS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
const WEEKDAY_FULL = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const MONTH_NAMES = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
const SLOT_OPTIONS = [15, 30, 45, 60, 90, 120];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

const DEFAULT_AVAILABILITY: Availability = {
  week: [
    { open: true, start: '09:00', end: '17:00' },
    { open: true, start: '09:00', end: '17:00' },
    { open: true, start: '09:00', end: '17:00' },
    { open: true, start: '09:00', end: '17:00' },
    { open: true, start: '09:00', end: '17:00' },
    { open: true, start: '09:00', end: '14:00' },
    { open: false, start: '10:00', end: '14:00' },
  ],
  slotMinutes: 30,
  bufferMinutes: 10,
  blockedDates: [],
};

function cloneAvailability(availability: Availability): Availability {
  return {
    week: availability.week.map((day) => ({ ...day })),
    slotMinutes: availability.slotMinutes,
    bufferMinutes: availability.bufferMinutes,
    blockedDates: [...availability.blockedDates],
  };
}

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

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function buildIcs(draft: SiteDraft): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const today = new Date();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DiV.ai//Booking Calendar//SR',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(draft.businessName || 'Kalendar')}`,
  ];

  for (let offset = 0; offset < 90; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const iso = toISODate(date);
    if (draft.availability.blockedDates.includes(iso)) continue;
    const day = draft.availability.week[weekdayIndexOf(date)];
    if (!day?.open) continue;
    const dayKey = iso.replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${draft.slug || 'div'}-${iso}@div.ai`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${dayKey}T${day.start.replace(':', '')}00`,
      `DTEND:${dayKey}T${day.end.replace(':', '')}00`,
      `SUMMARY:${escapeIcsText(draft.businessName || 'Radno vreme')} – radno vreme`,
      `LOCATION:${escapeIcsText(draft.address)}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadIcs(draft: SiteDraft) {
  const blob = new Blob([buildIcs(draft)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${draft.slug || 'kalendar'}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

type PresetSeed = {
  id: string;
  name: string;
  categoryId: CategoryId;
  icon: string;
  businessName: string;
  slug: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  accentColor: string;
  bookingType: BookingType;
  services: Service[];
  reviews?: Review[];
  faq?: Faq[];
  gallery?: GalleryItem[];
  hours?: { weekdays: string; saturday: string; sunday: string };
  availability?: Availability;
  blocks?: BlockId[];
};

const basePresets: PresetSeed[] = [
  // — Lepota i nega —
  {
    id: 'salon', name: 'Frizerski salon', categoryId: 'beauty', icon: '✂️',
    businessName: 'Studio Lena', slug: 'studio-lena',
    tagline: 'Vreme je da zablistate.',
    description: 'Frizerski studio u kom se dobra energija susreće sa negom i stilom. Zakažite svoj termin i prepustite se našem timu.',
    phone: '+381 60 123 4567', email: 'zdravo@studiolena.rs', address: 'Bulevar oslobođenja 12, Beograd',
    accentColor: '#b45365', bookingType: 'appointment',
    services: [
      { name: 'Šišanje i feniranje', description: 'Konsultacija, šišanje i završno stilizovanje.', price: 'od 2.000 RSD' },
      { name: 'Farbanje', description: 'Boja prilagođena vašem stilu i tipu kose.', price: 'od 4.500 RSD' },
      { name: 'Svečana frizura', description: 'Frizura za posebne prilike i važne trenutke.', price: 'od 3.500 RSD' },
    ],
    hours: { weekdays: '09:00 – 19:00', saturday: '09:00 – 15:00', sunday: 'Zatvoreno' },
  },
  {
    id: 'beauty-salon', name: 'Kozmetički studio', categoryId: 'beauty', icon: '💅',
    businessName: 'Glow Studio', slug: 'glow-studio',
    tagline: 'Nega koja se vidi i oseća.',
    description: 'Profesionalna nega lica i tela u opuštajućem ambijentu, sa posvećenošću svakom klijentu.',
    phone: '+381 60 321 6540', email: 'zdravo@glowstudio.rs', address: 'Knez Mihailova 20, Beograd',
    accentColor: '#c2417d', bookingType: 'appointment',
    services: [
      { name: 'Tretman lica', description: 'Dubinsko čišćenje i hidratacija kože.', price: 'od 3.000 RSD' },
      { name: 'Manikir i pedikir', description: 'Negovani nokti i relaksirajući tretman.', price: 'od 2.500 RSD' },
      { name: 'Depilacija', description: 'Brz i nežan tretman za glatku kožu.', price: 'od 1.500 RSD' },
    ],
  },
  // — Auto i moto —
  {
    id: 'mechanic', name: 'Auto servis', categoryId: 'auto', icon: '🔧',
    businessName: 'Auto servis Jovanović', slug: 'auto-servis-jovanovic',
    tagline: 'Pouzdana usluga. Siguran put.',
    description: 'Vaš automobil je u sigurnim rukama. Radimo dijagnostiku, redovno održavanje i popravke uz jasnu procenu.',
    phone: '+381 64 222 3344', email: 'servis@jovanovic.rs', address: 'Industrijska 8, Novi Sad',
    accentColor: '#d97706', bookingType: 'quote',
    services: [
      { name: 'Mali servis', description: 'Zamena ulja i filtera uz pregled vozila.', price: 'od 6.000 RSD' },
      { name: 'Dijagnostika', description: 'Očitavanje grešaka i procena potrebnih radova.', price: 'od 2.500 RSD' },
      { name: 'Kočioni sistem', description: 'Provera i zamena diskova i kočionih pločica.', price: 'po proceni' },
    ],
  },
  {
    id: 'car-wash', name: 'Autopraonica', categoryId: 'auto', icon: '🚗',
    businessName: 'Shine Auto Spa', slug: 'shine-auto-spa',
    tagline: 'Sjaj koji traje.',
    description: 'Temeljno pranje i detaljno čišćenje vozila, od spoljašnjeg sjaja do unutrašnjosti.',
    phone: '+381 63 555 7788', email: 'info@shineauto.rs', address: 'Bulevar Evrope 5, Novi Sad',
    accentColor: '#0e7490', bookingType: 'appointment',
    services: [
      { name: 'Spoljašnje pranje', description: 'Pranje, sušenje i sjaj karoserije.', price: 'od 800 RSD' },
      { name: 'Dubinsko čišćenje', description: 'Detaljno čišćenje enterijera i sedišta.', price: 'od 5.000 RSD' },
      { name: 'Poliranje', description: 'Uklanjanje sitnih ogrebotina i vraćanje sjaja.', price: 'od 8.000 RSD' },
    ],
  },
  // — Ugostiteljstvo —
  {
    id: 'restaurant', name: 'Restoran', categoryId: 'hospitality', icon: '🍽️',
    businessName: 'Restoran Kod Marka', slug: 'restoran-kod-marka',
    tagline: 'Ukusi koje pamte.',
    description: 'Domaća kuhinja od svežih namirnica i ljubazna usluga, u srcu grada. Rezervišite sto i uživajte.',
    phone: '+381 11 234 5678', email: 'rezervacije@kodmarka.rs', address: 'Skadarska 14, Beograd',
    accentColor: '#b45309', bookingType: 'reservation',
    services: [
      { name: 'Ručak', description: 'Dnevni meni i à la carte jela.', price: 'od 1.200 RSD' },
      { name: 'Večera', description: 'Poseban ambijent i sezonska jela.', price: 'od 1.800 RSD' },
      { name: 'Proslave', description: 'Organizacija rođendana i poslovnih ručkova.', price: 'po dogovoru' },
    ],
    blocks: ['hero', 'about', 'services', 'gallery', 'reviews', 'faq', 'hours', 'booking', 'map', 'contact'],
    hours: { weekdays: '12:00 – 23:00', saturday: '12:00 – 23:00', sunday: '12:00 – 22:00' },
    availability: {
      week: [
        { open: false, start: '12:00', end: '23:00' },
        { open: true, start: '12:00', end: '23:00' },
        { open: true, start: '12:00', end: '23:00' },
        { open: true, start: '12:00', end: '23:00' },
        { open: true, start: '12:00', end: '23:00' },
        { open: true, start: '12:00', end: '23:00' },
        { open: true, start: '12:00', end: '22:00' },
      ],
      slotMinutes: 30,
      bufferMinutes: 0,
      blockedDates: [],
    },
  },
  {
    id: 'cafe', name: 'Kafić / pekara', categoryId: 'hospitality', icon: '☕',
    businessName: 'Kafeterija Kutak', slug: 'kafeterija-kutak',
    tagline: 'Vaš omiljeni kutak za kafu.',
    description: 'Kvalitetna kafa, sveže pecivo i prijatna atmosfera za posao ili druženje.',
    phone: '+381 60 111 2233', email: 'zdravo@kutak.rs', address: 'Njegoševa 3, Beograd',
    accentColor: '#92400e', bookingType: 'reservation',
    services: [
      { name: 'Espresso bar', description: 'Kafa iz cele palete zrna.', price: 'od 250 RSD' },
      { name: 'Doručak', description: 'Sveže pecivo, sendviči i kaše.', price: 'od 450 RSD' },
      { name: 'Slatka ponuda', description: 'Kolači i poslastice svakog dana.', price: 'od 350 RSD' },
    ],
  },
  // — Zdravlje —
  {
    id: 'dentist', name: 'Stomatološka ordinacija', categoryId: 'health', icon: '🦷',
    businessName: 'Dental Care', slug: 'dental-care',
    tagline: 'Zdrav osmeh, bez bola.',
    description: 'Moderna ordinacija sa posvećenim timom i najnovijom opremom za celu porodicu.',
    phone: '+381 11 987 6543', email: 'zakazivanje@dentalcare.rs', address: 'Bulevar kralja Aleksandra 40, Beograd',
    accentColor: '#0891b2', bookingType: 'appointment',
    services: [
      { name: 'Pregled i konsultacija', description: 'Kompletan stomatološki pregled.', price: 'od 1.500 RSD' },
      { name: 'Popravka zuba', description: 'Plombe i estetske ispune.', price: 'od 3.000 RSD' },
      { name: 'Izbeljivanje', description: 'Bezbedno izbeljivanje osmeha.', price: 'od 15.000 RSD' },
    ],
  },
  {
    id: 'physio', name: 'Fizioterapeut', categoryId: 'health', icon: '🩺',
    businessName: 'Fizio Centar', slug: 'fizio-centar',
    tagline: 'Pokrenite telo ponovo.',
    description: 'Individualna terapija i vežbe za oporavak, oslobađanje od bola i bolju pokretljivost.',
    phone: '+381 60 444 5566', email: 'zakazivanje@fizio.rs', address: 'Vojvode Stepe 100, Beograd',
    accentColor: '#16a34a', bookingType: 'appointment',
    services: [
      { name: 'Prvi pregled', description: 'Procena stanja i plan terapije.', price: 'od 2.000 RSD' },
      { name: 'Manualna terapija', description: 'Terapija za smanjenje bola i napetosti.', price: 'od 2.500 RSD' },
      { name: 'Rehabilitacija', description: 'Program vežbi nakon povrede.', price: 'od 3.000 RSD' },
    ],
  },
  // — Sport i fitnes —
  {
    id: 'gym', name: 'Teretana', categoryId: 'fitness', icon: '💪',
    businessName: 'Iron Gym', slug: 'iron-gym',
    tagline: 'Snaga. Disciplina. Rezultat.',
    description: 'Moderni sprave, grupni treninzi i stručno vođenje za svaki nivo spremnosti.',
    phone: '+381 64 777 8899', email: 'info@irongym.rs', address: 'Jurija Gagarina 50, Novi Beograd',
    accentColor: '#ea580c', bookingType: 'group',
    services: [
      { name: 'Grupni trening', description: 'Kružni trening uz instruktora.', price: 'od 700 RSD' },
      { name: 'Mesečna članarina', description: 'Neograničen pristup teretani.', price: '3.500 RSD' },
      { name: 'Personalni plan', description: 'Individualni program vežbanja.', price: 'od 5.000 RSD' },
    ],
  },
  {
    id: 'pt', name: 'Personalni trener', categoryId: 'fitness', icon: '🏋️',
    businessName: 'Trener Nikola', slug: 'trener-nikola',
    tagline: 'Vaš plan. Vaš tempo. Vaši rezultati.',
    description: 'Individualni treninzi prilagođeni vašim ciljevima, na terenu ili online.',
    phone: '+381 63 888 9900', email: 'nikola@trening.rs', address: 'Online / teren po dogovoru',
    accentColor: '#7c3aed', bookingType: 'consultation',
    services: [
      { name: 'Uvodna konsultacija', description: 'Procena forme i definisanje ciljeva.', price: 'Besplatno' },
      { name: 'Individualni trening', description: 'Trening 1-na-1 po vašoj meri.', price: 'od 2.500 RSD' },
      { name: 'Plan ishrane', description: 'Nutritivni plan uz trening.', price: 'od 4.000 RSD' },
    ],
  },
  // — Edukacija —
  {
    id: 'language', name: 'Škola jezika', categoryId: 'education', icon: '📚',
    businessName: 'Lingua Centar', slug: 'lingua-centar',
    tagline: 'Novi jezik, nove mogućnosti.',
    description: 'Kursevi stranih jezika za sve uzraste i nivoe, u malim grupama i sa sertifikovanim predavačima.',
    phone: '+381 11 555 6677', email: 'upis@lingua.rs', address: 'Kralja Milana 8, Beograd',
    accentColor: '#2563eb', bookingType: 'group',
    services: [
      { name: 'Grupni kurs', description: 'Rad u malim grupama, 2x nedeljno.', price: 'od 8.000 RSD/mes' },
      { name: 'Individualni čas', description: 'Prilagođen tempo i gradivo.', price: 'od 1.800 RSD' },
      { name: 'Priprema za sertifikat', description: 'Priprema za međunarodne ispite.', price: 'po dogovoru' },
    ],
  },
  // — Usluge u kući —
  {
    id: 'painter', name: 'Molerske usluge', categoryId: 'home', icon: '🖌️',
    businessName: 'Moler Pera', slug: 'moler-pera',
    tagline: 'Zidovi koji menjaju prostor.',
    description: 'Krečenje, gletovanje i moleraj stanova i poslovnih prostora, uz uredan rad i fer cenu.',
    phone: '+381 62 123 0000', email: 'pera@moleraj.rs', address: 'Pokriva Beograd',
    accentColor: '#dc2626', bookingType: 'quote',
    services: [
      { name: 'Krečenje stana', description: 'Priprema, gletovanje i krečenje.', price: 'po proceni' },
      { name: 'Gletovanje', description: 'Ravnanje zidova pre bojenja.', price: 'po proceni' },
      { name: 'Fasade', description: 'Krečenje spoljašnjih površina.', price: 'po proceni' },
    ],
  },
  {
    id: 'electrician', name: 'Električar', categoryId: 'home', icon: '💡',
    businessName: 'Elektro Tim', slug: 'elektro-tim',
    tagline: 'Sigurna struja, bez brige.',
    description: 'Hitne intervencije, instalacije i popravke uz licenciran tim i garanciju na rad.',
    phone: '+381 61 999 1122', email: 'servis@elektrotim.rs', address: 'Pokriva Novi Sad',
    accentColor: '#ca8a04', bookingType: 'quote',
    services: [
      { name: 'Hitna intervencija', description: 'Brza popravka kvarova.', price: 'po pozivu' },
      { name: 'Nove instalacije', description: 'Uvođenje struje i rasvete.', price: 'po proceni' },
      { name: 'Rekonstrukcija', description: 'Zamena starih instalacija.', price: 'po proceni' },
    ],
  },
  // — Profesionalne usluge —
  {
    id: 'accounting', name: 'Knjigovodstvena agencija', categoryId: 'professional', icon: '💼',
    businessName: 'Biro Knjigovodstvo', slug: 'biro-knjigovodstvo',
    tagline: 'Vaše finansije, naš posao.',
    description: 'Vođenje knjiga, obračun zarada i poresko savetovanje za preduzetnike i firme.',
    phone: '+381 11 333 4455', email: 'kancelarija@biro.rs', address: 'Terazije 5, Beograd',
    accentColor: '#4f46e5', bookingType: 'consultation',
    services: [
      { name: 'Vođenje knjiga', description: 'Mesečno knjigovodstvo.', price: 'od 12.000 RSD/mes' },
      { name: 'Obračun zarada', description: 'Plate i doprinosi zaposlenih.', price: 'po dogovoru' },
      { name: 'Poresko savetovanje', description: 'Optimizacija i priprema prijava.', price: 'po dogovoru' },
    ],
  },
  // — Prodavnice i zanat —
  {
    id: 'florist', name: 'Cvećara', categoryId: 'retail', icon: '💐',
    businessName: 'Cvećara Iris', slug: 'cvecara-iris',
    tagline: 'Cveće za svaku priliku.',
    description: 'Sveže cveće, buketi po meri i dostava na teritoriji grada istog dana.',
    phone: '+381 60 222 3333', email: 'narudzbine@iris.rs', address: 'Nemanjina 9, Beograd',
    accentColor: '#db2777', bookingType: 'quote',
    services: [
      { name: 'Buketi po meri', description: 'Personalizovani aranžmani.', price: 'od 1.500 RSD' },
      { name: 'Venci i aranžmani', description: 'Za proslave i poslovne prostore.', price: 'po dogovoru' },
      { name: 'Dostava', description: 'Isporuka istog dana.', price: 'od 500 RSD' },
    ],
  },
];

// Skraćeni zapis za šablone kojima ne treba ručno pisati sva polja.
type CompactPreset = {
  id: string;
  name: string;
  category: CategoryId;
  icon: string;
  businessName: string;
  slug: string;
  tagline: string;
  description: string;
  color: string;
  booking: BookingType;
  services: [string, string, string][];
};

function compactPreset(input: CompactPreset): PresetSeed {
  return {
    id: input.id,
    name: input.name,
    categoryId: input.category,
    icon: input.icon,
    businessName: input.businessName,
    slug: input.slug,
    tagline: input.tagline,
    description: input.description,
    phone: '+381 60 000 0000',
    email: `info@${input.slug.replace(/-/g, '')}.rs`,
    address: 'Beograd, Srbija',
    accentColor: input.color,
    bookingType: input.booking,
    services: input.services.map(([name, description, price]) => ({ name, description, price })),
  };
}

const extraPresets: PresetSeed[] = [
  // — Lepota i nega —
  compactPreset({
    id: 'nails', name: 'Manikir i pedikir', category: 'beauty', icon: '💅',
    businessName: 'Nokti Studio', slug: 'nokti-studio',
    tagline: 'Uredni nokti, svakog dana.',
    description: 'Manikir, pedikir i gel lak u prijatnom ambijentu, uz pažljivu negu i sterilne alate.',
    color: '#db2777', booking: 'appointment',
    services: [
      ['Manikir', 'Oblikovanje, nega zanoktica i lak po želji.', 'od 1.800 RSD'],
      ['Pedikir', 'Kompletna nega stopala i noktiju.', 'od 2.200 RSD'],
      ['Gel lak', 'Dugotrajna boja koja traje nedeljama.', 'od 2.500 RSD'],
    ],
  }),
  compactPreset({
    id: 'lashes', name: 'Trepavice i obrve', category: 'beauty', icon: '👁️',
    businessName: 'Lash Room', slug: 'lash-room',
    tagline: 'Pogled koji govori.',
    description: 'Nadogradnja trepavica i oblikovanje obrva prilagođeno vašem licu i stilu.',
    color: '#7c3aed', booking: 'appointment',
    services: [
      ['Nadogradnja trepavica', 'Klasična, hibridna ili volume tehnika.', 'od 4.000 RSD'],
      ['Laminacija obrva', 'Oblikovanje i bojenje obrva.', 'od 2.000 RSD'],
      ['Korekcija', 'Održavanje i dopuna postojećih trepavica.', 'od 2.500 RSD'],
    ],
  }),
  compactPreset({
    id: 'massage', name: 'Masaža i relax', category: 'beauty', icon: '🌿',
    businessName: 'Relax Centar', slug: 'relax-centar',
    tagline: 'Predah koji vam treba.',
    description: 'Terapeutske i relaks masaže koje otklanjaju napetost i vraćaju energiju.',
    color: '#0d9488', booking: 'appointment',
    services: [
      ['Terapeutska masaža', 'Ciljano tretiranje bolnih tačaka.', 'od 3.500 RSD'],
      ['Aroma masaža', 'Relaksacija uz eterična ulja.', 'od 3.000 RSD'],
      ['Sportska masaža', 'Priprema i oporavak mišića.', 'od 4.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'tattoo', name: 'Tetovaža i pirsing', category: 'beauty', icon: '🖋️',
    businessName: 'Ink Studio', slug: 'ink-studio',
    tagline: 'Umretnost na koži.',
    description: 'Autorske tetovaže i pirsing, uz stroge higijenske standarde i konsultaciju pre svake izrade.',
    color: '#1f2937', booking: 'appointment',
    services: [
      ['Konsultacija i skica', 'Dogovor o motivu, veličini i ceni.', 'besplatno'],
      ['Izrada tetovaže', 'Rad po dogovorenoj skici.', 'od 8.000 RSD'],
      ['Pirsing', 'Ušne i nosne mindjuše uz sterilnu opremu.', 'od 3.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'pet-grooming', name: 'Frizer za pse', category: 'beauty', icon: '🐕',
    businessName: 'Pet Grooming', slug: 'pet-grooming',
    tagline: 'Srećan pas, uredna dlaka.',
    description: 'Kupanje, šišanje i nega dlake za pse svih rasa, uz puno strpljenja i ljubavi.',
    color: '#f59e0b', booking: 'appointment',
    services: [
      ['Kupanje i feniranje', 'Nega dlake šamponom prilagođenim rasi.', 'od 2.000 RSD'],
      ['Šišanje', 'Oblikovanje dlake prema rasi ili želji.', 'od 3.500 RSD'],
      ['Nega noktiju i ušiju', 'Skraćivanje noktiju i čišćenje ušiju.', 'od 1.000 RSD'],
    ],
  }),
  // — Auto i moto —
  compactPreset({
    id: 'tire', name: 'Vulkanizer', category: 'auto', icon: '🛞',
    businessName: 'Tire Pro', slug: 'tire-pro',
    tagline: 'Siguran oslonac na putu.',
    description: 'Zamena guma, balansiranje i vulkanizacija, brzo i uz proveru pritiska.',
    color: '#334155', booking: 'quote',
    services: [
      ['Zamena guma', 'Montaža i demontaža svih dimenzija.', 'od 1.200 RSD'],
      ['Balansiranje', 'Ujednačena vožnja bez vibracija.', 'od 800 RSD'],
      ['Vulkanizacija', 'Krpljenje i sanacija oštećenja.', 'od 1.500 RSD'],
    ],
  }),
  compactPreset({
    id: 'car-rent', name: 'Rent a car', category: 'auto', icon: '🚙',
    businessName: 'Rent Auto', slug: 'rent-auto',
    tagline: 'Vaš auto, kada vam treba.',
    description: 'Iznajmljivanje vozila uz fleksibilne uslove, puno osiguranje i dostavu na adresu.',
    color: '#0284c7', booking: 'reservation',
    services: [
      ['Dnevni najam', 'Vozilo sa punim osiguranjem.', 'od 4.000 RSD/dan'],
      ['Nedeljni najam', 'Povoljniji paket za duže putovanje.', 'od 22.000 RSD'],
      ['Prevoz do aerodroma', 'Transfer sa vozačem.', 'po dogovoru'],
    ],
  }),
  compactPreset({
    id: 'towing', name: 'Šlep služba', category: 'auto', icon: '🚨',
    businessName: 'Auto Šlep 24h', slug: 'auto-slep-24h',
    tagline: 'Tu smo kada je najteže.',
    description: 'Dežurna šlep služba 24 sata, prevoz vozila do servisa ili kućne adrese.',
    color: '#dc2626', booking: 'quote',
    services: [
      ['Šlep do servisa', 'Brza intervencija na terenu.', 'od 5.000 RSD'],
      ['Prevoz vozila', 'Transport na duže relacije.', 'po kilometru'],
      ['Pomoć na putu', 'Paljenje akumulatora i sitne popravke.', 'od 2.500 RSD'],
    ],
  }),
  // — Ugostiteljstvo —
  compactPreset({
    id: 'hotel', name: 'Hotel i apartmani', category: 'hospitality', icon: '🏨',
    businessName: 'Apartmani More', slug: 'apartmani-more',
    tagline: 'Odmor bez brige.',
    description: 'Udobni apartmani blizu centra, sa doručkom i fleksibilnim prijavljivanjem.',
    color: '#0891b2', booking: 'reservation',
    services: [
      ['Noćenje sa doručkom', 'Dvokrevetna soba i doručak.', 'od 6.500 RSD'],
      ['Apartman', 'Kompletno opremljen apartman za porodicu.', 'od 9.000 RSD'],
      ['Dugi boravak', 'Posebni uslovi za boravak od 7 dana.', 'po dogovoru'],
    ],
  }),
  compactPreset({
    id: 'catering', name: 'Ketering', category: 'hospitality', icon: '🍲',
    businessName: 'Ketering Delikates', slug: 'ketering-delikates',
    tagline: 'Ukus koji dolazi vama.',
    description: 'Ketering za poslovne ručkove, proslave i događaje, uz dostavu i posluženje.',
    color: '#b45309', booking: 'quote',
    services: [
      ['Poslovni ručkovi', 'Dnevni meni za kancelarije.', 'od 900 RSD/osobi'],
      ['Proslave', 'Hladni i topli bife po dogovoru.', 'po dogovoru'],
      ['Koktel', 'Finger food i piće dobrodošlice.', 'po dogovoru'],
    ],
  }),
  compactPreset({
    id: 'pizzeria', name: 'Picerija', category: 'hospitality', icon: '🍕',
    businessName: 'Pizzeria Roma', slug: 'pizzeria-roma',
    tagline: 'Iz peći, toplo do stola.',
    description: 'Pizza iz krušne peći, sveže testenine i salate, uz dostavu na kućnu adresu.',
    color: '#b91c1c', booking: 'reservation',
    services: [
      ['Pizza', 'Klasične i autorske kombinacije.', 'od 1.200 RSD'],
      ['Testenine', 'Sveže pripremljene po porudžbini.', 'od 900 RSD'],
      ['Dostava', 'Isporuka na adresu u roku od 45 minuta.', 'od 200 RSD'],
    ],
  }),
  // — Zdravlje —
  compactPreset({
    id: 'vet', name: 'Veterinarska ambulanta', category: 'health', icon: '🐾',
    businessName: 'Vet Care', slug: 'vet-care',
    tagline: 'Nega za svakog ljubimca.',
    description: 'Pregledi, vakcinacija i savetovanje za pse, mačke i male životinje.',
    color: '#15803d', booking: 'appointment',
    services: [
      ['Pregled', 'Klinički pregled i savet.', 'od 2.500 RSD'],
      ['Vakcinacija', 'Vakcine po propisanom kalendaru.', 'od 3.000 RSD'],
      ['Stomatologija', 'Čišćenje kamenca i sanacija zuba.', 'po proceni'],
    ],
  }),
  compactPreset({
    id: 'psychology', name: 'Psihoterapija', category: 'health', icon: '🧠',
    businessName: 'Psihoterapija Centar', slug: 'psihoterapija-centar',
    tagline: 'Prostor za razgovor.',
    description: 'Individualna i bračna psihoterapija, u ordinaciji ili online, uz punu diskreciju.',
    color: '#6d28d9', booking: 'consultation',
    services: [
      ['Individualna terapija', 'Rad na anksioznosti, stresu i odnosima.', 'od 4.000 RSD'],
      ['Bračno savetovanje', 'Zajedničke seanse za partnere.', 'od 5.500 RSD'],
      ['Online seansa', 'Terapija preko video poziva.', 'od 4.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'nutrition', name: 'Nutricionista', category: 'health', icon: '🥗',
    businessName: 'Nutri Plan', slug: 'nutri-plan',
    tagline: 'Plan koji se drži.',
    description: 'Individualni planovi ishrane i praćenje rezultata, bez strogih i neodrživih dijeta.',
    color: '#65a30d', booking: 'consultation',
    services: [
      ['Prvi pregled', 'Analiza navika i sastava tela.', 'od 3.500 RSD'],
      ['Plan ishrane', 'Jelovnik prilagođen cilju i načinu života.', 'od 6.000 RSD'],
      ['Praćenje', 'Kontrolni pregledi i korekcija plana.', 'od 2.000 RSD'],
    ],
  }),
  // — Sport i fitnes —
  compactPreset({
    id: 'yoga', name: 'Joga studio', category: 'fitness', icon: '🧘',
    businessName: 'Yoga Space', slug: 'yoga-space',
    tagline: 'Disanje, pokret, mir.',
    description: 'Joga za sve nivoe, u malim grupama i uz posvećene instruktore.',
    color: '#0f766e', booking: 'group',
    services: [
      ['Joga za početnike', 'Osnove pokreta i disanja.', 'od 1.200 RSD'],
      ['Vinyasa', 'Dinamična praksa za iskusnije.', 'od 1.500 RSD'],
      ['Meditacija', 'Vođena meditacija i opuštanje.', 'od 900 RSD'],
    ],
  }),
  compactPreset({
    id: 'dance', name: 'Plesna škola', category: 'fitness', icon: '💃',
    businessName: 'Dance Studio', slug: 'dance-studio',
    tagline: 'Ples je najbolja zabava.',
    description: 'Grupni i individualni časovi plesa za decu i odrasle, bez obzira na iskustvo.',
    color: '#e11d48', booking: 'group',
    services: [
      ['Latino plesovi', 'Salsa, bachata i cha-cha.', 'od 2.000 RSD'],
      ['Standardni plesovi', 'Valcer, tango i fokstrot.', 'od 2.000 RSD'],
      ['Društveni ples', 'Opustite se i naučite osnove.', 'od 1.500 RSD'],
    ],
  }),
  compactPreset({
    id: 'martial', name: 'Borilački klub', category: 'fitness', icon: '🥊',
    businessName: 'Fight Club', slug: 'fight-club',
    tagline: 'Snaga i disciplina.',
    description: 'Treninzi za decu i odrasle, od rekreativnog vežbanja do takmičarske pripreme.',
    color: '#b91c1c', booking: 'group',
    services: [
      ['MMA', 'Kompletna borilačka priprema.', 'od 2.500 RSD'],
      ['Boks', 'Tehnika, kondicija i sparing.', 'od 2.000 RSD'],
      ['Samoodbrana', 'Praktične tehnike za svakodnevicu.', 'od 1.800 RSD'],
    ],
  }),
  // — Edukacija —
  compactPreset({
    id: 'music-school', name: 'Muzička škola', category: 'education', icon: '🎹',
    businessName: 'Muzička Škola Note', slug: 'muzicka-skola-note',
    tagline: 'Prvi akord je najvažniji.',
    description: 'Individualna nastava klavira, gitare i pevanja za decu i odrasle.',
    color: '#7c2d12', booking: 'appointment',
    services: [
      ['Klavir', 'Individualni časovi za sve uzraste.', 'od 2.000 RSD'],
      ['Gitara', 'Akustična i električna gitara.', 'od 2.000 RSD'],
      ['Pevanje', 'Tehnika disanja i interpretacija.', 'od 2.500 RSD'],
    ],
  }),
  compactPreset({
    id: 'tutoring', name: 'Instrukcije', category: 'education', icon: '📖',
    businessName: 'Instrukcije Plus', slug: 'instrukcije-plus',
    tagline: 'Gradivo koje konačno legne.',
    description: 'Individualne instrukcije i priprema za prijemne ispite, uživo ili online.',
    color: '#1d4ed8', booking: 'appointment',
    services: [
      ['Matematika', 'Osnovna škola i gimnazija.', 'od 1.500 RSD'],
      ['Fizika', 'Objašnjenje kroz primere i zadatke.', 'od 1.500 RSD'],
      ['Priprema za prijemni', 'Sistematska priprema i testovi.', 'od 2.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'it-academy', name: 'IT akademija', category: 'education', icon: '💻',
    businessName: 'Code Academy', slug: 'code-academy',
    tagline: 'Od nule do prvog posla.',
    description: 'Praktični kursevi programiranja i dizajna, u malim grupama i uz mentore iz industrije.',
    color: '#4338ca', booking: 'group',
    services: [
      ['Web development', 'HTML, CSS, JavaScript i React.', 'od 45.000 RSD'],
      ['Python', 'Osnove programiranja i automatizacija.', 'od 40.000 RSD'],
      ['UI/UX dizajn', 'Figmа, prototipi i korisničko iskustvo.', 'od 42.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'kindergarten', name: 'Vrtić', category: 'education', icon: '🧸',
    businessName: 'Vrtić Sunce', slug: 'vrtic-sunce',
    tagline: 'Sigurno mesto za rast.',
    description: 'Celodnevni i poludnevni boravak za decu od jedne do šest godina.',
    color: '#f59e0b', booking: 'quote',
    services: [
      ['Celodnevni boravak', 'Obroci, igra i odmor.', 'po dogovoru'],
      ['Poludnevni boravak', 'Jutarnji ili popodnevni program.', 'po dogovoru'],
      ['Jaslice', 'Program za najmlađe uz posebnu negu.', 'po dogovoru'],
    ],
  }),
  // — Usluge u kući —
  compactPreset({
    id: 'plumber', name: 'Vodoinstalater', category: 'home', icon: '🚰',
    businessName: 'Vodo Instal', slug: 'vodo-instal',
    tagline: 'Voda pod kontrolom.',
    description: 'Popravke i instalacije vodovodnih i grejnih sistema, bez odlaganja.',
    color: '#0369a1', booking: 'quote',
    services: [
      ['Popravka slavina', 'Zamena kartuše i dihtunga.', 'od 2.000 RSD'],
      ['Zamena cevi', 'Nove instalacije i rekonstrukcije.', 'po proceni'],
      ['Hitne intervencije', 'Dežurstvo za curenje i havarije.', 'od 4.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'cleaning', name: 'Čišćenje', category: 'home', icon: '🧽',
    businessName: 'Clean Pro', slug: 'clean-pro',
    tagline: 'Čisto bez vašeg truda.',
    description: 'Generalno i dubinsko čišćenje stanova, kuća i poslovnih prostora.',
    color: '#0d9488', booking: 'quote',
    services: [
      ['Generalno čišćenje', 'Stanovi i kuće do 100 m².', 'od 6.000 RSD'],
      ['Dubinsko čišćenje', 'Nameštaj, tepisi i tvrdokorne mrlje.', 'od 9.000 RSD'],
      ['Poslovni prostori', 'Redovno održavanje kancelarija.', 'po dogovoru'],
    ],
  }),
  compactPreset({
    id: 'ac-service', name: 'Klima servis', category: 'home', icon: '❄️',
    businessName: 'Klima Servis', slug: 'klima-servis',
    tagline: 'Prihvatljiva temperatura cele godine.',
    description: 'Servis, montaža i punjenje klima uređaja, uz redovno održavanje.',
    color: '#0ea5e9', booking: 'quote',
    services: [
      ['Servis klime', 'Čišćenje filtera i provera rada.', 'od 3.500 RSD'],
      ['Montaža', 'Ugradnja nove klima jedinice.', 'od 12.000 RSD'],
      ['Punjenje gasa', 'Dopuna freona i provera zaptivenosti.', 'od 4.500 RSD'],
    ],
  }),
  compactPreset({
    id: 'carpenter', name: 'Stolar', category: 'home', icon: '🪚',
    businessName: 'Stolarstvo Drvo', slug: 'stolarstvo-drvo',
    tagline: 'Nameštaj po meri.',
    description: 'Izrada kuhinja, plakara i nameštaja po meri, od ideje do montaže.',
    color: '#92400e', booking: 'quote',
    services: [
      ['Kuhinje po meri', 'Projektovanje i izrada.', 'po proceni'],
      ['Plakari', 'Ugradni i samostojeći.', 'po proceni'],
      ['Nameštaj po meri', 'Stolovi, police i ostalo.', 'po proceni'],
    ],
  }),
  compactPreset({
    id: 'moving', name: 'Selidbe', category: 'home', icon: '📦',
    businessName: 'Selidbe Express', slug: 'selidbe-express',
    tagline: 'Selidba bez stresa.',
    description: 'Selidbe stanova i kancelarija, uz pakovanje, utovar i prevoz.',
    color: '#475569', booking: 'quote',
    services: [
      ['Selidba stana', 'Utovar, prevoz i istovar.', 'od 15.000 RSD'],
      ['Selidba kancelarije', 'Organizovano preseljenje opreme.', 'po proceni'],
      ['Kombi prevoz', 'Najam vozila sa vozačem.', 'od 6.000 RSD'],
    ],
  }),
  // — Profesionalne usluge —
  compactPreset({
    id: 'lawyer', name: 'Advokat', category: 'professional', icon: '⚖️',
    businessName: 'Advokatska Kancelarija', slug: 'advokatska-kancelarija',
    tagline: 'Pravna sigurnost.',
    description: 'Pravno savetovanje i zastupanje u građanskim i privrednim predmetima.',
    color: '#1e293b', booking: 'consultation',
    services: [
      ['Pravno savetovanje', 'Usmena pravna pomoć i mišljenje.', 'od 3.000 RSD'],
      ['Zastupanje', 'Zastupanje pred sudom.', 'po dogovoru'],
      ['Ugovori', 'Izrada i revizija ugovora.', 'od 8.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'realestate', name: 'Nekretnine', category: 'professional', icon: '🏢',
    businessName: 'Agencija Nekretnina', slug: 'agencija-nekretnina',
    tagline: 'Prava adresa, bez lutanja.',
    description: 'Posredovanje u prodaji i kupovini stanova, kuća i poslovnih prostora.',
    color: '#0f766e', booking: 'consultation',
    services: [
      ['Prodaja stana', 'Procena, fotografije i oglasi.', 'po dogovoru'],
      ['Kupovina', 'Pronalaženje nekretnine po meri.', 'po dogovoru'],
      ['Procena vrednosti', 'Realna procena tržišne cene.', 'od 5.000 RSD'],
    ],
  }),
  compactPreset({
    id: 'marketing', name: 'Marketing agencija', category: 'professional', icon: '📈',
    businessName: 'Digital Studio', slug: 'digital-studio',
    tagline: 'Vidljivost koja donosi klijente.',
    description: 'Strategija, društvene mreže i plaćeni oglasi za male i srednje biznise.',
    color: '#c026d3', booking: 'consultation',
    services: [
      ['Strategija', 'Plan kanala i sadržaja.', 'od 30.000 RSD'],
      ['Društvene mreže', 'Vođenje profila i objave.', 'od 25.000 RSD/mes'],
      ['Plaćeni oglasi', 'Kampanje i optimizacija.', 'po dogovoru'],
    ],
  }),
  compactPreset({
    id: 'photo-studio', name: 'Foto studio', category: 'professional', icon: '📷',
    businessName: 'Foto Studio', slug: 'foto-studio',
    tagline: 'Trenuci koji ostaju.',
    description: 'Portreti, venčanja i komercijalna fotografija, uz uređivanje i obradu.',
    color: '#334155', booking: 'appointment',
    services: [
      ['Portret', 'Studijsko snimanje i obrada.', 'od 6.000 RSD'],
      ['Venčanje', 'Celodnevno praćenje događaja.', 'od 45.000 RSD'],
      ['Proizvodi', 'Fotografija za prodaju i kataloge.', 'po dogovoru'],
    ],
  }),
  // — Prodavnice i zanat —
  compactPreset({
    id: 'clothes', name: 'Prodavnica odeće', category: 'retail', icon: '👗',
    businessName: 'Moda Shop', slug: 'moda-shop',
    tagline: 'Stil za svaki dan.',
    description: 'Ženska i muška kolekcija, uz lično savetovanje pri izboru.',
    color: '#be185d', booking: 'quote',
    services: [
      ['Ženska kolekcija', 'Dnevne i svečane kombinacije.', 'od 3.000 RSD'],
      ['Muška kolekcija', 'Košulje, pantalone i jakne.', 'od 3.500 RSD'],
      ['Dodaci', 'Tašne, kaiševi i nakit.', 'od 1.500 RSD'],
    ],
  }),
  compactPreset({
    id: 'bookstore', name: 'Knjižara', category: 'retail', icon: '📚',
    businessName: 'Knjižara Reč', slug: 'knjizara-rec',
    tagline: 'Dobra knjiga je uvek tu.',
    description: 'Knjige, školski pribor i pokloni, uz mogućnost poručivanja naslova.',
    color: '#78350f', booking: 'quote',
    services: [
      ['Knjige', 'Domaći i strani naslovi.', 'od 800 RSD'],
      ['Školski pribor', 'Sveske, olovke i oprema.', 'od 100 RSD'],
      ['Pokloni', 'Ideje za svaku priliku.', 'od 500 RSD'],
    ],
  }),
  compactPreset({
    id: 'jewelry', name: 'Zlatara', category: 'retail', icon: '💍',
    businessName: 'Zlatara Sjaj', slug: 'zlatara-sjaj',
    tagline: 'Detalj koji traje.',
    description: 'Prstenje, nakit po meri i popravke, uz sertifikat o kvalitetu.',
    color: '#a16207', booking: 'quote',
    services: [
      ['Prstenje', 'Burme i veridbeni prstenovi.', 'od 25.000 RSD'],
      ['Nakit po meri', 'Izrada prema vašoj ideji.', 'po dogovoru'],
      ['Popravke', 'Zamena kopči i poliranje.', 'od 2.000 RSD'],
    ],
  }),
];

// Generički šablon: korisnik unosi naziv i delatnost, a struktura je spremna za izmenu.
const customSeed: PresetSeed = {
  id: 'custom',
  name: 'Druga delatnost',
  categoryId: 'other',
  icon: '✨',
  businessName: 'Vaš biznis',
  slug: 'vas-biznis',
  tagline: 'Usluga po vašoj meri.',
  description: 'Ukratko predstavite svoj biznis, usluge i način kontakta. Sve tekstove možete slobodno da izmenite.',
  phone: '+381 60 000 0000',
  email: 'kontakt@vasbiznis.rs',
  address: 'Beograd, Srbija',
  accentColor: '#4f46e5',
  bookingType: 'appointment',
  services: [
    { name: 'Usluga 1', description: 'Kratko opišite šta nudite.', price: 'po dogovoru' },
    { name: 'Usluga 2', description: 'Dodajte još jednu uslugu iz svoje ponude.', price: 'po dogovoru' },
    { name: 'Konsultacija', description: 'Razgovor o vašim potrebama.', price: 'besplatno' },
  ],
};

const presetSeeds: PresetSeed[] = [...basePresets, ...extraPresets, customSeed];

function buildDraft(seed: PresetSeed): SiteDraft {
  return {
    templateId: seed.id,
    categoryId: seed.categoryId,
    bookingType: seed.bookingType,
    icon: seed.icon,
    businessName: seed.businessName,
    slug: seed.slug,
    tagline: seed.tagline,
    description: seed.description,
    phone: seed.phone,
    email: seed.email,
    address: seed.address,
    hours: seed.hours ?? DEFAULT_HOURS,
    accentColor: seed.accentColor,
    services: seed.services,
    availability: cloneAvailability(seed.availability ?? DEFAULT_AVAILABILITY),
    reviews: seed.reviews ?? [
      { name: 'Milica P.', text: 'Izuzetna usluga i ljubazno osoblje. Sve preporuke!', rating: 5 },
      { name: 'Marko J.', text: 'Profesionalno, brzo i po fer ceni. Vraćam se ponovo.', rating: 5 },
      { name: 'Ana S.', text: 'Prija mi atmosfera i kvalitet. Tačno ono što mi je trebalo.', rating: 4 },
    ],
    faq: seed.faq ?? [
      { question: 'Kako da zakažem termin?', answer: 'Najlakše kroz formu na ovom sajtu, ili nas pozovite telefonom.' },
      { question: 'Koje je radno vreme?', answer: 'Radnim danima od 09 do 17h, subotom do 14h.' },
      { question: 'Da li je potrebna akontacija?', answer: 'Za većinu usluga nije, o detaljima se dogovaramo unapred.' },
    ],
    gallery: seed.gallery ?? [
      { label: 'Naš rad', emoji: '✨' },
      { label: 'Prostor', emoji: '🏠' },
      { label: 'Detalji', emoji: '📸' },
    ],
    visibleBlocks: seed.blocks ?? DEFAULT_BLOCKS,
  };
}

const presets = presetSeeds.map(buildDraft);

function copyTemplate(templateId: string): SiteDraft {
  const found = presets.find((preset) => preset.templateId === templateId);
  return JSON.parse(JSON.stringify(found ?? presets[0])) as SiteDraft;
}

function slugify(value: string): string {
  const map: Record<string, string> = { č: 'c', ć: 'c', ž: 'z', š: 's', đ: 'd' };
  const slug = value
    .toLowerCase()
    .replace(/[čćžšđ]/g, (char) => map[char] ?? char)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || `sajt-${Date.now()}`;
}

// Pravi generički sajt za delatnost koje nema u katalogu.
function buildCustomDraft(name: string, businessType: string, bookingType: BookingType): SiteDraft {
  const base = copyTemplate('custom');
  const cleanName = name.trim() || 'Moj biznis';
  const cleanType = businessType.trim();
  return {
    ...base,
    templateId: 'custom',
    businessName: cleanName,
    slug: slugify(cleanName),
    tagline: cleanType ? `${cleanType} — usluga po vašoj meri.` : 'Usluga po vašoj meri.',
    description: `Dobrodošli u ${cleanName}.${cleanType ? ` Bavimo se: ${cleanType.toLowerCase()}.` : ''} Kontaktirajte nas i dogovorite termin.`,
    bookingType,
  };
}

function readBookings(): Booking[] {
  try {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    return saved ? (JSON.parse(saved) as Booking[]) : [];
  } catch {
    return [];
  }
}

function normalizeDraft(parsed: Partial<SiteDraft>): SiteDraft | null {
  if (!parsed.templateId || !Array.isArray(parsed.services) || !Array.isArray(parsed.visibleBlocks)) {
    return null;
  }
  const base = copyTemplate(parsed.templateId);
  const parsedAvailability = parsed.availability;
  const availability: Availability = parsedAvailability && Array.isArray(parsedAvailability.week) && parsedAvailability.week.length === 7
    ? {
        week: parsedAvailability.week.map((day, index) => ({
          open: Boolean(day?.open),
          start: day?.start || base.availability.week[index].start,
          end: day?.end || base.availability.week[index].end,
        })),
        slotMinutes: parsedAvailability.slotMinutes ?? base.availability.slotMinutes,
        bufferMinutes: parsedAvailability.bufferMinutes ?? base.availability.bufferMinutes,
        blockedDates: Array.isArray(parsedAvailability.blockedDates) ? parsedAvailability.blockedDates : base.availability.blockedDates,
      }
    : cloneAvailability(base.availability);
  return {
    ...base,
    ...parsed,
    categoryId: parsed.categoryId ?? base.categoryId,
    bookingType: parsed.bookingType ?? base.bookingType,
    icon: parsed.icon ?? base.icon,
    hours: parsed.hours ?? base.hours,
    reviews: parsed.reviews ?? base.reviews,
    faq: parsed.faq ?? base.faq,
    gallery: parsed.gallery ?? base.gallery,
    availability,
  };
}

function translateDbError(message: string): string {
  if (message.includes('duplicate key')) {
    return 'Poddomen je već zauzet na vašem nalogu. Promenite poddomen.';
  }
  if (message.includes('dozvoljava najviše')) {
    return message;
  }
  if (message.includes('row-level security')) {
    return 'Nemate dozvolu za ovu izmenu.';
  }
  return message;
}

export default function SiteBuilder() {
  const { ready: authReady, configured, user, profile, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');
  const [draft, setDraft] = useState<SiteDraft | null>(null);
  const [notice, setNotice] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingCount, setBookingCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>('all');
  const [blockedDateInput, setBlockedDateInput] = useState('');
  const [cloudSiteId, setCloudSiteId] = useState<string | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [authReason, setAuthReason] = useState('');
  const [authReturn, setAuthReturn] = useState<Screen>('home');
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('');
  const [customBooking, setCustomBooking] = useState<BookingType>('appointment');

  const requireAuth = (reason: string, returnTo: Screen) => {
    setAuthReason(reason);
    setAuthReturn(returnTo);
    setScreen('auth');
  };

  useEffect(() => {
    if (!authReady) return;

    let active = true;
    const loadInitialBookings = async () => {
      // U demo režimu (bez Supabase ključeva) upiti ostaju u pregledaču.
      if (!configured) {
        if (active) setBookings(readBookings());
        return;
      }

      // Bez prijave ne zovemo API — upiti su vezani za nalog.
      if (!user) {
        if (active) setBookings([]);
        return;
      }

      try {
        const client = getSupabaseClient();
        const token = client ? (await client.auth.getSession()).data.session?.access_token : null;
        if (!token) return;

        const res = await fetch('/api/leads', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && active) {
          const data = (await res.json()) as { leads?: LeadRow[] };
          setBookings((data.leads ?? []).map(mapLead));
        }
      } catch (err) {
        console.error('Greška pri učitavanju upita:', err);
      }
    };
    void loadInitialBookings();
    return () => { active = false; };
  }, [authReady, user, configured]);

  const openDraft = (next: SiteDraft) => {
    setDraft(next);
    setCloudSiteId(null);
    setBookingMessage('');
    setNotice('');
    setScreen('editor');
  };

  const openTemplate = (templateId: string) => openDraft(copyTemplate(templateId));

  const updateDraft = <K extends keyof SiteDraft>(key: K, value: SiteDraft[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setNotice('');
  };

  const saveToCloud = async (): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client || !user || !draft) return false;

    setCloudBusy(true);
    try {
      if (!cloudSiteId) {
        const { count, error: countError } = await client
          .from('sites')
          .select('id', { count: 'exact' })
          .eq('owner_id', user.id);
        if (countError) {
          setNotice(`Sajt nije sačuvan na nalog: ${translateDbError(countError.message)}`);
          return false;
        }
        const limit = siteLimitForPlan(profile?.plan);
        if ((count ?? 0) >= limit) {
          setNotice(`Plan „${planName(profile?.plan)}“ dozvoljava ${limit} ${limit === 1 ? 'sajt' : 'sajta'}. Nadogradite plan za više.`);
          return false;
        }
      }

      const payload = {
        owner_id: user.id,
        name: draft.businessName.trim() || 'Moj sajt',
        slug: draft.slug.trim() || `sajt-${Date.now()}`,
        template_id: draft.templateId,
        category_id: draft.categoryId,
        draft,
      };

      const result = cloudSiteId
        ? await client.from('sites').update(payload).eq('id', cloudSiteId).select('id').single()
        : await client.from('sites').insert(payload).select('id').single();

      if (result.error) {
        setNotice(`Sajt nije sačuvan na nalog: ${translateDbError(result.error.message)}`);
        return false;
      }

      setCloudSiteId(result.data.id);
      setNotice('Sajt je sačuvan na vaš nalog.');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nepoznata greška.';
      setNotice(`Sajt nije sačuvan na nalog: ${message}`);
      return false;
    } finally {
      setCloudBusy(false);
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      setNotice('Nacrt nije sačuvan. Proverite podešavanja pregledača.');
      return;
    }

    if (configured && user) {
      await saveToCloud();
      return;
    }

    setNotice('Nacrt je sačuvan u ovom pregledaču. Prijavite se da ga sačuvate na nalog.');
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) {
        setNotice('Još nemate sačuvan nacrt. Izaberite šablon da biste počeli.');
        return;
      }
      const parsed = normalizeDraft(JSON.parse(saved) as Partial<SiteDraft>);
      if (!parsed) {
        throw new Error('Neispravan nacrt');
      }
      setDraft(parsed);
      setCloudSiteId(null);
      setNotice('Učitali smo vaš poslednji nacrt.');
      setScreen('editor');
    } catch {
      setNotice('Sačuvani nacrt ne može da se učita. Započnite novi sajt.');
    }
  };

  const openCloudSite = (site: SiteRecord) => {
    const parsed = normalizeDraft(site.draft as Partial<SiteDraft>);
    if (!parsed) {
      setNotice('Sačuvani sajt nije moguće učitati.');
      return;
    }
    setDraft(parsed);
    setCloudSiteId(site.id);
    setBookingMessage('');
    setNotice(`Učitali smo „${site.name}“ sa naloga.`);
    setScreen('editor');
  };

  const handleSignOut = async () => {
    await signOut();
    setCloudSiteId(null);
    setScreen('home');
    setNotice('Odjavljeni ste.');
  };

  const openBookings = async () => {
    if (configured && authReady && !user) {
      requireAuth('Prijavite se da vidite upite sa svojih sajtova.', 'bookings');
      return;
    }

    setScreen('bookings');
    try {
      const client = getSupabaseClient();
      const token = client ? (await client.auth.getSession()).data.session?.access_token : null;
      const res = await fetch('/api/leads', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = (await res.json()) as { leads?: LeadRow[] };
        setBookings((data.leads ?? []).map(mapLead));
        return;
      }
      if (res.status === 401) {
        requireAuth('Prijavite se da vidite upite sa svojih sajtova.', 'bookings');
        return;
      }
    } catch (err) {
      console.error('Greška pri učitavanju upita:', err);
    }
    setBookings(readBookings());
  };

  const handleBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const booking: Booking = {
      id: `${Date.now()}`,
      businessName: draft.businessName,
      clientName: String(formData.get('clientName') ?? ''),
      phone: String(formData.get('clientPhone') ?? ''),
      service: String(formData.get('service') ?? ''),
      date: String(formData.get('date') ?? ''),
      time: String(formData.get('time') ?? ''),
      siteId: cloudSiteId,
    };

    const saveLocally = () => {
      const nextBookings = [...readBookings(), booking];
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(nextBookings));
    };

    try {
      const client = getSupabaseClient();
      const token = client ? (await client.auth.getSession()).data.session?.access_token : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers,
        body: JSON.stringify(booking),
      });

      if (res.ok) {
        setBookings((current) => [...current, booking]);
        setBookingMessage('Hvala! Vaš zahtev je poslat biznisu.');
        setBookingCount((current) => current + 1);
        form.reset();
        return;
      }

      saveLocally();
      setBookings((current) => [...current, booking]);
      setBookingMessage('Zahtev je sačuvan u ovom pregledaču (demo režim).');
      setBookingCount((current) => current + 1);
      form.reset();
    } catch (err) {
      console.error('Greška pri slanju upita:', err);
      saveLocally();
      setBookings((current) => [...current, booking]);
      setBookingMessage('Zahtev je sačuvan u ovom pregledaču (demo režim).');
      setBookingCount((current) => current + 1);
      form.reset();
    }
  };

  const toggleBlock = (blockId: BlockId) => {
    if (!draft) return;
    const next = draft.visibleBlocks.includes(blockId)
      ? draft.visibleBlocks.filter((block) => block !== blockId)
      : [...draft.visibleBlocks, blockId];
    updateDraft('visibleBlocks', next);
  };

  const updateWeekDay = (index: number, patch: Partial<DayAvailability>) => {
    if (!draft) return;
    updateDraft('availability', {
      ...draft.availability,
      week: draft.availability.week.map((day, i) => i === index ? { ...day, ...patch } : day),
    });
  };

  const addBlockedDate = () => {
    if (!draft || !blockedDateInput) return;
    if (draft.availability.blockedDates.includes(blockedDateInput)) {
      setBlockedDateInput('');
      return;
    }
    updateDraft('availability', {
      ...draft.availability,
      blockedDates: [...draft.availability.blockedDates, blockedDateInput].sort(),
    });
    setBlockedDateInput('');
  };

  const removeBlockedDate = (value: string) => {
    if (!draft) return;
    updateDraft('availability', {
      ...draft.availability,
      blockedDates: draft.availability.blockedDates.filter((date) => date !== value),
    });
  };

  // Generički šablon se prikazuje kao posebna kartica, ne u mreži preseta.
  const visiblePresets = (categoryFilter === 'all'
    ? presets
    : presets.filter((preset) => preset.categoryId === categoryFilter))
    .filter((preset) => preset.templateId !== 'custom');
  const showCustomCard = categoryFilter === 'all' || categoryFilter === 'other';
  const presetCount = presets.length - 1;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <button className="flex items-center gap-3 text-left" onClick={() => { setScreen('home'); setNotice(''); }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">Di</span>
            <span>
              <span className="block text-lg font-black tracking-tight">DiV<span className="text-indigo-600">.ai</span></span>
              <span className="hidden text-[11px] font-medium text-slate-500 sm:block">Web sajtovi i aplikacije za biznise</span>
            </span>
          </button>
          <nav className="hidden items-center gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold sm:flex sm:text-sm">
            <button onClick={() => { setScreen('home'); setNotice(''); }} className={`rounded-xl px-3 py-2 transition ${screen === 'home' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Početna</button>
            <button onClick={() => setScreen('pricing')} className={`rounded-xl px-3 py-2 transition ${screen === 'pricing' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Cenovnik</button>
            <button onClick={openBookings} className={`rounded-xl px-3 py-2 transition ${screen === 'bookings' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Upiti</button>
          </nav>
          <div className="flex items-center gap-2">
            {screen === 'editor' && (
              <button onClick={() => void saveDraft()} disabled={cloudBusy} className="rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:px-4 sm:text-sm">
                {cloudBusy ? 'Čuvam…' : configured && user ? 'Sačuvaj na nalog' : 'Sačuvaj nacrt'}
              </button>
            )}
            {authReady && user ? (
              <button onClick={() => setScreen('account')} className={`flex items-center gap-2 rounded-xl border p-1.5 pr-2 transition ${screen === 'account' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">
                  {(profile?.full_name || user.email || '?').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[120px] truncate text-[11px] font-black text-slate-800">{profile?.full_name || user.email}</span>
                  <span className="block text-[10px] font-semibold text-slate-500">{planName(profile?.plan)}</span>
                </span>
              </button>
            ) : (
              <button onClick={() => requireAuth('Prijavite se da sačuvate sajtove i upravljate pretplatom.', 'home')} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700">
                Prijava
              </button>
            )}
          </div>
        </div>
      </header>

      {screen === 'home' && (
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white md:px-14 md:py-16">
            <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 rounded-full bg-indigo-600/30 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-rose-500/20 blur-[100px]" />
            <div className="relative grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Bez komplikacija. Bez AI-ja.
                </span>
                <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight md:text-6xl">Sajt spreman za <span className="text-indigo-300">svaki biznis.</span></h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">Izaberite delatnost, unesite svoje podatke i prilagodite blokove. Za nekoliko minuta imate pregled sajta sa formom za upite ili zakazivanje.</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#templates" className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-indigo-100">Izaberi šablon <span aria-hidden="true">→</span></a>
                  <button onClick={() => setScreen('pricing')} className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Cenovnik i planovi</button>
                  <button onClick={loadDraft} className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Učitaj nacrt</button>
                </div>
                {notice && <p role="status" className="mt-4 text-sm text-indigo-200">{notice}</p>}
              </div>
              <div className="relative mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur">
                <div className="overflow-hidden rounded-[1.2rem] bg-[#fcfaf8] text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><span className="text-xs font-black">Studio Lena</span><span className="text-[10px] text-slate-500">Početna&nbsp;&nbsp; Usluge&nbsp;&nbsp; Kontakt</span></div>
                  <div className="px-6 py-9 text-center" style={{ background: 'linear-gradient(135deg, #f4e8e7, #fcfaf8)' }}>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-800">Vaš trenutak za sebe</span>
                    <h2 className="mt-3 text-3xl font-black tracking-tight">Vreme je da<br />zablistate.</h2>
                    <p className="mx-auto mt-3 max-w-[220px] text-[10px] leading-5 text-slate-600">Nega, stil i dobra energija — sve na jednom mestu.</p>
                    <span className="mt-5 inline-block rounded-full bg-rose-800 px-4 py-2 text-[9px] font-bold text-white">Zakaži termin</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4"><div className="h-16 rounded-xl bg-[#f3eeee]"/><div className="h-16 rounded-xl bg-[#f3eeee]"/></div>
                </div>
                <div className="absolute -bottom-4 -left-5 rounded-2xl bg-white px-4 py-3 shadow-xl"><p className="text-[10px] font-bold text-emerald-700">● spremno za mobilni</p><p className="mt-1 text-[9px] text-slate-500">Pregled uživo dok uređujete</p></div>
              </div>
            </div>
          </section>

          <section id="templates" className="scroll-mt-24 pt-16">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Počnite od šablona</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Čime se bavite?</h2>
                <p className="mt-2 text-sm text-slate-500">Izaberite delatnost, pa šablon koji vam odgovara. Ako vaše delatnosti nema na listi, napravite sajt za nju u nekoliko klikova.</p>
              </div>
              <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500">{presetCount} šablona</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => setCategoryFilter('all')} className={`rounded-full px-4 py-2 text-xs font-bold transition ${categoryFilter === 'all' ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>Sve delatnosti</button>
              {categories.map((category) => (
                <button key={category.id} onClick={() => setCategoryFilter(category.id)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${categoryFilter === category.id ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{category.icon} {category.label}</button>
              ))}
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {showCustomCard && (
                <article className="flex flex-col overflow-hidden rounded-3xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-6 transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-xl">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">✨</span>
                  <h3 className="mt-4 text-lg font-black tracking-tight">Druga delatnost</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Vaš biznis nije na listi? Unesite naziv i delatnost — pripremićemo strukturu koju dalje uređujete.
                  </p>
                  <button onClick={() => setCustomOpen(true)} className="mt-auto pt-5 text-left text-xs font-extrabold text-indigo-700 transition hover:text-indigo-900">
                    Napravi svoj sajt <span aria-hidden="true">→</span>
                  </button>
                </article>
              )}
              {visiblePresets.map((preset) => {
                const category = categories.find((item) => item.id === preset.categoryId);
                return (
                  <TemplateCard
                    key={preset.templateId}
                    eyebrow={category?.label ?? ''}
                    title={presetName(preset.templateId)}
                    description={preset.description}
                    color={preset.accentColor}
                    icon={preset.icon}
                    preview={preset.businessName}
                    bookingType={bookingTypes.find((type) => type.id === preset.bookingType)?.label ?? ''}
                    onChoose={() => openTemplate(preset.templateId)}
                  />
                );
              })}
            </div>
          </section>

          <section className="mt-12 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-3 sm:p-7">
            <Feature icon="1" title="Izaberite delatnost" text="Krećete od strukture prilagođene vašem poslu." />
            <Feature icon="2" title="Unesite svoje podatke" text="Izmenite naziv, tekst, boju, usluge i kontakt." />
            <Feature icon="3" title="Pregledajte i sačuvajte" text="Sačuvajte na nalog ili u pregledaču i nastavite kasnije." />
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Mesečno održavanje</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Jedna cena, sve uključeno.</h2>
                <p className="mt-2 text-sm text-slate-500">Hosting, izmene, podrška i zakazivanje — bez skrivenih troškova.</p>
              </div>
              <button onClick={() => setScreen('pricing')} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700">Pogledaj cenovnik <span aria-hidden="true">→</span></button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`rounded-2xl border p-4 ${plan.highlighted ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'}`}>
                  <p className="text-xs font-black text-slate-800">{plan.name}</p>
                  <p className="mt-1 text-xl font-black">{plan.monthly} € <span className="text-[10px] font-semibold text-slate-500">/ mes</span></p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">{plan.tagline}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-6 text-center text-xs text-slate-400">Sajtovi se čuvaju na vašem nalogu, a upiti iz forme stižu u Supabase bazu.</p>
        </div>
      )}

      {screen === 'editor' && draft && (
        <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-5 md:px-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button aria-label="Nazad na izbor šablona" onClick={() => setScreen('home')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:bg-slate-100">←</button>
              <div><p className="text-xs font-bold text-indigo-700">UREĐIVAČ ŠABLONA</p><h1 className="text-lg font-black">Prilagodite svoj sajt</h1></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:inline-flex">● Pregled uživo</span>
              <span className="hidden rounded-full bg-white px-3 py-2 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200 md:inline-flex">
                {cloudSiteId ? 'Na nalogu' : configured && user ? 'Nije na nalogu' : 'Lokalni nacrt'}
              </span>
              <button onClick={() => void saveDraft()} disabled={cloudBusy} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60">
                {cloudBusy ? 'Čuvam…' : configured && user ? 'Sačuvaj na nalog' : 'Sačuvaj nacrt'}
              </button>
            </div>
          </div>

          {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}

          <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <EditorCard title="Osnovni podaci" subtitle="Informacije koje će posetioci videti na sajtu.">
                <Field label="Naziv biznisa" value={draft.businessName} onChange={(value) => updateDraft('businessName', value)} />
                <Field label="Kratka poruka" value={draft.tagline} onChange={(value) => updateDraft('tagline', value)} />
                <label className="block text-xs font-bold text-slate-600">Opis biznisa<textarea rows={3} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Telefon" value={draft.phone} onChange={(value) => updateDraft('phone', value)} />
                  <Field label="Email" value={draft.email} onChange={(value) => updateDraft('email', value)} type="email" />
                </div>
                <Field label="Adresa" value={draft.address} onChange={(value) => updateDraft('address', value)} />
                <Field label="Poddomen (demo)" value={draft.slug} onChange={(value) => updateDraft('slug', value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
                <label className="block text-xs font-bold text-slate-600">Način zakazivanja<select value={draft.bookingType} onChange={(event) => updateDraft('bookingType', event.target.value as BookingType)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-400 focus:bg-white">{bookingTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <label htmlFor="accent-color" className="text-xs font-bold text-slate-600">Boja sajta</label>
                  <div className="flex items-center gap-2"><span className="font-mono text-xs text-slate-500">{draft.accentColor}</span><input id="accent-color" type="color" value={draft.accentColor} onChange={(event) => updateDraft('accentColor', event.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent" /></div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo adresa</p><p className="mt-1 text-sm font-semibold text-indigo-700">{draft.slug}.div.ai</p></div>
              </EditorCard>

              <EditorCard title="Blokovi na sajtu" subtitle="Uključite samo sekcije koje su vam potrebne.">
                <div className="space-y-2">
                  {blockOptions.map((block) => {
                    const active = draft.visibleBlocks.includes(block.id);
                    return <button key={block.id} type="button" aria-pressed={active} onClick={() => toggleBlock(block.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active ? 'border-indigo-200 bg-indigo-50/70' : 'border-slate-100 bg-slate-50 opacity-70 hover:opacity-100'}`}>
                      <span className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${active ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`h-4 w-4 rounded-full bg-white transition ${active ? 'translate-x-4' : ''}`} /></span>
                      <span><span className="block text-xs font-extrabold text-slate-800">{block.label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{block.description}</span></span>
                    </button>;
                  })}
                </div>
              </EditorCard>

              <EditorCard title="Radno vreme" subtitle="Podesite vreme prikazano u pregledu sajta.">
                <Field label="Ponedeljak – petak" value={draft.hours.weekdays} onChange={(value) => updateDraft('hours', { ...draft.hours, weekdays: value })} />
                <Field label="Subota" value={draft.hours.saturday} onChange={(value) => updateDraft('hours', { ...draft.hours, saturday: value })} />
                <Field label="Nedelja" value={draft.hours.sunday} onChange={(value) => updateDraft('hours', { ...draft.hours, sunday: value })} />
              </EditorCard>

              <EditorCard title="Dostupnost i termini" subtitle="Odredite kada klijenti mogu da zakažu i koliko traje termin.">
                <div className="space-y-1.5">
                  {draft.availability.week.map((day, index) => (
                    <div key={WEEKDAY_LABELS[index]} className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-pressed={day.open}
                          aria-label={`${WEEKDAY_FULL[index]} ${day.open ? 'otvoreno' : 'zatvoreno'}`}
                          onClick={() => updateWeekDay(index, { open: !day.open })}
                          className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${day.open ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                          <span className={`h-4 w-4 rounded-full bg-white transition ${day.open ? 'translate-x-4' : ''}`} />
                        </button>
                        <span className="w-20 shrink-0 text-[11px] font-bold text-slate-700">{WEEKDAY_FULL[index]}</span>
                        {day.open ? (
                          <div className="ml-auto flex items-center gap-1">
                            <input
                              type="time"
                              aria-label={`Početak – ${WEEKDAY_FULL[index]}`}
                              value={day.start}
                              onChange={(event) => updateWeekDay(index, { start: event.target.value })}
                              className="w-[76px] rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold outline-none focus:border-indigo-400"
                            />
                            <span className="text-[10px] text-slate-400">–</span>
                            <input
                              type="time"
                              aria-label={`Kraj – ${WEEKDAY_FULL[index]}`}
                              value={day.end}
                              onChange={(event) => updateWeekDay(index, { end: event.target.value })}
                              className="w-[76px] rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold outline-none focus:border-indigo-400"
                            />
                          </div>
                        ) : (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-slate-400">Zatvoreno</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-bold text-slate-600">
                    Dužina termina
                    <select
                      value={draft.availability.slotMinutes}
                      onChange={(event) => updateDraft('availability', { ...draft.availability, slotMinutes: Number(event.target.value) })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                    >
                      {SLOT_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    Pauza između
                    <select
                      value={draft.availability.bufferMinutes}
                      onChange={(event) => updateDraft('availability', { ...draft.availability, bufferMinutes: Number(event.target.value) })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                    >
                      {BUFFER_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes === 0 ? 'Bez pauze' : `${minutes} min`}</option>)}
                    </select>
                  </label>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Blokirani datumi</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="date"
                      aria-label="Datum za blokiranje"
                      value={blockedDateInput}
                      min={toISODate(new Date())}
                      onChange={(event) => setBlockedDateInput(event.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={addBlockedDate}
                      disabled={!blockedDateInput}
                      className="rounded-lg bg-slate-950 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Dodaj
                    </button>
                  </div>
                  {draft.availability.blockedDates.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {draft.availability.blockedDates.map((date) => (
                        <span key={date} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                          {date}
                          <button type="button" aria-label={`Ukloni blokadu ${date}`} onClick={() => removeBlockedDate(date)} className="text-rose-500 hover:text-rose-700">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-[10px] leading-4 text-slate-400">Blokirani dani se ne prikazuju kao slobodni u kalendaru.</p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadIcs(draft)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  Preuzmi kalendar (.ics)
                </button>
                <p className="text-[10px] leading-4 text-slate-400">Fajl se otvara u Google, Apple ili Outlook kalendaru i prikazuje radno vreme naredna 3 meseca.</p>
              </EditorCard>

              <EditorCard title="Usluge" subtitle="Ove stavke se prikazuju na sajtu i u formi.">
                <div className="space-y-3">
                  {draft.services.map((service, index) => <div key={`${draft.templateId}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between"><label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Usluga {index + 1}</label><button type="button" disabled={draft.services.length <= 1} aria-label={`Ukloni uslugu ${index + 1}`} onClick={() => updateDraft('services', draft.services.filter((_, i) => i !== index))} className="text-[10px] font-bold text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-30">Ukloni</button></div>
                    <input aria-label={`Naziv usluge ${index + 1}`} value={service.name} onChange={(event) => updateDraft('services', draft.services.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} className="w-full border-b border-slate-100 pb-2 text-sm font-bold outline-none focus:border-indigo-300" />
                    <textarea aria-label={`Opis usluge ${index + 1}`} rows={2} value={service.description} onChange={(event) => updateDraft('services', draft.services.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} className="mt-2 w-full resize-y text-xs leading-5 text-slate-500 outline-none focus:text-slate-800" />
                    <input aria-label={`Cena usluge ${index + 1}`} value={service.price} onChange={(event) => updateDraft('services', draft.services.map((item, i) => i === index ? { ...item, price: event.target.value } : item))} className="mt-1 w-full rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-bold text-indigo-700 outline-none focus:ring-1 focus:ring-indigo-300" />
                  </div>)}
                  <button type="button" onClick={() => updateDraft('services', [...draft.services, { name: 'Nova usluga', description: 'Dodajte kratak opis usluge.', price: 'Po dogovoru' }])} className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">+ Dodaj uslugu</button>
                </div>
              </EditorCard>

              <EditorCard title="Recenzije" subtitle="Utisci koji grade poverenje.">
                <div className="space-y-3">
                  {draft.reviews.map((review, index) => <div key={`${draft.templateId}-review-${index}`} className="rounded-2xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between"><label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Recenzija {index + 1}</label><button type="button" disabled={draft.reviews.length <= 1} aria-label={`Ukloni recenziju ${index + 1}`} onClick={() => updateDraft('reviews', draft.reviews.filter((_, i) => i !== index))} className="text-[10px] font-bold text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-30">Ukloni</button></div>
                    <input aria-label={`Ime recenzije ${index + 1}`} value={review.name} onChange={(event) => updateDraft('reviews', draft.reviews.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} className="w-full border-b border-slate-100 pb-2 text-sm font-bold outline-none focus:border-indigo-300" />
                    <textarea aria-label={`Tekst recenzije ${index + 1}`} rows={2} value={review.text} onChange={(event) => updateDraft('reviews', draft.reviews.map((item, i) => i === index ? { ...item, text: event.target.value } : item))} className="mt-2 w-full resize-y text-xs leading-5 text-slate-500 outline-none focus:text-slate-800" />
                  </div>)}
                  <button type="button" onClick={() => updateDraft('reviews', [...draft.reviews, { name: 'Novi klijent', text: 'Odlično iskustvo, sve preporuke.', rating: 5 }])} className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">+ Dodaj recenziju</button>
                </div>
              </EditorCard>

              <EditorCard title="Česta pitanja" subtitle="Odgovori koji smanjuju broj poziva.">
                <div className="space-y-3">
                  {draft.faq.map((item, index) => <div key={`${draft.templateId}-faq-${index}`} className="rounded-2xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between"><label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Pitanje {index + 1}</label><button type="button" disabled={draft.faq.length <= 1} aria-label={`Ukloni pitanje ${index + 1}`} onClick={() => updateDraft('faq', draft.faq.filter((_, i) => i !== index))} className="text-[10px] font-bold text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-30">Ukloni</button></div>
                    <input aria-label={`Pitanje ${index + 1}`} value={item.question} onChange={(event) => updateDraft('faq', draft.faq.map((entry, i) => i === index ? { ...entry, question: event.target.value } : entry))} className="w-full border-b border-slate-100 pb-2 text-sm font-bold outline-none focus:border-indigo-300" />
                    <textarea aria-label={`Odgovor ${index + 1}`} rows={2} value={item.answer} onChange={(event) => updateDraft('faq', draft.faq.map((entry, i) => i === index ? { ...entry, answer: event.target.value } : entry))} className="mt-2 w-full resize-y text-xs leading-5 text-slate-500 outline-none focus:text-slate-800" />
                  </div>)}
                  <button type="button" onClick={() => updateDraft('faq', [...draft.faq, { question: 'Novo pitanje', answer: 'Vaš odgovor ovde.' }])} className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">+ Dodaj pitanje</button>
                </div>
              </EditorCard>
            </aside>

            <section className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-200/70 p-2 shadow-sm md:p-4">
              <div className="mb-2 flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:px-3">
                <span className="flex items-center gap-2"><span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-red-400"/><i className="h-2 w-2 rounded-full bg-amber-400"/><i className="h-2 w-2 rounded-full bg-emerald-400"/></span> Pregled sajta</span>
                <span className="hidden sm:inline">{draft.slug}.div.ai</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-slate-500">Desktop / mobilni</span>
              </div>
              <SitePreview key={bookingCount} draft={draft} onBooking={handleBooking} bookingMessage={bookingMessage} bookings={bookings} />
            </section>
          </div>
        </div>
      )}

      {screen === 'pricing' && (
        <PricingScreen
          onBack={() => setScreen('home')}
          onRequireAuth={() => requireAuth('Prijavite se da izaberete plan i pokrenete pretplatu.', 'pricing')}
          siteId={cloudSiteId}
        />
      )}

      {screen === 'auth' && (
        <AuthScreen
          onBack={() => setScreen(authReturn)}
          onDone={() => { setAuthReason(''); setScreen(authReturn); }}
          reason={authReason}
        />
      )}

      {screen === 'account' && (
        <AccountScreen
          onBack={() => setScreen('home')}
          onRequireAuth={() => requireAuth('Prijavite se da pristupite nalogu.', 'account')}
          onOpenPricing={() => setScreen('pricing')}
          onCreateSite={() => setScreen('home')}
          onEditSite={openCloudSite}
          onSignOut={() => void handleSignOut()}
        />
      )}

      {screen === 'bookings' && (
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Kontrolna tabla</p><h1 className="mt-2 text-3xl font-black tracking-tight">Upiti za termine</h1><p className="mt-2 text-sm text-slate-500">{user ? 'Zahtevi sa sajtova sačuvanih na vašem nalogu.' : 'Zahtevi poslati kroz formu sajta stižu ovde, iz Supabase baze.'}</p></div>
            <button onClick={() => setScreen('home')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50">Napravi sajt</button>
          </div>
          <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 sm:grid-cols-4">
              <Stat label="Ukupno upita" value={bookings.length.toString()} />
              <Stat label="Novi" value={bookings.length.toString()} />
              <Stat label="Biznisi sa upitima" value={new Set(bookings.map((booking) => booking.businessName)).size.toString()} />
              <Stat label="Povezivanje" value={configured ? 'Nalog' : 'Demo'} />
            </div>
            {bookings.length === 0 ? <div className="px-6 py-16 text-center"><span className="text-4xl">📭</span><h2 className="mt-4 text-lg font-black">Još nema upita</h2><p className="mt-1 text-sm text-slate-500">Pošaljite probni zahtev kroz formu u pregledu sajta.</p><button onClick={() => { setScreen('home'); loadDraft(); }} className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Otvori sačuvani sajt</button></div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Klijent</th><th className="px-5 py-3">Biznis</th><th className="px-5 py-3">Usluga</th><th className="px-5 py-3">Termin</th><th className="px-5 py-3">Telefon</th></tr></thead><tbody className="divide-y divide-slate-100">{bookings.map((booking) => <tr key={booking.id}><td className="px-5 py-4 font-bold">{booking.clientName}</td><td className="px-5 py-4">{booking.businessName}</td><td className="px-5 py-4">{booking.service}</td><td className="px-5 py-4">{booking.date} · {booking.time}</td><td className="px-5 py-4">{booking.phone}</td></tr>)}</tbody></table></div>}
          </div>
          <p className="mt-4 text-xs text-slate-400">{user ? 'Prikazuju se samo upiti za sajtove sa vašeg naloga.' : 'Upiti se čuvaju u Supabase bazi. Ako baza nije povezana, prikazuju se podaci iz ovog pregledača.'}</p>
        </div>
      )}
      {customOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight">Napravite svoj sajt</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Za bilo koju delatnost. Unesite osnovne podatke — sve ostalo menjate u uređivaču.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                aria-label="Zatvori"
                className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const next = buildCustomDraft(customName, customType, customBooking);
                setCustomOpen(false);
                setCustomName('');
                setCustomType('');
                openDraft(next);
              }}
              className="mt-5 space-y-3"
            >
              <label className="block text-xs font-bold text-slate-600">
                Naziv biznisa
                <input
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  required
                  placeholder="npr. Studio Mirko"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <label className="block text-xs font-bold text-slate-600">
                Čime se bavite?
                <input
                  value={customType}
                  onChange={(event) => setCustomType(event.target.value)}
                  placeholder="npr. popravka bicikala"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <label className="block text-xs font-bold text-slate-600">
                Kako primate klijente?
                <select
                  value={customBooking}
                  onChange={(event) => setCustomBooking(event.target.value as BookingType)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                >
                  {bookingTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700">
                Napravi sajt
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function presetName(templateId: string): string {
  const seed = presetSeeds.find((item) => item.id === templateId);
  return seed?.name ?? 'Šablon';
}

function TemplateCard({ eyebrow, title, description, color, icon, preview, bookingType, onChoose }: { eyebrow: string; title: string; description: string; color: string; icon: string; preview: string; bookingType: string; onChoose: () => void }) {
  return <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
    <div className="relative h-40 overflow-hidden p-5" style={{ background: `linear-gradient(135deg, ${color}18, #ffffff 80%)` }}>
      <div className="absolute -right-6 -top-12 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: color }} />
      <div className="relative mx-auto max-w-[260px] rounded-2xl border border-white bg-white/90 p-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2"><span className="text-[10px] font-black">{preview}</span><span className="text-[8px] text-slate-400">Početna　 Usluge　 Kontakt</span></div>
        <div className="py-4 text-center"><span className="text-xl">{icon}</span><div className="mx-auto mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: color }} /></div>
        <div className="grid grid-cols-3 gap-2"><span className="h-8 rounded-lg bg-slate-100"/><span className="h-8 rounded-lg bg-slate-100"/><span className="h-8 rounded-lg bg-slate-100"/></div>
      </div>
      <span className="absolute bottom-3 right-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm">Spreman šablon</span>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.17em]" style={{ color }}>{eyebrow}</p>
      <div className="mt-1 flex items-start justify-between gap-3"><h3 className="text-lg font-black tracking-tight">{title}</h3><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base" style={{ backgroundColor: `${color}15` }}>{icon}</span></div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2"><Pill>{bookingType}</Pill><Pill>Kalendar dostupnosti</Pill></div>
      <button onClick={onChoose} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold text-white transition hover:brightness-110" style={{ backgroundColor: color }}>Uredi ovaj šablon <span aria-hidden="true">→</span></button>
    </div>
  </article>;
}

function SitePreview({ draft, onBooking, bookingMessage, bookings }: { draft: SiteDraft; onBooking: (event: FormEvent<HTMLFormElement>) => void; bookingMessage: string; bookings: Booking[] }) {
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

  return <div className="mx-auto min-h-[740px] max-w-[980px] overflow-hidden rounded-2xl bg-white shadow-lg" style={{ '--site-accent': draft.accentColor } as React.CSSProperties}>
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

function EditorCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4"><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-[10px] leading-4 text-slate-500">{subtitle}</p></div><div className="space-y-3">{children}</div></section>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block min-w-0 text-xs font-bold text-slate-600">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white" /></label>;
}

function PreviewInput({ label, name, placeholder, type = 'text', required = false }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="block text-left text-[9px] font-bold text-slate-600">{label}<input name={name} type={type} placeholder={placeholder} required={required} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none transition placeholder:text-slate-300 focus:border-indigo-400" /></label>;
}

function HoursRow({ day, time }: { day: string; time: string }) {
  return <div className="flex justify-between gap-3 border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0"><span className="text-slate-600">{day}</span><span className="font-bold text-slate-800">{time}</span></div>;
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="flex gap-3 rounded-2xl p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-black text-indigo-700">{icon}</span><span><span className="block text-sm font-extrabold">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{text}</span></span></div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">{children}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>;
}
