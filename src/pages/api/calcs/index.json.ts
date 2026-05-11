import type { APIRoute } from 'astro';

// API pública: listado de todas las calcs.
// GET /api/calcs/index.json
// Pensado para devs que quieran consumir el inventario de calcs (backlinks orgánicos de GitHub READMEs).

export const prerender = true;

const calcModules = import.meta.glob<any>('../../../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

export const GET: APIRoute = () => {
  const site = 'https://hacecuentas.com';

  const items = calcs
    .map((c: any) => ({
      slug: c.slug,
      url: `${site}/${c.slug}`,
      h1: c.h1,
      description: c.description,
      category: c.category,
      audience: c.audience || 'AR',
      keywords: (c.seoKeywords || []).slice(0, 8),
      lastUpdated: c.dataUpdate?.lastUpdated || null,
      lastReviewed: c.lastReviewed || null,
      hasLiveData: Array.isArray(c.dataSource) && c.dataSource.length > 0,
    }))
    .sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.slug.localeCompare(b.slug));

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'DataFeed',
    name: 'Hacé Cuentas — Catálogo de calculadoras',
    description:
      'Listado público de todas las calculadoras disponibles en hacecuentas.com. Uso libre para integradores. Licencia CC-BY 4.0.',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@type': 'Organization', name: 'Hacé Cuentas', url: site },
    generatedAt: new Date().toISOString(),
    count: items.length,
    items,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*', // CORS abierto para consumidores
    },
  });
};
