import type { APIRoute } from 'astro';
import computeIndex from '../../lib/calc-compute-index.json';

export const prerender = false;

export const GET: APIRoute = () => {
  const calculators = Object.entries(computeIndex)
    .filter(([, entry]: [string, any]) => entry.loc === 'es')
    .map(([slug, entry]: [string, any]) => ({ s: slug, t: entry.h || slug }))
    .sort((a, b) => a.t.localeCompare(b.t, 'es'));

  return new Response(JSON.stringify(calculators), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'CDN-Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
