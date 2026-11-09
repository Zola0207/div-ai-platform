import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';

type LeadInput = {
  businessName?: string;
  clientName?: string;
  phone?: string;
  service?: string;
  date?: string;
  time?: string;
  siteId?: string;
};

export async function POST(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.', configured: false }, { status: 503 });
    }

    const body = (await req.json()) as LeadInput;

    const clientName = (body.clientName ?? '').trim();
    const phone = (body.phone ?? '').trim();

    if (!clientName || !phone) {
      return NextResponse.json({ error: 'Ime i telefon su obavezni.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Upit sa javnog sajta je uvek dozvoljen. Ako je vlasnik prijavljen,
    // proveravamo da sajt zaista pripada njemu pre povezivanja.
    let siteId: string | null = null;
    if (body.siteId) {
      const auth = await getApiAuth(req);
      if (auth.user) {
        const { data: site } = await admin
          .from('sites')
          .select('id')
          .eq('id', body.siteId)
          .eq('owner_id', auth.user.id)
          .maybeSingle();
        if (site) siteId = site.id;
      }
    }

    const { error } = await admin.from('leads').insert({
      site_id: siteId,
      business_name: body.businessName?.trim() || null,
      client_name: clientName,
      phone,
      service: body.service?.trim() || null,
      preferred_date: body.date || null,
      preferred_time: body.time || null,
      status: 'Novo',
    });

    if (error) {
      console.error('Greška pri upisu upita:', error);
      return NextResponse.json({ error: 'Upit nije moguće sačuvati.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('Leads API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.', configured: false }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da vidite upite.' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: sites, error: sitesError } = await admin
      .from('sites')
      .select('id')
      .eq('owner_id', auth.user.id);

    if (sitesError) {
      console.error('Greška pri čitanju sajtova:', sitesError);
      return NextResponse.json({ error: 'Upiti nisu mogli da se učitaju.' }, { status: 500 });
    }

    const siteIds = (sites ?? []).map((site) => site.id);
    if (siteIds.length === 0) {
      return NextResponse.json({ leads: [] });
    }

    const { data, error } = await admin
      .from('leads')
      .select('*')
      .in('site_id', siteIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Greška pri čitanju upita:', error);
      return NextResponse.json({ error: 'Upiti nisu mogli da se učitaju.' }, { status: 500 });
    }

    return NextResponse.json({ leads: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('Leads API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
