import type { APIRoute } from 'astro';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const calcModules = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

const __dirname = dirname(fileURLToPath(import.meta.url));
const calcsDir = join(__dirname, '..', 'content', 'calcs');

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

  // Combinar calcs con su mtime real para ordenar por más reciente
  const withDates: CalcWithDate[] = calcs
    .map((c: any) => {
      try {
        const filename = `${c.formulaId || c.slug}.json`;
        const stat = statSync(join(calcsDir, filename));
        // Si tiene lastReviewed declarado, ese pisa al mtime
        const dateStr = c.lastReviewed && /^\d{4}-\d{2}-\d{2}$/.test(c.lastReviewed)
          ? c.lastReviewed + 'T00:00:00Z'
          : stat.mtime.toISOString();
        return { calc: c, mtime: new Date(dateStr) };
      } catch {
        return { calc: c, mtime: new Date() };
      }
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
