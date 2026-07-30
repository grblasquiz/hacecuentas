import type { APIRoute } from 'astro';
import computeIndex from '../lib/calc-compute-index.json';

// oEmbed JSON endpoint — https://oembed.com/
//
// Dos modos:
//  1. Sin ?url=  → respuesta genérica type:"link" (back-compat; lo consumen
//     Pinterest/Discord/Slack para previews al compartir hacecuentas.com).
//  2. Con ?url=https://hacecuentas.com/<slug-de-calc-AR>  → type:"rich" con el
//     iframe embebible. Esto es lo que usa el plugin de WordPress (que registra
//     hacecuentas como oEmbed provider) y cualquier consumidor de oEmbed (Ghost,
//     etc.): pegás la URL de una calc y aparece la calculadora embebida.
//
// El html del modo rich es SÓLO el <iframe> (sin enlaces inyectados en la página
// anfitriona) para cumplir las directrices de wordpress.org, que prohíben insertar
// links externos en el sitio público sin opt-in del usuario. El crédito/backlink es
// opt-in: lo agrega el usuario desde el plugin, o vive en el widget self-hosted (/embed.js).

export const prerender = false;

const ORIGIN = 'https://hacecuentas.com';

// slug -> título para las calculadoras en español que tienen /embed/<slug>.
const AR_TITLES = new Map<string, string>();
for (const [slug, calc] of Object.entries(computeIndex as Record<string, { h?: string; loc?: string }>)) {
  if (calc.loc === 'es' && calc.h) AR_TITLES.set(slug, calc.h);
}

function slugFromUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.hostname.replace(/^www\./, '') !== 'hacecuentas.com') return null;
  const segs = u.pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  if (segs.length !== 1) return null; // sólo calcs en la raíz: /<slug>
  const slug = segs[0];
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) return null;
  return slug;
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
  const slug = target ? slugFromUrl(target) : null;
  const title = slug ? AR_TITLES.get(slug) : undefined;

  // Sin url válida o slug desconocido → fallback genérico (back-compat).
  if (!slug || !title) return json(GENERIC);

  const maxwidth = Math.min(
    parseInt(url.searchParams.get('maxwidth') || '720', 10) || 720,
    720,
  );
  const height = 640;
  const embedUrl = `${ORIGIN}/embed/${slug}`;
  const t = escHtml(title);

  // Sólo el iframe — sin enlaces inyectados en la página anfitriona (cumple
  // wordpress.org). El crédito vive dentro del iframe (página propia) y, en el
  // plugin, como opción explícita del usuario.
  const html =
    `<iframe src="${embedUrl}" width="${maxwidth}" height="${height}" ` +
    `style="border:1px solid #e2e8f0;border-radius:12px;max-width:100%;width:${maxwidth}px;height:${height}px;background:#fff" ` +
    `frameborder="0" loading="lazy" title="${t}" allow="clipboard-write"></iframe>`;

  return json({
    version: '1.0',
    type: 'rich',
    title,
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
