import { defineMiddleware } from 'astro:middleware';
import { PRUNING_REDIRECTS } from './lib/pruning-redirects';
import { GONE_410_URLS } from './lib/gone-410';

/**
 * Astro middleware — corre antes de cualquier route en el Worker de CF.
 *
 * Responsabilidades:
 *
 * 1) **410 Gone para sitemaps del subdomain `www.hacecuentas.com`** —
 *    Google Search Console tiene una propiedad separada para `www.hacecuentas.com`
 *    con su propio sitemap (también con 7.526 URLs duplicadas del apex).
 *    Aunque hagamos 301 del www al apex, GSC sigue tratando el sitemap del www
 *    como activo y eso le marca a Google que tiene 2 versiones del sitio,
 *    duplicando el contenido visible para crawl/index purposes.
 *
 *    Solución: cuando Googlebot (o cualquiera) pide
 *    `https://www.hacecuentas.com/sitemap*`, devolvemos **410 Gone**. Eso le
 *    dice a Google "este sitemap fue eliminado permanentemente" y lo quita
 *    de su queue. Resto del subdomain sigue redirigiendo 301 al apex normal.
 *
 *    NOTA: para que esto funcione, la Worker Route debe estar configurada en
 *    `wrangler.jsonc` para capturar `www.hacecuentas.com/sitemap*` (sino el
 *    Edge de CF redirige antes que llegue al Worker).
 *
 * 2) **410 para sitemaps retirados** y **301 para paths malformados**
 *    (`/%20/...`, `/algo/null`) — ver los bloques correspondientes abajo.
 */

/** Sitemaps que el índice (`/sitemap.xml`) referencia hoy. El resto = 410. */
const LIVE_SITEMAPS: ReadonlySet<string> = new Set([
  '/sitemap-priority.xml',
  '/sitemap-core.xml',
  '/sitemap-calcs-finanzas.xml',
  '/sitemap-calcs-construccion.xml',
  '/sitemap-hubs-recovery.xml',
  '/sitemap-calcs-entretenimiento.xml',
  '/sitemap-co.xml',
  '/sitemap-pe.xml',
  '/sitemap-ec.xml',
  '/sitemap-en.xml',
  '/sitemap-blog.xml',
  '/sitemap-news.xml',
  '/sitemap-comparaciones.xml',
  '/sitemap-tablas.xml',
  '/sitemap-hubs.xml',
  '/sitemap-iibb.xml',
  '/sitemap-fresh.xml',
  '/sitemap-images.xml',
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // ────── 410 Gone para sitemaps del www subdomain ──────
  if (url.hostname === 'www.hacecuentas.com' && url.pathname.startsWith('/sitemap')) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<!--\nThis sitemap has been permanently removed (410 Gone).\nThe canonical sitemap is at https://hacecuentas.com/sitemap.xml\n-->\n`,
      {
        status: 410,
        statusText: 'Gone',
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'X-Robots-Tag': 'noindex',
        },
      }
    );
  }

  // ────── Sitemaps retirados → 410 Gone ──────
  // Tras la consolidación en hubs el índice quedó con un set corto y explícito
  // de sitemaps. Los viejos por país y por
  // categoría siguen registrados en GSC/Bing desde antes, así que los bots los
  // piden igual y comen 404. 410 le dice "removido" y los saca de la cola.
  if (
    (url.hostname === 'hacecuentas.com' || url.hostname === 'www.hacecuentas.com') &&
    /^\/sitemap-[a-z0-9-]+\.xml$/.test(url.pathname) &&
    !LIVE_SITEMAPS.has(url.pathname)
  ) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Sitemap retirado (410 Gone). Índice vigente: https://hacecuentas.com/sitemap.xml -->\n`,
      {
        status: 410,
        statusText: 'Gone',
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'X-Robots-Tag': 'noindex',
        },
      }
    );
  }

  // ────── Trailing slash → 308 permanente ──────
  // Astro está en trailingSlash: 'never'. CF Pages Static Assets responde 307
  // (temporal) por default, lo cual mantiene ambas versiones en index y diluye
  // link equity. Forzamos 308 (permanente) acá para que Google consolide al
  // único canonical sin trailing slash.
  if (
    (url.hostname === 'hacecuentas.com' || url.hostname === 'www.hacecuentas.com') &&
    url.pathname.length > 1 &&
    url.pathname.endsWith('/')
  ) {
    const targetPath = url.pathname.replace(/\/+$/, '');
    return Response.redirect(`https://hacecuentas.com${targetPath}${url.search}`, 308);
  }

  // ────── Paths malformados → 301 al path saneado ──────
  // Dos formas que aparecen en los edge logs y hoy mueren en 404:
  //   /%20/viajes/equipaje  → un href con espacio de más en la fuente
  //   /eventos/null, /null  → un slug que se interpoló como el string "null"
  // Ambas llegan de enlaces externos/scrapers que ya no podemos editar, así que
  // las saneamos acá en vez de dejarlas caer.
  if (url.hostname === 'hacecuentas.com' || url.hostname === 'www.hacecuentas.com') {
    let clean = url.pathname
      .replace(/%20/gi, ' ')
      .split('/')
      .map((seg) => seg.trim())
      .filter((seg, i, arr) => seg !== 'null' && seg !== 'undefined' && (seg !== '' || i === 0 || i === arr.length - 1))
      .join('/')
      .replace(/\/{2,}/g, '/')
      .replace(/\/+$/, '');
    if (clean === '') clean = '/';
    if (clean !== url.pathname) {
      return Response.redirect(`https://hacecuentas.com${clean}${url.search}`, 301);
    }
  }


  // ────── 410 Gone para zombies con verdadero 0-trafico ──────
  // Acelera la desindexacion vs 301: Google saca la URL del index mas rapido
  // cuando recibe 410 (vs queue de re-crawl con 301). Mueller lo confirmo
  // multiples veces. Solo aplica a URLs con clicks==0 y impressions==0
  // en GSC (sin riesgo de perder link equity). La lista se genera con
  // `python3 scripts/audit-pruning-vs-gsc.py --emit-gone-410`.
  if (url.hostname === 'hacecuentas.com' || url.hostname === 'www.hacecuentas.com') {
    if (GONE_410_URLS.has(url.pathname)) {
      return new Response('<!doctype html><title>410 Gone</title><h1>Gone</h1><p>This page has been permanently removed.</p>', {
        status: 410,
        statusText: 'Gone',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'X-Robots-Tag': 'noindex',
        },
      });
    }
  }

  // ────── Pruning redirects (post-HCU recovery) ──────
  // CF Workers Static Assets sirve el HTML antes que aplique `_redirects`
  // si el archivo existe en dist/. Para forzar el 301 sin borrar JSONs (que
  // perdería link equity si nos arrepentimos), aplicamos el redirect acá.
  // El mapa se genera desde `public/_redirects` por
  // scripts/extract-pruning-redirects.py.
  if (url.hostname === 'hacecuentas.com' || url.hostname === 'www.hacecuentas.com') {
    const target = PRUNING_REDIRECTS[url.pathname];
    if (target) {
      return Response.redirect(`https://hacecuentas.com${target}`, 301);
    }
  }

  // ────── Cross-Origin isolation headers ──────
  // Aplicados acá vía middleware porque CF Workers Static Assets ignora
  // silenciosamente Cross-Origin-* en `_headers` (otros headers como CSP/HSTS
  // sí se respetan, pero estos tres no — verificado 2026-05-04).
  //
  // Política:
  // - /embed/* y hubs con ?hc_embed=1: cross-origin permitido
  // - resto: same-origin para isolation + defense vs Spectre/hotlinking
  // - COEP removido (2026-05-29): cero valor SEO y causa plausible de cortes
  //   intermitentes de GA4 (subrecursos de terceros sin CORP se caían bajo
  //   credentialless). AdSense ya no se usa, así que la razón histórica murió.
  const response = await next();
  const isEmbed = url.pathname.startsWith('/embed/') || url.searchParams.get('hc_embed') === '1';
  response.headers.set('Cross-Origin-Opener-Policy', isEmbed ? 'unsafe-none' : 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', isEmbed ? 'cross-origin' : 'same-origin');
  return response;
});
