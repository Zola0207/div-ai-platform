import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';
import {
  addProjectDomain,
  isDomainApiConfigured,
  isPlatformDomain,
  isValidDomain,
  normalizeDomain,
  projectDomainStatus,
  removeProjectDomain,
} from '@/lib/domains';

type Body = { siteId?: string; domain?: string };

const MIGRATION_MESSAGE = 'Baza još nema kolonu za sopstveni domen. Pokrenite SQL migraciju pa pokušajte ponovo.';

function missingColumn(error: { code?: string; message?: string } | null): boolean {
  return Boolean(error && (error.code === '42703' || error.message?.includes('custom_domain')));
}

async function ownedSite(siteId: string, userId: string) {
  const admin = getSupabaseAdmin();
  return admin
    .from('sites')
    .select('id, custom_domain')
    .eq('id', siteId)
    .eq('owner_id', userId)
    .maybeSingle();
}

export async function GET(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se.' }, { status: 401 });
    }

    const siteId = new URL(req.url).searchParams.get('siteId');
    if (!siteId) {
      return NextResponse.json({ error: 'Nedostaje ID sajta.' }, { status: 400 });
    }

    const { data: site, error } = await ownedSite(siteId, auth.user.id);
    if (missingColumn(error)) {
      return NextResponse.json({ error: MIGRATION_MESSAGE, code: 'migration_required' }, { status: 503 });
    }
    if (error) {
      return NextResponse.json({ error: 'Sajt nije moguće učitati.' }, { status: 500 });
    }
    if (!site) {
      return NextResponse.json({ error: 'Sajt nije pronađen na vašem nalogu.' }, { status: 404 });
    }

    const domain = typeof site.custom_domain === 'string' ? site.custom_domain : '';
    if (!domain) {
      return NextResponse.json({ domain: null, configured: isDomainApiConfigured() });
    }

    const status = await projectDomainStatus(domain);
    return NextResponse.json({ domain: status, configured: isDomainApiConfigured() });
  } catch {
    return NextResponse.json({ error: 'Domen nije moguće učitati.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.' }, { status: 503 });
    }
    if (!isDomainApiConfigured()) {
      return NextResponse.json({ error: 'Povezivanje sopstvenog domena nije podešeno.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da povežete domen.' }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    if (!body.siteId) {
      return NextResponse.json({ error: 'Nedostaje ID sajta.' }, { status: 400 });
    }

    const domain = normalizeDomain(body.domain ?? '');
    if (!isValidDomain(domain)) {
      return NextResponse.json({ error: 'Unesite ispravan domen, npr. vasbiznis.rs.' }, { status: 400 });
    }
    if (isPlatformDomain(domain)) {
      return NextResponse.json({ error: 'Besplatna adresa je već poddomen našeg domena — ovde unesite svoj domen.' }, { status: 400 });
    }

    const { data: site, error } = await ownedSite(body.siteId, auth.user.id);
    if (missingColumn(error)) {
      return NextResponse.json({ error: MIGRATION_MESSAGE, code: 'migration_required' }, { status: 503 });
    }
    if (error) {
      return NextResponse.json({ error: 'Sajt nije moguće učitati.' }, { status: 500 });
    }
    if (!site) {
      return NextResponse.json({ error: 'Sajt nije pronađen na vašem nalogu.' }, { status: 404 });
    }

    if (site.custom_domain === domain) {
      const status = await projectDomainStatus(domain);
      return NextResponse.json({ domain: status });
    }

    const admin = getSupabaseAdmin();
    const { data: taken } = await admin
      .from('sites')
      .select('id')
      .ilike('custom_domain', domain)
      .neq('id', site.id)
      .maybeSingle();
    if (taken) {
      return NextResponse.json({ error: 'Ovaj domen je već povezan sa drugim sajtom.' }, { status: 409 });
    }

    const added = await addProjectDomain(domain);
    if (!added.ok) {
      return NextResponse.json({ error: added.error }, { status: added.status });
    }

    const { error: updateError } = await admin
      .from('sites')
      .update({ custom_domain: domain })
      .eq('id', site.id);

    if (updateError) {
      await removeProjectDomain(domain);
      if (missingColumn(updateError)) {
        return NextResponse.json({ error: MIGRATION_MESSAGE, code: 'migration_required' }, { status: 503 });
      }
      if (updateError.code === '23505') {
        return NextResponse.json({ error: 'Ovaj domen je već povezan sa drugim sajtom.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Domen je dodat, ali nije sačuvan. Pokušajte ponovo.' }, { status: 500 });
    }

    const status = await projectDomainStatus(domain);
    return NextResponse.json({ domain: status });
  } catch {
    return NextResponse.json({ error: 'Domen nije moguće povezati. Pokušajte ponovo.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se.' }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    if (!body.siteId) {
      return NextResponse.json({ error: 'Nedostaje ID sajta.' }, { status: 400 });
    }

    const { data: site, error } = await ownedSite(body.siteId, auth.user.id);
    if (missingColumn(error)) {
      return NextResponse.json({ error: MIGRATION_MESSAGE, code: 'migration_required' }, { status: 503 });
    }
    if (error || !site) {
      return NextResponse.json({ error: 'Sajt nije pronađen na vašem nalogu.' }, { status: 404 });
    }

    const domain = typeof site.custom_domain === 'string' ? site.custom_domain : '';
    if (domain && isDomainApiConfigured()) {
      const removed = await removeProjectDomain(domain);
      if (!removed.ok) {
        return NextResponse.json({ error: removed.error }, { status: removed.status });
      }
    }

    await getSupabaseAdmin().from('sites').update({ custom_domain: null }).eq('id', site.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Domen nije moguće ukloniti.' }, { status: 500 });
  }
}
