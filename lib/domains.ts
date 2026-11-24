import { siteDomain } from './site-url';

// Sopstveni domen kupca povezujemo preko Vercel API-ja. Token i ID-jevi su
// samo na serveru — nikad u NEXT_PUBLIC promenljivama.
const API = 'https://api.vercel.com';
const TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT = process.env.VERCEL_PROJECT_ID;
const TEAM = process.env.VERCEL_TEAM_ID;

const APP_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://div-ai-platform.vercel.app').hostname.toLowerCase();
  } catch {
    return 'div-ai-platform.vercel.app';
  }
})();

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export type DomainStatus = {
  domain: string;
  verified: boolean;
  misconfigured: boolean;
  cname: string;
  aRecords: string[];
};

export function isDomainApiConfigured(): boolean {
  return Boolean(TOKEN && PROJECT);
}

export function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .replace(/:\d+$/, '')
    .replace(/\.+$/, '');
}

export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (!DOMAIN_RE.test(domain)) return false;
  const tld = domain.split('.').pop() ?? '';
  return tld.length >= 2 && /^(?:[a-z]{2,}|xn--[a-z0-9-]+)$/.test(tld);
}

// Besplatan poddomen našeg domena i platformski hostovi ne mogu biti
// „sopstveni domen“.
export function isPlatformDomain(domain: string): boolean {
  if (domain === APP_HOST) return true;
  if (domain.endsWith('.vercel.app')) return true;
  if (siteDomain && (domain === siteDomain || domain.endsWith(`.${siteDomain}`))) return true;
  return false;
}

type VercelResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

function url(path: string): string {
  const query = TEAM ? `?teamId=${encodeURIComponent(TEAM)}` : '';
  return `${API}${path}${query}`;
}

async function call<T>(path: string, init?: RequestInit): Promise<VercelResult<T>> {
  if (!isDomainApiConfigured()) {
    return { ok: false, status: 503, error: 'Povezivanje domena nije podešeno.' };
  }

  try {
    const res = await fetch(url(path), {
      ...init,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: { code?: string; message?: string } };

    if (!res.ok) {
      const code = data?.error?.code;
      if (res.status === 409 || code === 'domain_already_exists' || code === 'domain_taken') {
        return { ok: false, status: 409, error: 'Domen je već povezan sa drugim projektom.' };
      }
      if (res.status === 403) {
        return { ok: false, status: 502, error: 'Domen nije moguće povezati — proverite dozvole Vercel naloga.' };
      }
      return { ok: false, status: 502, error: 'Domen nije moguće povezati. Pokušajte ponovo.' };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, status: 502, error: 'Vercel trenutno ne odgovara. Pokušajte ponovo.' };
  }
}

export async function addProjectDomain(domain: string): Promise<VercelResult<unknown>> {
  return call(`/v10/projects/${PROJECT}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });
}

export async function removeProjectDomain(domain: string): Promise<VercelResult<unknown>> {
  const result = await call(`/v9/projects/${PROJECT}/domains/${encodeURIComponent(domain)}`, { method: 'DELETE' });
  // Ako domena više nema, smatramo da je uklonjen.
  if (!result.ok && result.status === 502) return { ok: true, data: {} };
  return result;
}

export async function projectDomainStatus(domain: string): Promise<DomainStatus | null> {
  if (!isDomainApiConfigured()) return null;

  const [project, config] = await Promise.all([
    call<{ verified?: boolean }>(`/v9/projects/${PROJECT}/domains/${encodeURIComponent(domain)}`),
    call<{
      misconfigured?: boolean;
      recommendedCNAME?: { value?: string }[];
      recommendedIPv4?: { value?: string[] }[];
    }>(`/v6/domains/${encodeURIComponent(domain)}/config`),
  ]);

  if (!project.ok) return null;

  const cname = config.ok ? config.data.recommendedCNAME?.[0]?.value : undefined;
  const aRecords = config.ok ? config.data.recommendedIPv4?.[0]?.value : undefined;

  return {
    domain,
    verified: Boolean(project.data.verified),
    misconfigured: config.ok ? Boolean(config.data.misconfigured) : true,
    cname: (cname || 'cname.vercel-dns.com').replace(/\.$/, ''),
    aRecords: aRecords?.length ? aRecords : ['76.76.21.21'],
  };
}
