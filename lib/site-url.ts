// Adresa objavljenog sajta. Besplatna adresa je uvek poddomen našeg domena
// (npr. studio-lena.div.ai). Dok domen nije povezan, koristi se stara putanja
// /s/<slug> da ništa ne pukne u razvoju i na vercel.app adresi.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://div-ai-platform.vercel.app').replace(/\/$/, '');
const SITES_DOMAIN = (process.env.NEXT_PUBLIC_SITES_DOMAIN || '')
  .trim()
  .toLowerCase()
  .replace(/^\.+|\.+$/g, '');

const APP_HOST = (() => {
  try {
    return new URL(APP_URL).hostname.toLowerCase();
  } catch {
    return 'div-ai-platform.vercel.app';
  }
})();

export const siteDomain = SITES_DOMAIN;

export function isSiteDomainConfigured(): boolean {
  return Boolean(SITES_DOMAIN);
}

export function isPlatformHost(host?: string | null): boolean {
  const clean = (host ?? '').split(':')[0].toLowerCase();
  if (!clean) return true;
  if (clean === APP_HOST || clean === 'localhost' || clean === '127.0.0.1') return true;
  if (clean.endsWith('.vercel.app')) return true;
  if (SITES_DOMAIN && (clean === SITES_DOMAIN || clean === `www.${SITES_DOMAIN}`)) return true;
  return false;
}

export function siteHost(slug: string): string | null {
  if (!SITES_DOMAIN) return null;
  const clean = (slug ?? '').trim().toLowerCase();
  return clean ? `${clean}.${SITES_DOMAIN}` : null;
}

export function siteUrl(slug: string): string {
  const host = siteHost(slug);
  return host ? `https://${host}` : `${APP_URL}/s/${slug}`;
}

// Putanja do resursa sajta (manifest, ikonice) na trenutnom hostu.
export function siteBase(slug: string): string {
  return siteHost(slug) ? '' : `/s/${slug}`;
}

// Isto, ali po stvarnom hostu zahteva — tako i stara /s/<slug> putanja radi
// dok je domen već povezan.
export function siteBaseForHost(slug: string, host?: string | null): string {
  return isPlatformHost(host) ? `/s/${slug}` : '';
}

// Kanonska adresa: sopstveni domen ako postoji, inače besplatni poddomen.
export function siteUrlForHost(slug: string, host?: string | null): string {
  const clean = (host ?? '').split(':')[0].toLowerCase();
  return clean && !isPlatformHost(clean) ? `https://${clean}` : siteUrl(slug);
}
