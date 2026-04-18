// Service Worker — Hacé Cuentas
// Estrategia:
//  - Static (CSS, fonts, imágenes, favicons): cache-first
//  - Navegación (HTML): network-first, fallback a caché y luego a /offline.html
//  - Bypass: analytics, dominios externos (gtag, fonts.googleapis con request por separado)
//  - Versionado por CACHE_VERSION: cambiar el número fuerza re-cache en deploy

const CACHE_VERSION = 'hc-1776529488201';
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
  'pagead2.googlesyndication.com',
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

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejamos GET
  if (request.method !== 'GET') return;

  // Bypass para dominios externos (analytics/ads/fonts)
  if (url.origin !== self.location.origin || BYPASS_HOSTS.includes(url.hostname)) return;

  // Bypass para sitemap.xml y rss.xml (conviene que vayan a network siempre)
  if (url.pathname === '/sitemap.xml' || url.pathname === '/rss.xml') return;

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
