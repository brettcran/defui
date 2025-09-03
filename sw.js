
/* TurboSign offline service worker */
const VERSION = 'v1.0.0';                // bump to bust old caches
const CACHE = `turbosign-${VERSION}`;

/* Core app shell to always precache */
const PRECACHE = [
  '/',                // index wrapper
  '/index.html',
  '/web/viewer.html',
  '/web/viewer.css',
  '/web/viewer.mjs',
  '/web/locale/locale.json',
  '/web/locale/en-US/viewer.properties',  // add other locales if needed
  '/build/pdf.mjs',
  '/build/pdf.worker.mjs',
  '/build/pdf_viewer.mjs',
  '/build/pdf_viewer.css'
];

/* Runtime cache patterns */
const RUNTIME_PATTERNS = [
  /^\/web\//,
  /^\/build\//,
  /^\/cmaps\//,
  /^\/standard_fonts\//
];

/* Install: precache core + key icons */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE);
    try {
      await cache.addAll([
        '/web/images/toolbarButton-openFile.svg',
        '/web/images/toolbarButton-print.svg',
        '/web/images/toolbarButton-download.svg',
        '/web/images/toolbarButton-pageUp.svg',
        '/web/images/toolbarButton-pageDown.svg',
        '/web/images/secondaryToolbarToggle.svg'
      ]);
    } catch (_) {}
    self.skipWaiting();
  })());
});

/* Activate: clean up old versions */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => {
      if (k.startsWith('turbosign-') && k !== CACHE) return caches.delete(k);
    }));
    self.clients.claim();
  })());
});

/* Fetch: cache-first for viewer assets; network-first fallback */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  // Navigation requests → serve index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html', { ignoreSearch: true })
        .then(resp => resp || fetch(request))
    );
    return;
  }

  // Cache-first for viewer/build/cmaps/standard_fonts
  if (RUNTIME_PATTERNS.some(re => re.test(url.pathname))) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const resp = await fetch(request);
        if (resp && resp.status === 200) cache.put(request, resp.clone());
        return resp;
      } catch (err) {
        return hit || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Default: pass-through
});
