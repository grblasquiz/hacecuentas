// Endpoint estático: descarga JSON de cada dataset /datos-* .
// URL → https://hacecuentas.com/datos/<slug>.json  (referenciada en el
// `distribution` del schema Dataset de cada página → Google Dataset Search).
export const prerender = true;

import type { APIRoute, GetStaticPaths } from 'astro';
import { EXPORTS, toJson } from '../../lib/datos-export';

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(EXPORTS).map((slug) => ({ params: { slug } }));

export const GET: APIRoute = ({ params }) => {
  const build = EXPORTS[params.slug as string];
  if (!build) return new Response('Not found', { status: 404 });
  const body = JSON.stringify(toJson(build()), null, 2) + '\n';
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
