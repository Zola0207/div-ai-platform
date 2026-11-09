import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isServerSupabaseConfigured } from '@/lib/api-auth';
import PublicSite from '@/components/public-site';
import type { Availability, Booking, SiteDraft } from '@/components/site-preview';

const BLOCK_IDS = ['hero', 'about', 'services', 'gallery', 'reviews', 'faq', 'hours', 'booking', 'map', 'contact'] as const;
const DEFAULT_BLOCKS: SiteDraft['visibleBlocks'] = ['hero', 'about', 'services', 'gallery', 'reviews', 'faq', 'hours', 'booking', 'contact'];
const BOOKING_TYPES = ['appointment', 'reservation', 'group', 'consultation', 'quote'] as const;

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

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
}

function sanitizeAvailability(value: unknown): Availability {
  const data = (value ?? {}) as Record<string, unknown>;
  const week = Array.isArray(data.week) && data.week.length === 7
    ? (data.week as Record<string, unknown>[]).map((day, index) => ({
        open: Boolean(day?.open),
        start: text(day?.start, DEFAULT_AVAILABILITY.week[index].start),
        end: text(day?.end, DEFAULT_AVAILABILITY.week[index].end),
      }))
    : DEFAULT_AVAILABILITY.week;

  return {
    week,
    slotMinutes: typeof data.slotMinutes === 'number' && data.slotMinutes > 0 ? data.slotMinutes : 30,
    bufferMinutes: typeof data.bufferMinutes === 'number' && data.bufferMinutes >= 0 ? data.bufferMinutes : 10,
    blockedDates: Array.isArray(data.blockedDates) ? data.blockedDates.filter((item): item is string => typeof item === 'string') : [],
  };
}

function sanitizeDraft(raw: unknown): SiteDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const businessName = text(data.businessName);
  if (!businessName) return null;

  const accent = text(data.accentColor, '#4f46e5');
  const bookingType = BOOKING_TYPES.find((type) => type === data.bookingType) ?? 'appointment';
  const hours = (data.hours ?? {}) as Record<string, unknown>;

  return {
    templateId: text(data.templateId, 'custom'),
    categoryId: text(data.categoryId, 'other'),
    bookingType,
    icon: text(data.icon, '✨'),
    businessName,
    businessType: text(data.businessType) || undefined,
    logoUrl: text(data.logoUrl) || undefined,
    heroImageUrl: text(data.heroImageUrl) || undefined,
    slug: text(data.slug),
    tagline: text(data.tagline),
    description: text(data.description),
    phone: text(data.phone),
    email: text(data.email),
    address: text(data.address),
    hours: {
      weekdays: text(hours.weekdays, '09:00 – 17:00'),
      saturday: text(hours.saturday, '09:00 – 14:00'),
      sunday: text(hours.sunday, 'Zatvoreno'),
    },
    accentColor: /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#4f46e5',
    services: records(data.services)
      .map((service) => ({
        name: text(service.name),
        description: text(service.description),
        price: text(service.price),
        durationMinutes: Number(service.durationMinutes) > 0 ? Number(service.durationMinutes) : undefined,
        durationDays: Number(service.durationDays) > 0 ? Number(service.durationDays) : undefined,
      }))
      .filter((service) => service.name),
    reviews: records(data.reviews)
      .map((review) => ({
        name: text(review.name),
        text: text(review.text),
        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
      }))
      .filter((review) => review.text),
    faq: records(data.faq)
      .map((item) => ({ question: text(item.question), answer: text(item.answer) }))
      .filter((item) => item.question && item.answer),
    gallery: records(data.gallery)
      .map((item) => ({ label: text(item.label), emoji: text(item.emoji, '📸'), imageUrl: text(item.imageUrl) || undefined }))
      .filter((item) => item.label),
    visibleBlocks: Array.isArray(data.visibleBlocks)
      ? (data.visibleBlocks.filter((block): block is SiteDraft['visibleBlocks'][number] =>
          BLOCK_IDS.includes(block as (typeof BLOCK_IDS)[number]),
        ))
      : DEFAULT_BLOCKS,
    availability: sanitizeAvailability(data.availability),
  };
}

type PageParams = { params: Promise<{ slug: string }> };

type PublishedSite = {
  id: string;
  slug: string;
  draft: unknown;
};

async function loadSite(slug: string): Promise<PublishedSite | null> {
  if (!isServerSupabaseConfigured()) return null;
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sites')
      .select('id, slug, draft')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return (data as PublishedSite | null) ?? null;
  } catch {
    return null;
  }
}

async function loadBookings(siteId: string): Promise<Booking[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('leads')
      .select('preferred_date, preferred_time')
      .eq('site_id', siteId);
    return (data ?? [])
      .filter((row) => row.preferred_date)
      .map((row, index) => ({
        id: String(index),
        businessName: '',
        clientName: '',
        phone: '',
        service: '',
        date: String(row.preferred_date),
        time: String(row.preferred_time ?? ''),
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadSite(slug);
  const draft = site ? sanitizeDraft(site.draft) : null;
  if (!site || !draft) {
    return { title: 'Sajt nije pronađen — DiV.ai' };
  }

  const title = draft.businessType ? `${draft.businessName} — ${draft.businessType}` : draft.businessName;
  const description = draft.description || draft.tagline || `${draft.businessName} — kontakt i zakazivanje.`;

  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: `/s/${site.slug}` },
    openGraph: {
      title,
      description: description.slice(0, 300),
      type: 'website',
      locale: 'sr_RS',
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function PublishedSitePage({ params }: PageParams) {
  await connection();
  const { slug } = await params;
  const site = await loadSite(slug);
  if (!site) notFound();

  const draft = sanitizeDraft(site.draft);
  if (!draft) notFound();

  const bookings = await loadBookings(site.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: draft.businessName,
    description: draft.description || draft.tagline,
    telephone: draft.phone || undefined,
    email: draft.email || undefined,
    address: draft.address ? { '@type': 'PostalAddress', streetAddress: draft.address } : undefined,
    url: `/s/${site.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicSite draft={draft} siteId={site.id} initialBookings={bookings} />
    </>
  );
}
