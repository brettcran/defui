/* TurboSign offline service worker (PDF.js default viewer) */
const VERSION = "v1.0.1";                 // bump to bust old caches
const CACHE   = `turbosign-${VERSION}`;

/* Core app shell to always precache */
const PRECACHE = [
  "/",                      // index wrapper (redirects to /web/viewer.html)
  "/index.html",
  "/web/viewer.html",
  "/web/viewer.css",
  "/web/viewer.mjs",
  "/web/locale/locale.json",             // modern locale
  "/build/pdf.mjs",
  "/build/pdf.worker.mjs"
  // NOTE: do not list files that don't exist — install will fail if any 404.
];

/* Runtime cache patterns (cache-first) */
const RUNTIME_PATTERNS = [
  /^\/web\//,
  /^\/build\//,
  /^\/cmaps\//,
  /^\/standard_fonts\//
];

/* Install: precache app shell + a few key icons (optional) */
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE);
    // Best-effort: toolbar icons (skip if a file is missing)
    try {
      await cache.addAll([
        "/web/images/toolbarButton-openFile.svg",
        "/web/images/toolbarButton-download.svg",
        "/web/images/toolbarButton-zoomIn.svg",
        "/web/images/toolbarButton-zoomOut.svg"
      ]);
    } catch (_) {}
    self.skipWaiting();
  })());
});

/* Activate: drop old versions */
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k.startsWith("turbosign-") && k !== CACHE) return caches.delete(k);
    }));
    self.clients.claim();
  })());
});

/* Fetch: cache-first for viewer assets; network pass-through otherwise */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin
  if (url.origin !== location.origin) return;

  // SPA-style navigation → serve index.html
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html", { ignoreSearch: true })
        .then((resp) => resp || fetch(request))
    );
    return;
  }

  // Cache-first for viewer/build/cmaps/standard_fonts
  if (RUNTIME_PATTERNS.some((re) => re.test(url.pathname))) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const resp = await fetch(request);
        if (resp && resp.status === 200) cache.put(request, resp.clone());
        return resp;
      } catch {
        return hit || new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })());
  }
  // else: fall through (network)
});
