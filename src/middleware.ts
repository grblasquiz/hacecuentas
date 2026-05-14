import { defineMiddleware } from 'astro:middleware';
import { PRUNING_REDIRECTS } from './lib/pruning-redirects';

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
 */
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
  // - /embed/*: cross-origin permitido (es el feature core)
  // - resto: same-origin para isolation + defense vs Spectre/hotlinking
  // - COEP credentialless (no require-corp) para no romper AdSense
  const response = await next();
  const isEmbed = url.pathname.startsWith('/embed/');
  response.headers.set('Cross-Origin-Opener-Policy', isEmbed ? 'unsafe-none' : 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  response.headers.set('Cross-Origin-Resource-Policy', isEmbed ? 'cross-origin' : 'same-origin');
  return response;
});
