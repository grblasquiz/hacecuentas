import type { APIRoute } from 'astro';
import { EMBEDDABLE_TOOLS } from '../../lib/embed-tools';

export const prerender = false;

export const GET: APIRoute = () => {
  const calculators = EMBEDDABLE_TOOLS
    .map((tool) => ({
      s: tool.slug,
      t: tool.locale === 'es' ? tool.title : `${tool.title} · ${tool.locale}`,
      l: tool.locale,
    }))
    .sort((a, b) => a.t.localeCompare(b.t, 'es'));

  return new Response(JSON.stringify(calculators), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
