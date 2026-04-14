import type { APIRoute } from 'astro';

const calcModules = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

export const GET: APIRoute = () => {
  const site = 'https://hacecuentas.com';
  const now = new Date().toISOString().split('T')[0];

  const urls = [
    { loc: `${site}/`, priority: '1.0' },
    ...calcs.map((c) => ({ loc: `${site}/${c.slug}`, priority: '0.8' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
