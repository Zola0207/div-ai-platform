import { NextResponse, type NextRequest } from 'next/server';

// Objavljeni sajtovi žive na poddomenu našeg domena (slug.div.ai), a kupci
// mogu da povežu i sopstveni domen. Proxy preslikava oba hosta na internu
// rutu /s/<slug>, pa ostatak aplikacije ostaje isti.
const SITES_DOMAIN = (process.env.NEXT_PUBLIC_SITES_DOMAIN || '')
  .trim()
  .toLowerCase()
  .replace(/^\.+|\.+$/g, '');

const APP_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://div-ai-platform.vercel.app').hostname.toLowerCase();
  } catch {
    return 'div-ai-platform.vercel.app';
  }
})();

// Ovi poddomeni pripadaju platformi, ne sajtovima korisnika.
const RESERVED = new Set(['www', 'app', 'api', 'admin', 'panel', 'preview', 'mail', 'status']);

function isPlatformHost(host: string): boolean {
  if (!host) return true;
  if (host === APP_HOST || host === 'localhost' || host === '127.0.0.1') return true;
  if (host.endsWith('.vercel.app')) return true;
  if (SITES_DOMAIN && (host === SITES_DOMAIN || host === `www.${SITES_DOMAIN}`)) return true;
  return false;
}

// Sopstveni domen se traži u bazi, uz kratak keš da svaki zahtev ne ide u
// Supabase. Keš živi po edge instanci.
const domainCache = new Map<string, { slug: string | null; at: number }>();
const CACHE_MS = 60 * 1000;

async function slugForCustomDomain(host: string): Promise<string | null> {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !key) return null;

  const hit = domainCache.get(host);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.slug;

  try {
    const res = await fetch(
      `${supabase}/rest/v1/sites?select=slug&status=eq.published&custom_domain=eq.${encodeURIComponent(host)}&limit=1`,
      {
        headers: { apikey: key },
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
      },
    );
    const rows = res.ok ? (await res.json()) as { slug?: string }[] : [];
    const slug = rows[0]?.slug ?? null;
    if (domainCache.size > 500) domainCache.clear();
    domainCache.set(host, { slug, at: Date.now() });
    return slug;
  } catch {
    return null;
  }
}

function rewriteToSite(request: NextRequest, slug: string) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Browserski favicon nema svoju rutu — koristimo ikonicu sajta.
  if (pathname === '/favicon.ico') {
    url.pathname = `/s/${slug}/icons/192`;
    return NextResponse.rewrite(url);
  }

  url.pathname = `/s/${slug}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase();
  if (!host) return NextResponse.next();

  // 1) Besplatan poddomen našeg domena.
  if (SITES_DOMAIN) {
    const suffix = `.${SITES_DOMAIN}`;
    if (host.endsWith(suffix)) {
      const slug = host.slice(0, -suffix.length);
      if (slug && !slug.includes('.') && !RESERVED.has(slug)) {
        return rewriteToSite(request, slug);
      }
    }
  }

  // 2) Sopstveni domen kupca.
  if (isPlatformHost(host)) return NextResponse.next();

  const slug = await slugForCustomDomain(host);
  if (!slug) return NextResponse.next();

  return rewriteToSite(request, slug);
}

export const config = {
  // API i Next assets idu direktno; service worker i offline strana su
  // statični fajlovi iz /public.
  matcher: ['/((?!api|_next|s/|offline\\.html|sw\\.js).*)'],
};
