import type { APIRoute } from 'astro';
import { canDistributeCalc } from '../lib/content-policy';
import { GONE_410_URLS } from '../lib/gone-410';
import { PRUNING_REDIRECTS } from '../lib/pruning-redirects';

// Un path 410/pruneado NUNCA va en un sitemap, aunque su JSON siga vivo y
// "fresco" (zombie). Ya pasó con 2 posts de blog en GONE_410 que reaparecían
// acá (auditoría seo-recovery 2026-07-06). Comparación case-insensitive:
// los mismatches de mayúsculas (Navidad vs navidad) vencían al filtro.
const DEAD_PATHS = new Set<string>(
  [...GONE_410_URLS, ...Object.keys(PRUNING_REDIRECTS)].map((p) => p.toLowerCase()),
);
const isDead = (path: string) => DEAD_PATHS.has(path.toLowerCase());

// Sitemap fresh — calcs con `dataUpdate.lastUpdated` en los últimos 14 días.
// Bing valora freshness signals y el sitemap-news.xml standard limita entries a
// 48h (Google News compat). Este sitemap separado le da a Bing (y Yandex) un
// universo mas grande de URLs frescas para re-crawl prioritario.
//
// IMPORTANTE 2026-05-26: filtramos por `dataUpdate.lastUpdated` ÚNICAMENTE,
// NO por `lastReviewed`. Razón: backfills masivos de metadata (commit
// `704790d3` el 23-may bumpeó lastReviewed en 2471 archivos) inflan el fresh
// con URLs que NO tuvieron cambio editorial real, violando CLAUDE.md regla #3
// y diluyendo la señal de freshness para las URLs con data dinámica genuina.
// Para que una calc aparezca en sitemap-fresh ahora se requiere que su data
// externa (BCRA, IPC, ARCA escalas) se haya refrescado real-time.
//
// Cero impacto en performance cliente — se genera build-time (prerender).
//
// Submitir manualmente en BWT o esperar a que Bing lo descubra via robots.txt
// sitemap index.

export const prerender = true;

const calcModulesAR = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcModulesEN = import.meta.glob<any>('../content/calcs-en/*.json', { eager: true });
const calcModulesPT = import.meta.glob<any>('../content/calcs-pt/*.json', { eager: true });
const calcModulesMX = import.meta.glob<any>('../content/calcs-mx/*.json', { eager: true });
const calcModulesES = import.meta.glob<any>('../content/calcs-es/*.json', { eager: true });
const calcModulesCO = import.meta.glob<any>('../content/calcs-co/*.json', { eager: true });
const calcModulesCL = import.meta.glob<any>('../content/calcs-cl/*.json', { eager: true });
const blogModules = import.meta.glob<any>('../content/blog/*.json', { eager: true });

const FOURTEEN_DAYS_MS = 14 * 24 * 3600 * 1000;
const SITE = 'https://hacecuentas.com';

interface Entry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function getDateValid(s: any): string | null {
  if (!s || typeof s !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return null;
  return s.slice(0, 10);
}

function buildEntries(modules: Record<string, any>, prefix: string): Entry[] {
  const now = Date.now();
  const out: Entry[] = [];
  for (const m of Object.values(modules)) {
    const calc = m.default || m;
    if (!canDistributeCalc(calc)) continue;
    // Solo dataUpdate.lastUpdated cuenta para freshness signal.
    // lastReviewed se bumpea con backfills metadata y NO refleja
    // cambio editorial real — incluirlo infla el fresh con falsos positivos.
    const du = getDateValid(calc.dataUpdate?.lastUpdated);
    if (!du) continue;
    const t = Date.parse(du + 'T00:00:00Z');
    if (Number.isNaN(t) || now - t > FOURTEEN_DAYS_MS) continue;
    if (isDead(`${prefix}${calc.slug}`)) continue;
    out.push({
      loc: `${SITE}${prefix}${calc.slug}`,
      lastmod: new Date(t).toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }
  return out;
}

export const GET: APIRoute = () => {
  const entries: Entry[] = [
    ...buildEntries(calcModulesAR, '/'),
    ...buildEntries(calcModulesEN, '/en/'),
    ...buildEntries(calcModulesPT, '/pt/'),
    ...buildEntries(calcModulesMX, '/mx/'),
    ...buildEntries(calcModulesES, '/es/'),
    ...buildEntries(calcModulesCO, '/co/'),
    ...buildEntries(calcModulesCL, '/cl/'),
  ];

  // Blog posts modified <14d
  const now = Date.now();
  for (const m of Object.values(blogModules)) {
    const p = m.default || m;
    const dateStr = p.updatedDate || p.date;
    const valid = getDateValid(dateStr);
    if (!valid) continue;
    const t = Date.parse(valid + 'T00:00:00Z');
    if (Number.isNaN(t) || now - t > FOURTEEN_DAYS_MS) continue;
    if (isDead(`/blog/${p.slug}`)) continue;
    entries.push({
      loc: `${SITE}/blog/${p.slug}`,
      lastmod: new Date(t).toISOString(),
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  // Sort by lastmod desc (más fresco primero — Bing prioriza top entries)
  entries.sort((a, b) => b.lastmod.localeCompare(a.lastmod));

  // Cap a 5000 — sitemap protocol max 50k pero queremos mantenerlo lean
  // (Bing prefiere sitemaps focalizados)
  const capped = entries.slice(0, 5000);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${capped.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
