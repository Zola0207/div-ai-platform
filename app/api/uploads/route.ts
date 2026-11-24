import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';

const BUCKET = 'site-images';
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type Admin = ReturnType<typeof getSupabaseAdmin>;

// Bucket pravimo jednom, pri prvom uploadu. Javno čitanje je dozvoljeno jer
// fotografije ionako stoje na objavljenom sajtu.
let bucketReady = false;

async function ensureBucket(admin: Admin): Promise<boolean> {
  if (bucketReady) return true;

  const existing = await admin.storage.getBucket(BUCKET);
  if (existing.data) {
    bucketReady = true;
    return true;
  }

  const created = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: Object.keys(TYPES),
  });
  if (created.error) {
    // Moguće je da je bucket napravljen u paralelnom zahtevu.
    const retry = await admin.storage.getBucket(BUCKET);
    if (!retry.data) return false;
  }

  bucketReady = true;
  return true;
}

function storagePath(url: string, userId: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = pathname.indexOf(marker);
    if (index === -1) return null;
    const path = decodeURIComponent(pathname.slice(index + marker.length));
    if (!path.startsWith(`${userId}/`)) return null;
    return path;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Čuvanje fotografija nije povezano.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da dodate fotografiju.' }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Izaberite fotografiju.' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Fotografija je veća od 4 MB. Smanjite je pa pokušajte ponovo.' }, { status: 413 });
    }

    const ext = TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: 'Dozvoljeni formati su JPG, PNG i WebP.' }, { status: 415 });
    }

    const admin = getSupabaseAdmin();
    if (!(await ensureBucket(admin))) {
      return NextResponse.json({ error: 'Čuvanje fotografija trenutno nije dostupno.' }, { status: 500 });
    }

    const path = `${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });

    if (error) {
      console.error('Greška pri uploadu fotografije:', error);
      return NextResponse.json({ error: 'Fotografija nije sačuvana. Pokušajte ponovo.' }, { status: 500 });
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('Upload API error:', message);
    return NextResponse.json({ error: 'Fotografija nije sačuvana. Pokušajte ponovo.' }, { status: 500 });
  }
}

// Kada vlasnik zameni ili ukloni fotografiju, stari fajl brišemo da ne
// skuplja prostor. Briše se samo ono što pripada prijavljenom korisniku.
export async function DELETE(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Čuvanje fotografija nije povezano.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se.' }, { status: 401 });
    }

    const body = (await req.json()) as { url?: string };
    const path = body.url ? storagePath(body.url, auth.user.id) : null;
    if (!path) {
      return NextResponse.json({ ok: true });
    }

    await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
