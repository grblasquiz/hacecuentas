import type { APIRoute } from 'astro';

// oEmbed JSON endpoint — usado por Pinterest, Discord, Slack y otros para
// renderizar previews ricos cuando alguien comparte un link de hacecuentas.com.
// Spec: https://oembed.com/
//
// Genérico por defecto. Para previews por calc específica, oEmbed soporta
// query param ?url=https://hacecuentas.com/calc-X — implementación futura.

export const prerender = true;

export const GET: APIRoute = () => {
  const oembed = {
    version: '1.0',
    type: 'link',
    title: 'Hacé Cuentas — Calculadoras gratis para Argentina',
    author_name: 'Martín Rodríguez',
    author_url: 'https://hacecuentas.com/autores/martin-rodriguez',
    provider_name: 'Hacé Cuentas',
    provider_url: 'https://hacecuentas.com',
    thumbnail_url: 'https://hacecuentas.com/og-default.png',
    thumbnail_width: 1200,
    thumbnail_height: 630,
    cache_age: 3600,
  };
  return new Response(JSON.stringify(oembed, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
