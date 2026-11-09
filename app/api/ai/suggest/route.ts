import { NextResponse } from 'next/server';
import { generateSiteContent, isAiConfigured } from '@/lib/ai';

type SuggestBody = {
  businessName?: string;
  businessType?: string;
  bookingType?: string;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 6;
const hits = new Map<string, number[]>();

function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  return ip.trim();
}

function isAllowed(key: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: 'AI nije povezan. Dodajte GEMINI_API_KEY u okruženje.', configured: false },
      { status: 503 },
    );
  }

  if (!isAllowed(clientKey(req))) {
    return NextResponse.json(
      { error: 'Previše AI zahteva. Sačekajte nekoliko minuta pa pokušajte ponovo.' },
      { status: 429 },
    );
  }

  try {
    const body = (await req.json()) as SuggestBody;
    const businessName = (body.businessName ?? '').trim().slice(0, 80);
    const businessType = (body.businessType ?? '').trim().slice(0, 80);
    const bookingType = (body.bookingType ?? '').trim().slice(0, 40);

    if (!businessName) {
      return NextResponse.json({ error: 'Unesite naziv biznisa pre korišćenja AI asistenta.' }, { status: 400 });
    }

    const content = await generateSiteContent({ businessName, businessType, bookingType });
    return NextResponse.json(content);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI trenutno nije dostupan.';
    console.error('AI suggest error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
