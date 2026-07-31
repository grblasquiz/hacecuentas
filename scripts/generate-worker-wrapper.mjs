#!/usr/bin/env node
/**
 * Post-build: genera `dist/server/wrapper.mjs` que aplica redirects (trailing
 * slash 308, pruning 301, gone-410, www→apex 410 sitemaps) ANTES de delegar al
 * entry de Astro.
 *
 * ¿Por qué?
 *   El handler del adapter `@astrojs/cloudflare/entrypoints/server` invoca
 *   `env.ASSETS.fetch()` ANTES de correr el middleware de Astro. CF Workers
 *   Static Assets sigue redirects de `_redirects` internamente (fetch default
 *   `redirect: "follow"`) → un `_redirects` `/foo /bar 301` termina sirviendo
 *   `/bar` con HTTP 200, no 301. Para 783 URLs (262 pruning + 521 gone-410 +
 *   trailing slash global) el resultado es soft-404 masivo y SEO roto.
 *
 *   El wrapper hace los checks antes y devuelve la Response final sin
 *   tocar ASSETS, evitando el follow.
 *
 *   También cambia `main` en `dist/server/wrangler.json` para que wrangler
 *   use `wrapper.mjs` en vez del `entry.mjs` original.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RedirectCycleError,
  combineRedirectEntries,
  flattenRedirectGraph,
  parseCloudflareRedirects,
  parsePruningRedirects,
  toWorkerRedirectMap,
} from './lib/redirect-graph.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DIST_SERVER = join(REPO_ROOT, 'dist', 'server');

// Fast pages: HTMLs autónomos que se suben como assets sin ejecutar Astro.
// El manifest conserva el mapping URL pública → archivo dentro de
// public/_fast-pages/. Se inyecta en el wrapper para que run_worker_first no
// mande esas rutas a Astro (que no conoce la ruta y devolvería 404).
const fastPagesPath = join(REPO_ROOT, 'public', 'fast-pages.json');
let fastPageRoutes = {};
try {
  const parsed = JSON.parse(readFileSync(fastPagesPath, 'utf8'));
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    for (const [route, asset] of Object.entries(parsed)) {
      if (
        typeof route === 'string' && /^\/[A-Za-z0-9-]+$/.test(route) &&
        typeof asset === 'string' && /^[A-Za-z0-9-]+\.html$/.test(asset)
      ) fastPageRoutes[route] = asset;
    }
  }
} catch {
  // Sin manifest = no hay fast pages. Es opcional para builds normales.
}

// ---- Parse public/_redirects (full file: pruning + general redirects) ------
// Formato CF: `<source>  <destination>  <status>` (whitespace-separated).
// Lineas vacias o que empiezan con # se ignoran. Comodines (`*`/`/:splat`)
// NO se soportan en el wrapper — se asume todas las entries son paths exactos.
const redirectsTxt = readFileSync(
  join(REPO_ROOT, 'public', '_redirects'),
  'utf8',
);
const { entries: redirectEntries } = parseCloudflareRedirects(redirectsTxt);

// ---- Parse PRUNING_REDIRECTS (src/lib/pruning-redirects.ts) -----------------
// Estas entries viven SOLO acá (NO caben en _redirects: límite 2000 reglas CF).
// El middleware de Astro también las chequea, pero tras el build split NO corre
// para rutas sin asset (la request muere en el 404 prerendered antes de llegar
// al middleware) → si el wrapper no las inlinea, son 404 en prod. Regresión
// detectada 2026-07-11: ~840 URLs podadas devolvían 404 en vez de 301.
const pruningTs = readFileSync(
  join(REPO_ROOT, 'src', 'lib', 'pruning-redirects.ts'),
  'utf8',
);
const pruningEntries = parsePruningRedirects(pruningTs);

// ---- Parse GONE_410_URLS ---------------------------------------------------
const goneTs = readFileSync(
  join(REPO_ROOT, 'src', 'lib', 'gone-410.ts'),
  'utf8',
) + readFileSync(
  join(REPO_ROOT, 'src', 'lib', 'removed-ymyl-hubs.ts'),
  'utf8',
);
const goneRe = /"(\/[^"]+)"/g;
const goneEntries = [];
let gm;
while ((gm = goneRe.exec(goneTs)) !== null) {
  goneEntries.push(gm[1]);
}

if (redirectEntries.length === 0 || goneEntries.length === 0 || pruningEntries.length === 0) {
  console.error('[wrap-worker] No entries parsed — aborting.');
  process.exit(1);
}

// Guard del límite duro de CF: public/_redirects admite 2000 reglas. Pasarse
// hace que CF RECHACE el deploy entero (no degrada: falla). Cortamos acá, en
// build, en vez de descubrirlo cuando wrangler ya subió todo lo demás.
// Reglas nuevas que no entren van por src/lib/pruning-redirects.ts, que se
// inlinea en el wrapper y no consume cupo de _redirects.
const REDIRECTS_HARD_LIMIT = 2000;
const REDIRECTS_WARN_AT = 1900;
if (redirectEntries.length > REDIRECTS_HARD_LIMIT) {
  console.error(
    `[wrap-worker] public/_redirects tiene ${redirectEntries.length} reglas — ` +
      `supera el límite duro de CF (${REDIRECTS_HARD_LIMIT}). CF rechazaría el deploy. ` +
      `Movés reglas a src/lib/pruning-redirects.ts (se inlinean acá, sin cupo).`,
  );
  process.exit(1);
}
if (redirectEntries.length >= REDIRECTS_WARN_AT) {
  console.warn(
    `[wrap-worker] ⚠ public/_redirects: ${redirectEntries.length}/${REDIRECTS_HARD_LIMIT} reglas ` +
      `(quedan ${REDIRECTS_HARD_LIMIT - redirectEntries.length}). Empezá a mandar las nuevas ` +
      `a src/lib/pruning-redirects.ts.`,
  );
}

// ---- CSP principal ----------------------------------------------------------
// Vive en src/lib/csp-main.txt y se sirve desde el wrapper (no desde _headers):
// CF Workers Static Assets corta lineas de _headers a 2000 chars y la politica
// ya rozaba el limite. Ademas _headers solo aplica a assets estaticos → las
// paginas SSR quedaban sin CSP. El wrapper cubre ambos casos.
const mainCsp = readFileSync(
  join(REPO_ROOT, 'src', 'lib', 'csp-main.txt'),
  'utf8',
).trim();
if (!mainCsp.startsWith("default-src 'self'")) {
  console.error('[wrap-worker] src/lib/csp-main.txt invalida — aborting.');
  process.exit(1);
}

// ---- Build REDIRECT_MAP: path → { dst, status } ----------------------------
// Mantenemos status por entry (mayoria 301, pero algunos pueden ser 302/308).
// Pruning primero, _redirects después: ante overlap gana _redirects (más
// específico/actual que el batch de poda).
const { map: rawRedirectMap, overlaps: redirectOverlaps } =
  combineRedirectEntries(pruningEntries, redirectEntries);
let flattenedRedirectMap;
let redirectChains;
try {
  ({ flattened: flattenedRedirectMap, chains: redirectChains } =
    flattenRedirectGraph(rawRedirectMap));
} catch (error) {
  if (error instanceof RedirectCycleError) {
    console.error(`[wrap-worker] ${error.message}`);
    process.exit(1);
  }
  throw error;
}
const redirectMap = toWorkerRedirectMap(flattenedRedirectMap);

// ---- Build wrapper ---------------------------------------------------------
const wrapperJs = `// Generated by scripts/generate-worker-wrapper.mjs — DO NOT EDIT MANUALLY
// Wraps entry.mjs to apply redirects BEFORE env.ASSETS.fetch (which follows
// _redirects internally, breaking 301/308/410 → 200 soft-404 globally).
import astroHandler from './entry.mjs';

const REDIRECT_MAP = Object.freeze(${JSON.stringify(redirectMap)});
const GONE_410_URLS = new Set(${JSON.stringify(goneEntries)});
const FAST_PAGE_ROUTES = Object.freeze(${JSON.stringify(fastPageRoutes)});

const APEX_HOSTS = new Set(['hacecuentas.com', 'www.hacecuentas.com']);

const GONE_RESPONSE_BODY = '<!doctype html><title>410 Gone</title><h1>Gone</h1><p>This page has been permanently removed.</p>';
const GONE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=86400',
  'X-Robots-Tag': 'noindex',
};

const SITEMAP_410_BODY = '<?xml version="1.0" encoding="UTF-8"?>\\n<!--\\nThis sitemap has been permanently removed (410 Gone).\\nThe canonical sitemap is at https://hacecuentas.com/sitemap.xml\\n-->\\n';
const SITEMAP_410_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=86400',
  'X-Robots-Tag': 'noindex',
};

// Embed widgets: CSP que permite cargar /embed/* en cualquier dominio externo
// (frame-ancestors *). /embed/* es prerender → ni el middleware (no corre para
// assets estaticos) ni _headers (CF Workers Static Assets ignora el operador !
// para borrar el XFO/CSP global heredado) pueden override los headers. El
// wrapper corre para TODA request → es el unico lugar que gana. Sin esto el
// plugin de WordPress, /embeber y oEmbed no cargan cross-origin (el caso de uso
// entero). Mantener en sync con el bloque /embed/* de public/_headers.
const EMBED_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' blob: https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://dolarapi.com https://api.argentinadatos.com https://region1.google-analytics.com https://open.er-api.com https://api.coingecko.com; frame-ancestors *";

// CSP principal del sitio (fuente: src/lib/csp-main.txt, inyectada en build).
// Se setea aca y no en _headers: limite de 2000 chars/linea de CF + _headers
// no cubre respuestas SSR.
const MAIN_CSP = ${JSON.stringify(mainCsp)};

const LIVE_SITEMAPS = new Set([
  '/sitemap-priority.xml', '/sitemap-core.xml', '/sitemap-blog.xml', '/sitemap-news.xml',
  '/sitemap-tablas.xml', '/sitemap-hubs.xml', '/sitemap-iibb.xml', '/sitemap-fresh.xml',
]);

/** Saca %20, segmentos vacíos y segmentos 'null'/'undefined'. Devuelve el path tal cual si ya está sano. */
function sanitizePath(pathname) {
  let clean = pathname
    .replace(/%20/gi, ' ')
    .split('/')
    .map((seg) => seg.trim())
    .filter((seg, i, arr) => seg !== 'null' && seg !== 'undefined' && (seg !== '' || i === 0 || i === arr.length - 1))
    .join('/')
    .replace(/\\/{2,}/g, '/')
    .replace(/\\/+$/, '');
  return clean === '' ? '/' : clean;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1) 410 Gone para sitemaps del subdomain www
    if (url.hostname === 'www.hacecuentas.com' && url.pathname.startsWith('/sitemap')) {
      return new Response(SITEMAP_410_BODY, { status: 410, statusText: 'Gone', headers: SITEMAP_410_HEADERS });
    }

    if (APEX_HOSTS.has(url.hostname)) {
      // 2) Trailing slash → 308 permanente
      if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
        const target = url.pathname.replace(/\\/+$/, '');
        return Response.redirect(\`https://hacecuentas.com\${target}\${url.search}\`, 308);
      }

      // 2b) Sitemaps retirados → 410. Tras la consolidación en hubs el índice
      // quedó con 7; los viejos por país/categoría siguen registrados en
      // GSC/Bing desde antes y los bots los piden igual, comiendo 404.
      if (/^\\/sitemap-[a-z0-9-]+\\.xml$/.test(url.pathname) && !LIVE_SITEMAPS.has(url.pathname)) {
        return new Response(SITEMAP_410_BODY, { status: 410, statusText: 'Gone', headers: SITEMAP_410_HEADERS });
      }

      // 2c) Paths malformados → 301 al path saneado. Dos formas vistas en los
      // edge logs: '/%20/viajes/equipaje' (href con un espacio de más) y
      // '/eventos/null' (slug interpolado como el string 'null'). Vienen de
      // enlaces externos que ya no podemos editar. Va acá y no en el middleware
      // de Astro porque para una ruta sin asset la request muere en el 404
      // prerendered antes de llegar al middleware.
      const cleaned = sanitizePath(url.pathname);
      if (cleaned !== url.pathname) {
        return Response.redirect(\`https://hacecuentas.com\${cleaned}\${url.search}\`, 301);
      }

      // 3) 410 Gone para zombies (chequear antes que pruning para que gane si hay overlap)
      if (GONE_410_URLS.has(url.pathname)) {
        return new Response(GONE_RESPONSE_BODY, { status: 410, statusText: 'Gone', headers: GONE_HEADERS });
      }

      // 4) Redirects from _redirects (pruning + general 301s)
      const redirect = REDIRECT_MAP[url.pathname];
      if (redirect) {
        return Response.redirect(\`https://hacecuentas.com\${redirect.d}\${url.search}\`, redirect.s);
      }

    }

    // 5) Fast pages: assets HTML aislados, sin bundle/prerender de Astro.
    // El mapa se genera desde public/fast-pages.json y se despliega junto con
    // el HTML vía deploy:fast-page. Va antes de Astro porque run_worker_first
    // está activo y Astro no tiene estas rutas en su manifest.
    const fastAsset = FAST_PAGE_ROUTES[url.pathname];
    const response = fastAsset && (request.method === 'GET' || request.method === 'HEAD')
      ? await env.ASSETS.fetch(new Request(new URL('/_fast-pages/' + fastAsset, url), request))
      : await astroHandler.fetch(request, env, ctx);

    // 6) Embed widgets: override de headers para habilitar carga cross-origin.
    //    Ver nota en EMBED_CSP arriba. Mutamos una copia (los headers de la
    //    Response de ASSETS son inmutables) DESPUES de _headers → ganamos.
    if (APEX_HOSTS.has(url.hostname) && url.pathname.startsWith('/embed/')) {
      const embedRes = new Response(response.body, response);
      embedRes.headers.delete('X-Frame-Options');
      embedRes.headers.set('Content-Security-Policy', EMBED_CSP);
      embedRes.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
      embedRes.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
      return embedRes;
    }

    // 7) CSP principal en todo lo demas (los headers de ASSETS son inmutables →
    //    copia). Reemplaza la linea CSP que vivia en el bloque /* de _headers.
    const finalRes = new Response(response.body, response);
    finalRes.headers.set('Content-Security-Policy', MAIN_CSP);
    return finalRes;
  },
};
`;

writeFileSync(join(DIST_SERVER, 'wrapper.mjs'), wrapperJs);

// ---- Update dist/server/wrangler.json: main → wrapper.mjs ------------------
const wranglerPath = join(DIST_SERVER, 'wrangler.json');
const wrangler = JSON.parse(readFileSync(wranglerPath, 'utf8'));
const prevMain = wrangler.main;
wrangler.main = 'wrapper.mjs';
// @astrojs/cloudflare still emits this compatibility field, but Wrangler 4.111+
// rejects it. Service environments already use the same behavior by default.
delete wrangler.legacy_env;
writeFileSync(wranglerPath, JSON.stringify(wrangler));

console.log(
  `[wrap-worker] Wrote dist/server/wrapper.mjs ` +
    `(${redirectEntries.length} _redirects + ${pruningEntries.length} pruning + ${goneEntries.length} gone-410 inlined, ` +
    `${Object.keys(redirectMap).length} redirects únicos, ${redirectChains.length} cadenas aplanadas, ` +
    `${redirectOverlaps.length} overlaps con precedencia _redirects). ` +
    `wrangler.json main: ${prevMain} → wrapper.mjs`,
);
