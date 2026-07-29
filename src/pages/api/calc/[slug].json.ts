import type { APIRoute } from 'astro';
import { describeCalc, DISCLAIMER, LICENSE } from '../../../lib/calc-compute';

// Ficha dinámica respaldada por el índice programático. Antes se prerenderizaba
// desde `content/calcs*`; la migración a hubs vació esas carpetas y generó 404
// para todas las specs aunque las fórmulas siguieran disponibles.
export const prerender = false;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status === 200
        ? 'public, max-age=3600, stale-while-revalidate=86400'
        : 'public, max-age=300',
      ...CORS,
    },
  });
}

export const GET: APIRoute = ({ params }) => {
  const slug = params.slug || '';
  const calc = describeCalc(slug);
  if (!calc) {
    return json({
      ok: false,
      error: 'calc_not_found',
      message: `No existe una calculadora programática con slug "${slug}".`,
      catalog: 'https://hacecuentas.com/api/calcs-index.json',
    }, 404);
  }

  return json({
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    ...calc,
    compute: {
      method: 'GET',
      altMethod: 'POST',
      url: `https://hacecuentas.com/api/calc/${slug}/compute`,
      example: calc.exampleComputeUrl,
      note: 'Pasá inputs como query params (GET) o JSON body (POST).',
    },
    license: LICENSE,
    attribution: `Hacé Cuentas — ${calc.url}`,
    disclaimer: DISCLAIMER,
  });
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
