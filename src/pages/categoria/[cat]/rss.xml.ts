import type { APIRoute, GetStaticPaths } from 'astro';
import { shouldBuildCategory } from '../../../lib/incremental';

// RSS por categoría — feeds nicho para bloggers/aggregators temáticos.
// Mejor descubribilidad y syndication targeting.
// /categoria/finanzas/rss.xml, /categoria/salud/rss.xml, etc.

export const prerender = true;

const calcModules = import.meta.glob<any>('../../../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

const CATEGORIES = [
  'finanzas', 'vida', 'salud', 'deportes', 'matematica', 'educacion', 'cocina',
  'tecnologia', 'negocios', 'mascotas', 'viajes', 'construccion', 'ciencia',
  'marketing', 'automotor', 'familia', 'idiomas', 'jardineria', 'electronica',
  'entretenimiento', 'hogar', 'impuestos', 'juegos',
];

export const getStaticPaths: GetStaticPaths = () => {
  return CATEGORIES.filter(shouldBuildCategory).map((cat) => ({ params: { cat } }));
};

function escapeXML(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = ({ params }) => {
  const cat = params.cat as string;
  const site = 'https://hacecuentas.com';

  const items = calcs
    .filter((c: any) => c.category === cat)
    .map((c: any) => {
      const dateStr =
        (c.lastReviewed && /^\d{4}-\d{2}-\d{2}$/.test(c.lastReviewed) ? c.lastReviewed : null) ||
        c.dataUpdate?.lastUpdated ||
        null;
      return { calc: c, date: dateStr ? new Date(dateStr + 'T00:00:00Z') : new Date() };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50);

  const itemsXml = items
    .map(({ calc, date }) => {
      const url = `${site}/${calc.slug}`;
      return `    <item>
      <title>${escapeXML(calc.h1 || calc.title || calc.slug)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXML(calc.description || '')}</description>
      <pubDate>${date.toUTCString()}</pubDate>
      <category>${escapeXML(calc.category)}</category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hacé Cuentas — ${cat.charAt(0).toUpperCase() + cat.slice(1)}</title>
    <link>${site}/categoria/${cat}</link>
    <atom:link href="${site}/categoria/${cat}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Calculadoras de ${cat} actualizadas en Hacé Cuentas.</description>
    <language>es-AR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
