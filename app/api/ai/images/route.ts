import { NextResponse } from 'next/server';
import { siteImagePlan } from '@/lib/site-images';

type ImagesBody = {
  businessName?: string;
  businessType?: string;
  labels?: string[];
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 6;
const hits = new Map<string, number[]>();

function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim();
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
  if (!isAllowed(clientKey(req))) {
    return NextResponse.json({ error: 'Previše AI zahteva. Sačekajte nekoliko minuta.' }, { status: 429 });
  }

  try {
    const body = (await req.json()) as ImagesBody;
    const plan = siteImagePlan({
      businessName: body.businessName ?? '',
      businessType: body.businessType ?? '',
      labels: body.labels,
    });

    if (!plan) {
      return NextResponse.json({ error: 'Unesite naziv biznisa pre generisanja slika.' }, { status: 400 });
    }

    return NextResponse.json(plan);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('AI images error:', message);
    return NextResponse.json({ error: 'Slike trenutno nije moguće generisati.' }, { status: 502 });
  }
}
