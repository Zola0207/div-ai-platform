import { loadPublishedBrand } from '@/lib/published-brand';
import { siteUrlForHost } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await loadPublishedBrand(slug);
  if (!brand) {
    return new Response('Sajt nije pronađen', { status: 404 });
  }

  const url = siteUrlForHost(brand.slug, request.headers.get('host'));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
