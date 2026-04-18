import type { APIRoute } from 'astro';

// Force static generation at build time
export const prerender = true;

const calcModules = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

interface CalcWithDate {
  calc: any;
  mtime: Date;
}

function escapeXML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = () => {
  const site = 'https://hacecuentas.com';

  // Ordenar por lastReviewed (si existe) o dataUpdate.lastUpdated, fallback hoy.
  const withDates: CalcWithDate[] = calcs
    .map((c: any) => {
      const dateStr =
        (c.lastReviewed && /^\d{4}-\d{2}-\d{2}$/.test(c.lastReviewed) ? c.lastReviewed : null) ||
        (c.dataUpdate?.lastUpdated && /^\d{4}-\d{2}-\d{2}$/.test(c.dataUpdate.lastUpdated) ? c.dataUpdate.lastUpdated : null) ||
        new Date().toISOString().slice(0, 10);
      return { calc: c, mtime: new Date(dateStr + 'T00:00:00Z') };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .slice(0, 30);

  const items = withDates
    .map(({ calc, mtime }) => {
      const url = `${site}/${calc.slug}`;
      const title = escapeXML(calc.h1);
      const desc = escapeXML(calc.description || calc.intro || '');
      const cat = escapeXML(calc.category);
      return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <category>${cat}</category>
      <pubDate>${mtime.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const lastBuildDate = withDates.length > 0
    ? withDates[0].mtime.toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hacé Cuentas — Calculadoras actualizadas</title>
    <link>${site}</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Últimas calculadoras actualizadas en Hacé Cuentas: sueldo, finanzas, salud, negocios y más.</description>
    <language>es-AR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
