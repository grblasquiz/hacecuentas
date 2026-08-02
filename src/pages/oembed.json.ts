import type { APIRoute } from 'astro';
import { EMBEDDABLE_BY_PATH } from '../lib/embed-tools';
import { PRUNING_REDIRECTS } from '../lib/pruning-redirects';

// oEmbed JSON endpoint — https://oembed.com/
//
// Dos modos:
//  1. Sin ?url=  → respuesta genérica type:"link" (back-compat; lo consumen
//     Pinterest/Discord/Slack para previews al compartir hacecuentas.com).
//  2. Con ?url=https://hacecuentas.com/<ruta-de-hub>  → type:"rich" con el
//     iframe embebible. Esto es lo que usa el plugin de WordPress (que registra
//     hacecuentas como oEmbed provider) y cualquier consumidor de oEmbed.
//     Las URLs viejas de calculadora se resuelven por el mapa de 301 al hub.
//
// El html del modo rich es SÓLO el <iframe> (sin enlaces inyectados en la página
// anfitriona) para cumplir las directrices de wordpress.org, que prohíben insertar
// links externos en el sitio público sin opt-in del usuario. El crédito/backlink es
// opt-in: lo agrega el usuario desde el plugin.

export const prerender = false;

const ORIGIN = 'https://hacecuentas.com';

function pathFromUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.hostname.replace(/^www\./, '') !== 'hacecuentas.com') return null;
  const clean = u.pathname
    .replace(/\.html$/, '')
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '') || '/';
  if (!/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]+$/.test(clean)) return null;
  return clean;
}

/** Resuelve tanto un hub actual como una URL vieja que hoy hace 301 al hub. */
function resolveHubPath(path: string): string | null {
  let current = path;
  const seen = new Set<string>();
  for (let i = 0; i < 10 && !seen.has(current); i += 1) {
    if (EMBEDDABLE_BY_PATH.has(current)) return current;
    seen.add(current);
    current = PRUNING_REDIRECTS[current];
    if (!current) return null;
  }
  return null;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const GENERIC = {
  version: '1.0',
  type: 'link',
  title: 'Hacé Cuentas — Calculadoras gratis para Argentina y LatAm',
  author_name: 'Martín Rodríguez',
  author_url: `${ORIGIN}/autores/martin-rodriguez`,
  provider_name: 'Hacé Cuentas',
  provider_url: ORIGIN,
  thumbnail_url: `${ORIGIN}/og-default.png`,
  thumbnail_width: 1200,
  thumbnail_height: 630,
  cache_age: 3600,
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const GET: APIRoute = ({ url }) => {
  // oEmbed permite ?format=xml; sólo servimos JSON.
  if (url.searchParams.get('format') === 'xml') {
    return new Response('Sólo se soporta el formato JSON.', { status: 501 });
  }

  const target = url.searchParams.get('url');
  const requestedPath = target ? pathFromUrl(target) : null;
  const hubPath = requestedPath ? resolveHubPath(requestedPath) : null;
  const tool = hubPath ? EMBEDDABLE_BY_PATH.get(hubPath) : undefined;

  // Sin URL válida o ruta desconocida → fallback genérico (back-compat).
  if (!hubPath || !tool) return json(GENERIC);

  const requestedWidth = parseInt(url.searchParams.get('maxwidth') || '720', 10) || 720;
  const maxwidth = Math.max(320, Math.min(requestedWidth, 720));
  const height = 760;
  const embedUrl = `${ORIGIN}${hubPath}?hc_embed=1`;
  const t = escHtml(tool.title);

  // Sólo el iframe — sin enlaces inyectados en la página anfitriona (cumple
  // wordpress.org). En el plugin, el crédito queda como opción explícita del
  // usuario y se renderiza fuera del iframe.
  const html =
    `<iframe src="${embedUrl}" width="${maxwidth}" height="${height}" ` +
    `style="border:1px solid #e2e8f0;border-radius:12px;max-width:100%;width:${maxwidth}px;height:${height}px;background:#fff" ` +
    `frameborder="0" loading="lazy" title="${t}" allow="clipboard-write"></iframe>`;

  return json({
    version: '1.0',
    type: 'rich',
    title: tool.title,
    html,
    width: maxwidth,
    height,
    author_name: 'Hacé Cuentas',
    author_url: ORIGIN,
    provider_name: 'Hacé Cuentas',
    provider_url: ORIGIN,
    thumbnail_url: `${ORIGIN}/og-default.png`,
    thumbnail_width: 1200,
    thumbnail_height: 630,
    cache_age: 3600,
  });
};
