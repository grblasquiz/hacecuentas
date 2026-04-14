import type { APIRoute } from 'astro';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const calcModules = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m);

// Resolver ruta absoluta a src/content/calcs para statSync en build time
const __dirname = dirname(fileURLToPath(import.meta.url));
const calcsDir = join(__dirname, '..', 'content', 'calcs');

function getLastMod(slug: string, fallback: string): string {
  try {
    // El nombre de archivo usa el formulaId o un slug corto, no el slug largo URL.
    // Hacemos best-effort: buscamos por el formulaId o filename equivalente.
    // Si falla, devolvemos fallback (fecha de build).
    const calc = calcs.find((c: any) => c.slug === slug);
    if (!calc) return fallback;
    const filename = `${calc.formulaId || slug}.json`;
    const stat = statSync(join(calcsDir, filename));
    return stat.mtime.toISOString().split('T')[0];
  } catch {
    return fallback;
  }
}

export const GET: APIRoute = () => {
  const site = 'https://hacecuentas.com';
  const buildDate = new Date().toISOString().split('T')[0];

  // Categorías únicas
  const cats = [...new Set(calcs.map((c) => c.category))];

  // URLs con prioridades diferenciadas + lastmod real por archivo
  const urls = [
    // Top-tier
    { loc: `${site}/`, priority: '1.0', changefreq: 'daily', lastmod: buildDate },
    { loc: `${site}/buscar`, priority: '0.7', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/comparador-plazo-fijo`, priority: '0.85', changefreq: 'daily', lastmod: buildDate },
    { loc: `${site}/valores-bcra`, priority: '0.85', changefreq: 'daily', lastmod: buildDate },

    // Categorías
    ...cats.map((cat) => ({
      loc: `${site}/categoria/${cat}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: buildDate,
    })),

    // Calculadoras — prioridad según popularidad + lastmod del JSON
    ...calcs.map((c: any) => {
      const topSlugs = [
        'sueldo-en-mano-argentina',
        'calculadora-aguinaldo-sac',
        'calculadora-indemnizacion-despido',
        'calculadora-imc',
        'calculadora-cuota-prestamo',
        'calculadora-interes-compuesto',
        'calculadora-monotributo-2026',
        'calculadora-plazo-fijo',
        'calculadora-retencion-ganancias-rg-830',
        'calculadora-impuesto-ganancias-sueldo',
        'calculadora-roas-retorno-inversion-publicitaria',
        'calculadora-descenso-futbol-argentino-promedios',
      ];
      const isTop = topSlugs.includes(c.slug);
      return {
        loc: `${site}/${c.slug}`,
        priority: isTop ? '0.9' : '0.7',
        changefreq: 'weekly',
        lastmod: getLastMod(c.slug, buildDate),
      };
    }),

    // Legales
    { loc: `${site}/sobre-nosotros`, priority: '0.4', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/privacidad`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/cookies`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/terminos`, priority: '0.3', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/politica-editorial`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/metodologia`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/contacto`, priority: '0.4', changefreq: 'yearly', lastmod: buildDate },
    { loc: `${site}/glosario`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { loc: `${site}/blog`, priority: '0.4', changefreq: 'monthly', lastmod: buildDate },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es-AR" href="${u.loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.loc}" />
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
