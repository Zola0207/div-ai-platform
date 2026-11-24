import { isBrokenImageUrl } from './image-urls';

// Fotografije za sajtove dolaze iz Pexels API-ja. Ključ ostaje na serveru:
// klijent nikada ne dobija ni ključ ni mogućnost da traži proizvoljne slike.
// Ako ključ nije podešen, sajtovi koriste brendirane pločice iz pregleda.

export type SiteImagePlan = {
  hero?: string;
  gallery: { label: string; url?: string }[];
};

export type SiteImageInput = {
  businessName: string;
  businessType?: string;
  categoryId?: string;
  labels?: string[];
};

const ENDPOINT = 'https://api.pexels.com/v1/search';

// Upiti su na engleskom jer Pexels bolje pronalazi fotografije tako, a
// delatnost je već razvrstana u kategorije. Prvi upit je naslovna, ostala
// tri su galerija.
const CATEGORY_QUERIES: Record<string, [string, string, string, string]> = {
  beauty: ['hair salon interior', 'hairstylist styling hair', 'manicure nails close up', 'beauty products flat lay'],
  auto: ['auto repair shop interior', 'car mechanic working', 'car wash close up', 'car detailing'],
  hospitality: ['restaurant interior warm', 'restaurant food plating', 'coffee shop table', 'chef cooking kitchen'],
  health: ['dental clinic interior', 'physiotherapy treatment', 'doctor consultation office', 'medical equipment close up'],
  fitness: ['gym interior equipment', 'personal trainer workout', 'yoga studio', 'dumbbells close up'],
  education: ['classroom desks', 'language school lesson', 'books and notebooks', 'teacher helping student'],
  home: ['home renovation', 'plumber repairing sink', 'painter painting wall', 'tools close up'],
  professional: ['modern office interior', 'business meeting', 'accounting desk paperwork', 'laptop workspace'],
  retail: ['boutique store interior', 'flower shop bouquets', 'jewelry close up', 'clothing rack'],
  other: ['small business interior', 'workshop tools', 'service desk', 'detail close up'],
};

type PexelsPhoto = { id: number; src?: Record<string, string> };
type CacheEntry = { url: string; id: number; at: number };

const CACHE_MS = 10 * 60 * 1000;
const cache = new Map<string, CacheEntry[]>();

function cached(query: string): CacheEntry[] | null {
  const hit = cache.get(query);
  if (!hit) return null;
  if (Date.now() - hit[0].at > CACHE_MS) {
    cache.delete(query);
    return null;
  }
  return hit;
}

function remember(query: string, photos: CacheEntry[]) {
  if (cache.size > 200) cache.clear();
  cache.set(query, photos);
}

async function searchPhoto(query: string, used: Set<number>): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  try {
    let photos = cached(query);
    if (!photos) {
      const res = await fetch(
        `${ENDPOINT}?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape&size=large`,
        {
          headers: { Authorization: key },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { photos?: PexelsPhoto[] };
      photos = (data.photos ?? []).map((photo) => ({
        id: photo.id,
        url: photo.src?.large2x || photo.src?.large || photo.src?.landscape || '',
        at: Date.now(),
      })).filter((photo) => photo.url);
      if (!photos.length) return null;
      remember(query, photos);
    }

    const photo = photos.find((item) => !used.has(item.id)) ?? photos[0];
    if (!photo) return null;
    used.add(photo.id);
    return photo.url;
  } catch {
    return null;
  }
}

export function isImageProviderConfigured(): boolean {
  return Boolean(process.env.PEXELS_API_KEY);
}

export async function siteImagePlan(input: SiteImageInput): Promise<SiteImagePlan | null> {
  const name = (input.businessName ?? '').trim().slice(0, 80);
  if (!name || !isImageProviderConfigured()) return null;

  const queries = CATEGORY_QUERIES[input.categoryId ?? ''] ?? CATEGORY_QUERIES.other;
  const labels = Array.isArray(input.labels) && input.labels.length
    ? input.labels.filter((label): label is string => typeof label === 'string').map((label) => label.trim().slice(0, 40)).filter(Boolean).slice(0, 3)
    : ['Naš rad', 'Prostor', 'Detalji'];

  const used = new Set<number>();
  const [hero, ...gallery] = await Promise.all(queries.map((query) => searchPhoto(query, used)));
  if (!hero && gallery.every((url) => !url)) return null;

  return {
    hero: hero ?? undefined,
    // Redosled ostaje isti kao kod pločica; neuspela slika jednostavno nema URL.
    gallery: labels.map((label, index) => ({ label, url: gallery[index] || undefined })),
  };
}

type DraftWithImages = {
  businessName: string;
  businessType?: string;
  categoryId?: string;
  heroImageUrl?: string;
  gallery: { label: string; imageUrl?: string }[];
};

// Objava: popunjavamo samo ono što nedostaje. Ručno izabrane i uploadovane
// slike ostaju netaknute, a stare (pokvarene) adrese se uklanjaju.
export async function withAutoImages<T extends DraftWithImages>(draft: T): Promise<{ draft: T; added: number }> {
  let added = 0;
  const clean: T = {
    ...draft,
    heroImageUrl: isBrokenImageUrl(draft.heroImageUrl) ? undefined : draft.heroImageUrl,
    gallery: draft.gallery.map((item) => (isBrokenImageUrl(item.imageUrl) ? { ...item, imageUrl: undefined } : item)),
  };

  const needsHero = !clean.heroImageUrl;
  const needsGallery = clean.gallery.some((item) => !item.imageUrl);
  if (!needsHero && !needsGallery) return { draft: clean, added };

  const plan = await siteImagePlan({
    businessName: clean.businessName,
    businessType: clean.businessType,
    categoryId: clean.categoryId,
    labels: clean.gallery.map((item) => item.label),
  });
  if (!plan) return { draft: clean, added };

  const heroImageUrl = clean.heroImageUrl || plan.hero;
  if (heroImageUrl && heroImageUrl !== clean.heroImageUrl) added += 1;

  const gallery = clean.gallery.map((item, index) => {
    if (item.imageUrl) return item;
    const url = plan.gallery[index]?.url;
    if (!url) return item;
    added += 1;
    return { ...item, imageUrl: url };
  });

  return { draft: { ...clean, heroImageUrl, gallery }, added };
}
