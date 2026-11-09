import { NextResponse } from 'next/server';

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

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 2147483647;
  }
  return result;
}

function imageUrl(prompt: string, seed: number, width: number, height: number): string {
  const query = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: 'true',
    model: 'flux',
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${query.toString()}`;
}

export async function POST(req: Request) {
  if (!isAllowed(clientKey(req))) {
    return NextResponse.json({ error: 'Previše AI zahteva. Sačekajte nekoliko minuta.' }, { status: 429 });
  }

  try {
    const body = (await req.json()) as ImagesBody;
    const businessName = (body.businessName ?? '').trim().slice(0, 80);
    const businessType = (body.businessType ?? '').trim().slice(0, 80) || 'uslužni biznis';
    const labels = Array.isArray(body.labels)
      ? body.labels.filter((label): label is string => typeof label === 'string').map((label) => label.trim().slice(0, 40)).slice(0, 3)
      : [];

    if (!businessName) {
      return NextResponse.json({ error: 'Unesite naziv biznisa pre generisanja slika.' }, { status: 400 });
    }

    const base = hash(`${businessName}|${businessType}`);
    const style = 'professional commercial photography, bright natural light, clean modern look, no people, no text, no watermark';
    const galleryLabels = labels.length > 0 ? labels : ['Naš rad', 'Prostor', 'Detalji'];

    return NextResponse.json({
      hero: imageUrl(`${businessType}, interior and atmosphere, wide shot, ${style}`, base + 11, 1280, 720),
      gallery: galleryLabels.map((label, index) => ({
        label,
        url: imageUrl(`${businessType}, ${label.toLowerCase()}, close up detail, ${style}`, base + 101 + index * 17, 900, 675),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('AI images error:', message);
    return NextResponse.json({ error: 'Slike trenutno nije moguće generisati.' }, { status: 502 });
  }
}
