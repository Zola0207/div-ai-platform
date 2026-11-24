// Adrese slika koje znamo da su pokvarene. Pollinations je nekada bio
// besplatan, a sada vraća reklamnu sliku preko limita — takve adrese ne
// smeju da završe ni u pregledu ni na objavljenom sajtu.
const BROKEN_HOSTS = ['image.pollinations.ai', 'pollinations.ai'];

export function isBrokenImageUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BROKEN_HOSTS.some((broken) => host === broken || host.endsWith(`.${broken}`));
  } catch {
    return false;
  }
}
