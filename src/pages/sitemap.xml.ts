import type { APIRoute } from 'astro';

const calcModules = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

export const GET: APIRoute = () => {
  const site = 'https://hacecuentas.com';
  const now = new Date().toISOString().split('T')[0];

  // Categorías únicas
  const cats = [...new Set(calcs.map((c) => c.category))];

  // URLs con prioridades diferenciadas
  const urls = [
    // Top-tier
    { loc: `${site}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${site}/buscar`, priority: '0.7', changefreq: 'monthly' },

    // Categorías
    ...cats.map((cat) => ({
      loc: `${site}/categoria/${cat}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),

    // Calculadoras — prioridad según popularidad
    ...calcs.map((c: any) => {
      const topSlugs = [
        'sueldo-en-mano-argentina',
        'calculadora-aguinaldo-sac',
        'calculadora-imc',
        'calculadora-cuota-prestamo',
        'calculadora-interes-compuesto',
        'calculadora-monotributo-2026',
      ];
      const isTop = topSlugs.includes(c.slug);
      return {
        loc: `${site}/${c.slug}`,
        priority: isTop ? '0.9' : '0.7',
        changefreq: 'weekly',
      };
    }),

    // Legales
    { loc: `${site}/sobre-nosotros`, priority: '0.4', changefreq: 'yearly' },
    { loc: `${site}/privacidad`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${site}/terminos`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${site}/contacto`, priority: '0.4', changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
