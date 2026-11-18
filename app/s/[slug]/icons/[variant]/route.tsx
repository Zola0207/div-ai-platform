import { ImageResponse } from 'next/og';
import { loadPublishedBrand } from '@/lib/published-brand';
import { loadOgFont } from '@/lib/og-font';
import { contrastText, initials } from '@/components/blocks/site-types';

// Ikonica se generiše iz imena i akcentne boje sajta — bez uploadovanja
// i bez dizajnera. Isti izvor koriste manifest i Apple touch icon.
export const dynamic = 'force-dynamic';

const VARIANTS: Record<string, { size: number; ratio: number }> = {
  '192': { size: 192, ratio: 0.34 },
  '512': { size: 512, ratio: 0.34 },
  // Maskable ikonica mora da ostane unutar bezbedne zone (80% prečnika).
  'maskable-512': { size: 512, ratio: 0.26 },
  'apple-180': { size: 180, ratio: 0.32 },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; variant: string }> },
) {
  const { slug, variant } = await params;
  const spec = VARIANTS[variant];
  if (!spec) return new Response('Nepoznata ikonica', { status: 404 });

  const brand = await loadPublishedBrand(slug);
  if (!brand) return new Response('Sajt nije pronađen', { status: 404 });

  const font = await loadOgFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: brand.accent,
          color: contrastText(brand.accent),
          fontFamily: 'Geist',
          fontSize: Math.round(spec.size * spec.ratio),
        }}
      >
        {initials(brand.name)}
      </div>
    ),
    {
      width: spec.size,
      height: spec.size,
      ...(font ? { fonts: [{ name: 'Geist', data: font, style: 'normal' as const, weight: 400 as const }] } : {}),
      headers: {
        'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
