import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';

type PublishBody = { siteId?: string };

function slugify(value: string): string {
  const map: Record<string, string> = { č: 'c', ć: 'c', ž: 'z', š: 's', đ: 'd' };
  const slug = value
    .toLowerCase()
    .replace(/[čćžšđ]/g, (char) => map[char] ?? char)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'sajt';
}

export async function POST(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da objavite sajt.' }, { status: 401 });
    }

    const body = (await req.json()) as PublishBody;
    if (!body.siteId) {
      return NextResponse.json({ error: 'Nedostaje ID sajta.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: site } = await admin
      .from('sites')
      .select('id, name, slug, draft')
      .eq('id', body.siteId)
      .eq('owner_id', auth.user.id)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: 'Sajt nije pronađen na vašem nalogu.' }, { status: 404 });
    }

    const draft = (site.draft ?? {}) as { slug?: string; businessName?: string };
    const base = slugify(draft.slug || site.slug || draft.businessName || site.name || 'sajt');

    let candidate = base;
    let suffix = 2;
    for (;;) {
      const { data: taken } = await admin
        .from('sites')
        .select('id')
        .eq('slug', candidate)
        .neq('id', site.id)
        .maybeSingle();
      if (!taken) break;
      candidate = `${base}-${suffix}`;
      suffix += 1;
      if (suffix > 50) {
        return NextResponse.json({ error: 'Nije moguće naći slobodnu adresu. Promenite poddomen.' }, { status: 409 });
      }
    }

    const { data, error } = await admin
      .from('sites')
      .update({ slug: candidate, status: 'published' })
      .eq('id', site.id)
      .select('slug')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Adresa je upravo zauzeta. Pokušajte ponovo.' }, { status: 409 });
      }
      console.error('Greška pri objavljivanju sajta:', error);
      return NextResponse.json({ error: 'Sajt nije moguće objaviti.' }, { status: 500 });
    }

    return NextResponse.json({ slug: data.slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('Publish API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
