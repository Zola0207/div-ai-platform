import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';
import { withAutoImages } from '@/lib/site-images';

type PublishBody = { siteId?: string };

type PublishDraft = {
  slug?: string;
  businessName?: string;
  businessType?: string;
  categoryId?: string;
  heroImageUrl?: string;
  gallery?: { label: string; imageUrl?: string }[];
};

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

    const draft = (site.draft ?? {}) as PublishDraft;
    const base = slugify(draft.slug || site.slug || draft.businessName || site.name || 'sajt');

    // Fotografije se dodaju ovde, na serveru, jer ključ provajdera ne sme u
    // pregledač. Popunjavamo samo nedostajuće slike i uklanjamo pokvarene.
    const { draft: ready, added } = await withAutoImages({
      ...draft,
      businessName: draft.businessName || site.name || 'Moj sajt',
      gallery: Array.isArray(draft.gallery) ? draft.gallery : [],
    });

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
      .update({ slug: candidate, status: 'published', draft: ready })
      .eq('id', site.id)
      .select('slug, draft')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Adresa je upravo zauzeta. Pokušajte ponovo.' }, { status: 409 });
      }
      console.error('Greška pri objavljivanju sajta:', error);
      return NextResponse.json({ error: 'Sajt nije moguće objaviti.' }, { status: 500 });
    }

    return NextResponse.json({ slug: data.slug, draft: data.draft, imagesAdded: added });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('Publish API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
