import type { APIRoute } from 'astro';
import tools from '../../lib/current-tools-index.json';

export const prerender = false;

export const GET: APIRoute = () => {
  const calculators = tools;
  const payload = {
    '@type': 'CalculatorIndex',
    name: 'Hacé Cuentas — Catálogo de herramientas',
    description:
      'Índice machine-readable de las herramientas canónicas vigentes de hacecuentas.com.',
    url: 'https://hacecuentas.com/api/calcs-index.json',
    generated: '2026-07-29',
    totalCalcs: calculators.length,
    byCategory: calculators.reduce<Record<string, number>>((counts, tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
      return counts;
    }, {}),
    byLocale: calculators.reduce<Record<string, number>>((counts, tool) => {
      counts[tool.locale] = (counts[tool.locale] || 0) + 1;
      return counts;
    }, {}),
    calculators,
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'CDN-Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
