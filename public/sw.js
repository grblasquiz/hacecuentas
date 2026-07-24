// Service Worker — Hacé Cuentas
// Estrategia:
//  - Static (CSS, fonts, imágenes, favicons): cache-first
//  - Navegación (HTML): network-first, fallback a caché y luego a /offline.html
//  - Bypass: analytics, dominios externos (gtag, fonts.googleapis con request por separado)
//  - Versionado por CACHE_VERSION: cambiar el número fuerza re-cache en deploy

const CACHE_VERSION = 'hc-1784906802669';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const OFFLINE_URL = '/offline.html';

// Recursos críticos pre-cacheados al instalar el SW
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/favicon.svg',
  '/manifest.webmanifest',
];

// Dominios que NO queremos interceptar (analytics, ads, fonts externos)
const BYPASS_HOSTS = [
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isHTMLRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
  );
}

function isStaticAsset(url) {
  return /\.(?:css|js|woff2?|ttf|otf|svg|png|jpg|jpeg|webp|ico|json)$/.test(url.pathname);
}

// SWR: rutas que cambian con frecuencia pero queremos servir cache instantáneo
// y revalidar en background. Search index + JSON feed + manifest se actualizan
// con cada deploy pero el user no necesita esperar la red para ver versión cacheada.
const SWR_PATHS = [
  '/search-index.json',
  '/api/calcs-index.json',
  '/feed.json',
  '/manifest.webmanifest',
];

function isSWRPath(url) {
  return SWR_PATHS.includes(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejamos GET
  if (request.method !== 'GET') return;

  // Bypass para dominios externos (analytics/ads/fonts)
  if (url.origin !== self.location.origin || BYPASS_HOSTS.includes(url.hostname)) return;

  // Bypass para sitemap.xml y rss.xml (conviene que vayan a network siempre)
  if (url.pathname === '/sitemap.xml' || url.pathname === '/rss.xml') return;

  // Stale-while-revalidate para JSON feeds chicos que cambian con deploy
  if (isSWRPath(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // HTML / navegación → network-first
  if (isHTMLRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cacheamos respuestas válidas (200, mismo origen)
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets → cache-first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
      })
    );
  }
});

// Permite que la página le diga al SW que se actualice
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// ── Web Push ─────────────────────────────────────────────────────────────────
// Payload JSON: { title, body, url, tag }. Lo manda el worker alerts-recompute
// (cifrado RFC 8291); acá solo se muestra y se abre el link al click.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { /* payload no-JSON */ }
  const title = data.title || 'Hacé Cuentas';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'hc-push',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  const target = new URL(url, self.location.origin);
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (new URL(w.url).pathname === target.pathname && 'focus' in w) return w.focus();
      }
      return clients.openWindow(target.href);
    })
  );
});

// El push service puede rotar la suscripción: re-suscribir con la misma clave
// y avisar al backend pasando el endpoint viejo para migrar los topics.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const old = event.oldSubscription;
        const key = old && old.options && old.options.applicationServerKey;
        if (!key) return;
        const sub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON(), oldEndpoint: old ? old.endpoint : null }),
        });
      } catch (e) { /* mejor esfuerzo */ }
    })()
  );
});
