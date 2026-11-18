import { getSupabaseAdmin } from './supabase-admin';
import { isServerSupabaseConfigured } from './api-auth';

export type PublishedBrand = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
};

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// Kratko ime za ikonicu na telefonu — Android prikazuje ~12 karaktera,
// pa uzimamo cele reči dok ne pređemo limit.
export function shortBusinessName(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  let result = '';
  for (const word of words) {
    if (!result) {
      result = word;
      continue;
    }
    if (`${result} ${word}`.length > 13) break;
    result = `${result} ${word}`;
  }
  return (result || name).slice(0, 14);
}

// Manifest i ikonice čitaju isti minimum podataka o sajtu, bez celog nacrta.
export async function loadPublishedBrand(slug: string): Promise<PublishedBrand | null> {
  if (!isServerSupabaseConfigured()) return null;
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sites')
      .select('slug, draft')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (!data) return null;

    const draft = ((data as { draft?: unknown }).draft ?? {}) as Record<string, unknown>;
    const name = text(draft.businessName);
    if (!name) return null;

    const accent = text(draft.accentColor);
    const type = text(draft.businessType);
    const fallback = type ? `${name} — ${type}, kontakt i zakazivanje.` : `${name} — kontakt i zakazivanje.`;

    return {
      slug,
      name,
      shortName: shortBusinessName(name),
      description: (text(draft.description) || text(draft.tagline) || fallback).slice(0, 200),
      accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#4f46e5',
    };
  } catch {
    return null;
  }
}
