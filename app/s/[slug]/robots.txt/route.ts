import { loadPublishedBrand } from '@/lib/published-brand';
import { siteUrlForHost } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await loadPublishedBrand(slug);
  if (!brand) {
    return new Response('Sajt nije pronađen', { status: 404 });
  }

  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrlForHost(brand.slug, request.headers.get('host'))}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
