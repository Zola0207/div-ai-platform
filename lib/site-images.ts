// Plan slika za sajt. Isti kod koristi i API ruta (ručno generisanje) i
// objava sajta (automatsko popunjavanje), da bi slike uvek bile iste za isti
// biznis — bez dodatnih poziva i bez ključeva.

export type SiteImagePlan = {
  hero: string;
  gallery: { label: string; url: string }[];
};

const STYLE = 'professional commercial photography, bright natural light, clean modern look, no people, no text, no watermark';

const GENERIC_LABELS: Record<string, string> = {
  'naš rad': 'finished work, close up',
  'nas rad': 'finished work, close up',
  prostor: 'interior space and atmosphere',
  detalji: 'detail shot, materials and tools',
  usluge: 'service in progress, close up',
  ponuda: 'product and offer display',
};

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 2147483647;
  }
  return result;
}

function imageUrl(prompt: string, seed: number, width: number, height: number): string {
  const query = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: 'true',
    model: 'flux',
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${query.toString()}`;
}

function gallerySubject(label: string): string {
  const clean = label.trim().toLowerCase();
  return GENERIC_LABELS[clean] ?? clean;
}

export function siteImagePlan({ businessName, businessType, labels }: {
  businessName: string;
  businessType?: string;
  labels?: string[];
}): SiteImagePlan | null {
  const name = (businessName ?? '').trim().slice(0, 80);
  if (!name) return null;

  const type = (businessType ?? '').trim().slice(0, 80) || 'uslužni biznis';
  const galleryLabels = Array.isArray(labels)
    ? labels.filter((label): label is string => typeof label === 'string').map((label) => label.trim().slice(0, 40)).filter(Boolean).slice(0, 3)
    : [];
  const base = hash(`${name}|${type}`);
  const effectiveLabels = galleryLabels.length > 0 ? galleryLabels : ['Naš rad', 'Prostor', 'Detalji'];

  return {
    hero: imageUrl(`${type}, interior and atmosphere, wide shot, ${STYLE}`, base + 11, 1280, 720),
    gallery: effectiveLabels.map((label, index) => ({
      label,
      url: imageUrl(`${type}, ${gallerySubject(label)}, ${STYLE}`, base + 101 + index * 17, 900, 675),
    })),
  };
}

type DraftWithImages = {
  businessName: string;
  businessType?: string;
  heroImageUrl?: string;
  gallery: { label: string; imageUrl?: string }[];
};

// Objava: ako korisnik nije dodao slike, popunjavamo ih automatski. Tako
// objavljen sajt nikad ne izlazi sa praznim okvirima, a ručno izabrane slike
// ostaju netaknute.
export function withAutoImages<T extends DraftWithImages>(draft: T): T {
  const hasHero = Boolean(draft.heroImageUrl);
  const hasAllGallery = draft.gallery.every((item) => Boolean(item.imageUrl));
  if (hasHero && hasAllGallery) return draft;

  const plan = siteImagePlan({ businessName: draft.businessName, businessType: draft.businessType, labels: draft.gallery.map((item) => item.label) });
  if (!plan) return draft;

  return {
    ...draft,
    heroImageUrl: draft.heroImageUrl || plan.hero,
    gallery: draft.gallery.map((item, index) => (item.imageUrl || !plan.gallery[index] ? item : { ...item, imageUrl: plan.gallery[index].url })),
  };
}
