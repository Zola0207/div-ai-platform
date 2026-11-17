import { ImageResponse } from 'next/og';
import { loadOgFont } from '@/lib/og-font';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isServerSupabaseConfigured } from '@/lib/api-auth';

export const alt = 'Sajt biznisa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Row = { draft: unknown };

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function loadBrand(slug: string) {
  if (!isServerSupabaseConfigured()) return null;
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sites')
      .select('draft')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    const draft = ((data as Row | null)?.draft ?? {}) as Record<string, unknown>;
    const name = text(draft.businessName);
    if (!name) return null;
    return {
      name,
      type: text(draft.businessType),
      tagline: text(draft.tagline),
      accent: /^#[0-9a-f]{6}$/i.test(text(draft.accentColor)) ? text(draft.accentColor) : '#4f46e5',
      icon: Array.from(text(draft.icon)).slice(0, 2).join(''),
    };
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await loadBrand(slug);
  const font = await loadOgFont();

  const accent = brand?.accent ?? '#4f46e5';
  const name = brand?.name ?? 'DiV.ai';
  const subtitle = brand?.type || brand?.tagline || 'Kontakt i zakazivanje';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px',
          background: `linear-gradient(135deg, #ffffff 0%, ${accent}1f 100%)`,
          color: '#0f172a',
          fontFamily: 'Geist',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 22,
            }}
          >
            {brand?.icon || name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ fontSize: 22, color: '#475569' }}>{brand?.name ? 'Zakazivanje i kontakt' : 'DiV.ai'}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 74, lineHeight: 1.05, letterSpacing: -2 }}>{name}</div>
          <div style={{ marginTop: 20, fontSize: 32, color: '#475569' }}>{subtitle}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: accent }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: accent }} />
          <span>Rezervišite termin online</span>
        </div>
      </div>
    ),
    { ...size, ...(font ? { fonts: [{ name: 'Geist', data: font, style: 'normal' as const, weight: 400 as const }] } : {}) },
  );
}
