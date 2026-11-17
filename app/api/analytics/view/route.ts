import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isServerSupabaseConfigured } from '@/lib/api-auth';

type ViewBody = {
  siteId?: string;
  path?: string;
  referrer?: string;
  sessionId?: string;
};

const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function clientKey(req: Request, siteId: string): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = (forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim();
  return `${ip}|${siteId}`;
}

function isAllowed(key: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

// Beleži posetu objavljenog sajta. Radi bez prijave, ali samo za
// sajtove koji su stvarno objavljeni — nacrti se ne broje.
export async function POST(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const body = (await req.json().catch(() => ({}))) as ViewBody;
    const siteId = (body.siteId ?? '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(siteId)) {
      return NextResponse.json({ error: 'Nepoznat sajt.' }, { status: 400 });
    }

    if (!isAllowed(clientKey(req, siteId))) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const admin = getSupabaseAdmin();
    const { data: site } = await admin
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('status', 'published')
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { error } = await admin.from('site_views').insert({
      site_id: siteId,
      path: (body.path ?? '').slice(0, 200) || null,
      referrer: (body.referrer ?? '').slice(0, 300) || null,
      session_id: (body.sessionId ?? '').slice(0, 64) || null,
    });

    if (error) {
      // Statistika nikada ne sme da obori stranu koju posetilac gleda.
      console.error('Greška pri upisu posete:', error.message);
      return NextResponse.json({ ok: true, skipped: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('Analytics view error:', err);
    return NextResponse.json({ ok: true, skipped: true });
  }
}
