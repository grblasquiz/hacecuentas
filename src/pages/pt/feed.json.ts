import type { APIRoute } from 'astro';

// JSON Feed v1.1 (PT-BR) — formato preferido por AI crawlers (Claude, Perplexity).
// Sirve las últimas 50 calcs PT actualizadas. Spec: jsonfeed.org/version/1.1
// Antes solo existía /feed.json (ES) → los crawlers de IA no veían el catálogo PT.

export const prerender = true;

const calcModules = import.meta.glob<any>('../../content/calcs-pt/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

export const GET: APIRoute = () => {
  const site = 'https://hacecuentas.com';

  const withDates = calcs
    .map((c: any) => {
      const dateStr =
        (c.lastReviewed && /^\d{4}-\d{2}-\d{2}$/.test(c.lastReviewed) ? c.lastReviewed : null) ||
        c.dataUpdate?.lastUpdated ||
        null;
      return { calc: c, date: dateStr ? new Date(dateStr + 'T00:00:00Z') : new Date() };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50);

  const items = withDates.map(({ calc, date }) => {
    const iso = date.toISOString();
    return {
      id: `${site}/pt/${calc.slug}`,
      url: `${site}/pt/${calc.slug}`,
      title: calc.h1 || calc.title || calc.slug,
      content_text: calc.description || '',
      summary: calc.description || '',
      date_published: iso,
      date_modified: iso,
      tags: [calc.category, ...(calc.seoKeywords || []).slice(0, 5)].filter(Boolean),
      authors: [{ name: 'Martín Rodríguez', url: `${site}/autores/martin-rodriguez` }],
      language: 'pt-BR',
    };
  });

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Hacé Cuentas — Calculadoras atualizadas (PT)',
    home_page_url: `${site}/pt`,
    feed_url: `${site}/pt/feed.json`,
    description:
      'Calculadoras grátis online: salário, INSS, FGTS, IRPF, MEI, IMC, gravidez, matemática e conversões.',
    icon: `${site}/og-default.png`,
    favicon: `${site}/favicon.ico`,
    language: 'pt-BR',
    authors: [{ name: 'Martín Rodríguez', url: `${site}/autores/martin-rodriguez` }],
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
