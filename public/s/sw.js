/* Service worker za objavljene sajtove (/s/…).
   Cilj: sajt se otvara i kad mreža padne, a ponovni dolazak je brži.
   Ne dira podatke aplikacije — samo HTML strana i statične fajlove. */

const CACHE = 'div-sites-v3';
// Statična HTML strana (bez Next.js skripti) — sigurno se prikazuje i bez mreže.
// Apsolutna putanja: u service worker-u relativne putanje idu od /s/sw.js.
const OFFLINE_URL = new URL('/offline.html', self.location.href).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('div-sites-') && key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Strane: prvo mreža (da sadržaj bude svež), pa keš, pa offline strana.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline || Response.error();
        }),
    );
    return;
  }

  // Statični fajlovi: keš odmah, mreža u pozadini osvežava kopiju.
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    (url.pathname.startsWith('/s/') && /\.(?:png|jpe?g|webp|avif|svg|ico|woff2?)$/i.test(url.pathname));

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
