import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';

const LEAD_STATUSES = ['Novo', 'Potvrđeno', 'Završeno', 'Otkazano'] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

type UpdateBody = {
  status?: string;
  note?: string;
};

// Menja status ili belešku upita. Dozvoljeno je samo vlasniku sajta
// na koji je upit vezan — nikada anonimnom posetiocu.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.', configured: false }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da biste menjali upit.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as UpdateBody;
    const admin = getSupabaseAdmin();

    const { data: lead } = await admin
      .from('leads')
      .select('id, site_id')
      .eq('id', id)
      .maybeSingle();

    if (!lead?.site_id) {
      return NextResponse.json({ error: 'Upit nije pronađen.' }, { status: 404 });
    }

    const { data: site } = await admin
      .from('sites')
      .select('id')
      .eq('id', lead.site_id)
      .eq('owner_id', auth.user.id)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: 'Upit nije pronađen.' }, { status: 404 });
    }

    const patch: Record<string, string> = {};

    if (typeof body.status === 'string') {
      const status = body.status.trim();
      if (!LEAD_STATUSES.includes(status as LeadStatus)) {
        return NextResponse.json({ error: 'Nepoznat status.' }, { status: 400 });
      }
      patch.status = status;
    }

    if (typeof body.note === 'string') {
      patch.note = body.note.trim().slice(0, 1000);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nema šta da se izmeni.' }, { status: 400 });
    }

    const wantsNote = typeof body.note === 'string';
    const { data, error } = await admin
      .from('leads')
      .update(patch)
      .eq('id', id)
      .select(wantsNote ? 'id, status, note' : 'id, status')
      .maybeSingle();

    // Beleška traži kolonu `note`; ako baza još nije migrirana, status
    // i dalje mora da se sačuva.
    if (error && wantsNote) {
      const statusOnly: Record<string, string> = {};
      if (patch.status) statusOnly.status = patch.status;
      if (Object.keys(statusOnly).length > 0) {
        const retry = await admin
          .from('leads')
          .update(statusOnly)
          .eq('id', id)
          .select('id, status')
          .maybeSingle();
        if (!retry.error) {
          return NextResponse.json({ ok: true, lead: retry.data, noteSkipped: true });
        }
      }
      return NextResponse.json({ error: 'Beleške još nije moguće čuvati (baza nije migrirana).' }, { status: 409 });
    }

    if (error) {
      console.error('Greška pri izmeni upita:', error);
      return NextResponse.json({ error: 'Upit nije moguće izmeniti.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('Leads PATCH error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
