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
      <dc:creator>Equipo editorial Hacé Cuentas</dc:creator>
      <pubDate>${mtime.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const lastBuildDate = withDates.length > 0
    ? withDates[0].mtime.toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>Hacé Cuentas — Calculadoras actualizadas</title>
    <link>${site}</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <atom:link href="https://pubsubhubbub.superfeedr.com/" rel="hub" />
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />
    <description>Calculadoras argentinas actualizadas: sueldo, aguinaldo, monotributo, ganancias, jubilación. Datos oficiales (AFIP, BCRA, ANSES) verificados por el equipo editorial.</description>
    <language>es-AR</language>
    <copyright>© ${new Date().getFullYear()} Hacé Cuentas. Contenido bajo CC BY 4.0 (atribución requerida).</copyright>
    <managingEditor>editorial@hacecuentas.com (Equipo editorial Hacé Cuentas)</managingEditor>
    <webMaster>editorial@hacecuentas.com (Equipo editorial Hacé Cuentas)</webMaster>
    <category>Finanzas</category>
    <category>Argentina</category>
    <category>Calculadoras</category>
    <category>Impuestos</category>
    <generator>Astro + custom RSS pipeline</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>360</ttl>
    <sy:updatePeriod>daily</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <image>
      <url>${site}/og-default.png</url>
      <title>Hacé Cuentas</title>
      <link>${site}</link>
      <width>1200</width>
      <height>630</height>
    </image>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
