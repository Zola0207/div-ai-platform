import { loadPublishedBrand } from '@/lib/published-brand';

// Manifest se generiše po sajtu (app/manifest.ts važi samo za koren),
// pa koristimo route handler koji vraća pravi webmanifest.
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await loadPublishedBrand(slug);

  if (!brand) {
    return new Response(JSON.stringify({ error: 'Sajt nije pronađen' }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const base = `/s/${brand.slug}`;
  const manifest = {
    id: base,
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    lang: 'sr-Latn',
    dir: 'ltr',
    start_url: base,
    scope: base,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: brand.accent,
    categories: ['business'],
    icons: [
      { src: `${base}/icons/192`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${base}/icons/512`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${base}/icons/maskable-512`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'content-type': 'application/manifest+json; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
