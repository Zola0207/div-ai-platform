import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Font za generisane OG slike. Ako fajl nedostaje u bundle-u,
// vraćamo null i slika se i dalje generiše (samo bez prilagođenog fonta).
export async function loadOgFont(): Promise<ArrayBuffer | null> {
  try {
    const file = await readFile(join(process.cwd(), 'assets/Geist-Regular.ttf'));
    return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
  } catch (err) {
    console.error('OG font nije dostupan:', err instanceof Error ? err.message : err);
    return null;
  }
}
