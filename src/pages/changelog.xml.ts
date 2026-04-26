import type { APIRoute } from 'astro';

// Force static generation at build time
export const prerender = true;

interface ChangelogEntry {
  slug: string;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
  related?: string[];
}

const entryModules = import.meta.glob<ChangelogEntry>('../content/changelog/*.json', { eager: true });
const entries: ChangelogEntry[] = Object.values(entryModules).map((m: any) => (m.default ? m.default : m));

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

  const sorted = [...entries].sort((a, b) => {
    const cmp = b.date.localeCompare(a.date);
    return cmp !== 0 ? cmp : b.slug.localeCompare(a.slug);
  });

  const items = sorted
    .map((e) => {
      const url = `${site}/changelog#${e.slug}`;
      const title = escapeXML(e.title);
      const desc = escapeXML(e.summary);
      const pubDate = new Date(e.date + 'T00:00:00Z').toUTCString();
      const categories = (e.tags || [])
        .map((t) => `      <category>${escapeXML(t)}</category>`)
        .join('\n');
      // Body: el body ya viene como HTML; lo envolvemos en CDATA para no
      // tener que reescaparlo y mantener el markup intacto en lectores RSS.
      const content = `<![CDATA[<p>${e.summary}</p>${e.body || ''}]]>`;
      return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="false">hacecuentas-changelog-${escapeXML(e.slug)}</guid>
      <description>${desc}</description>
${categories}
      <pubDate>${pubDate}</pubDate>
      <content:encoded>${content}</content:encoded>
    </item>`;
    })
    .join('\n');

  const lastBuildDate = sorted.length > 0
    ? new Date(sorted[0].date + 'T00:00:00Z').toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Hacé Cuentas — Changelog</title>
    <link>${site}/changelog</link>
    <atom:link href="${site}/changelog.xml" rel="self" type="application/rss+xml" />
    <description>Historial público de cambios de Hacé Cuentas: calculadoras nuevas, fórmulas actualizadas, fixes y mejoras.</description>
    <language>es</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
