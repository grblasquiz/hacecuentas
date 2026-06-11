// Endpoint estático: descarga CSV de la tabla principal de cada dataset /datos-* .
// URL → https://hacecuentas.com/datos/<slug>.csv  (segundo `distribution` del
// schema Dataset → formato tabular que prefiere Google Dataset Search).
export const prerender = true;

import type { APIRoute, GetStaticPaths } from 'astro';
import { EXPORTS, toCsv } from '../../lib/datos-export';

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(EXPORTS).map((slug) => ({ params: { slug } }));

export const GET: APIRoute = ({ params }) => {
  const build = EXPORTS[params.slug as string];
  if (!build) return new Response('Not found', { status: 404 });
  return new Response(toCsv(build()), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.slug}.csv"`,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
