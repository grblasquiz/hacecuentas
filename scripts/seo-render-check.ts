/**
 * seo-render-check.ts — Verifica que el contenido SEO esté en el HTML inicial
 * (server-side), sin depender de JavaScript.
 *
 * Para cada URL prioritaria chequea en el HTML estático de dist/client:
 * H1, meta title/description, canonical, texto editorial, fórmula, FAQ,
 * fuentes, calculadoras relacionadas y JSON-LD. Si una página depende
 * demasiado del cliente → action_required = needs_ssr_content.
 *
 * Uso:
 *   npm run seo:render-check            # contra dist/client (build local)
 *   npm run seo:render-check -- --live  # contra producción (sin ejecutar JS)
 *
 * Salida: reports/render-check.json (+ tabla por consola)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { PRIORITY_PATHS } from './seo-priority-urls.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist', 'client');
const REPORTS = join(ROOT, 'reports');
const LIVE = process.argv.includes('--live');
const ORIGIN = 'https://hacecuentas.com';
mkdirSync(REPORTS, { recursive: true });

interface Check {
  url: string;
  h1: boolean;
  title: boolean;
  meta_description: boolean;
  canonical_self: boolean;
  editorial_text: boolean;   // >300 palabras visibles en <main>
  formula_section: boolean;
  faq_section: boolean;
  sources_section: boolean;
  related_links: boolean;    // ≥3 links internos en bloque related
  jsonld: boolean;
  action_required: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getHtml(path: string): Promise<string | null> {
  if (LIVE) {
    const res = await fetch(`${ORIGIN}${path}`, { signal: AbortSignal.timeout(20000) });
    return res.status === 200 ? await res.text() : null;
  }
  const file = join(DIST, path === '/' ? 'index.html' : `${path.slice(1)}.html`);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

const results: Check[] = [];

for (const path of PRIORITY_PATHS) {
  const html = await getHtml(path);
  if (html === null) {
    results.push({ url: `${ORIGIN}${path}`, h1: false, title: false, meta_description: false, canonical_self: false, editorial_text: false, formula_section: false, faq_section: false, sources_section: false, related_links: false, jsonld: false, action_required: 'html_not_found' });
    continue;
  }
  const head = html.slice(0, html.indexOf('</head>') + 7);
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  const mainHtml = mainMatch ? mainMatch[0] : html;
  const words = stripTags(mainHtml).split(/\s+/).length;

  // Bloque related real primero (related-grid / id="related"); el texto plano
  // matchea también secciones markdown del explanation (falso positivo).
  const relIdx = html.search(/class="related-grid"|id="related"/i) >= 0
    ? html.search(/class="related-grid"|id="related"/i)
    : html.search(/Calculadoras relacionadas|Calcs relacionadas/i);
  const relatedLinks = relIdx >= 0 ? [...html.slice(relIdx, relIdx + 12000).matchAll(/<a[^>]+href="\/[^"#?]*"/g)].length : 0;

  const canonical = (head.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1] || '';

  const c: Check = {
    url: `${ORIGIN}${path}`,
    h1: /<h1[\s>]/.test(html),
    title: /<title[^>]*>[^<]{10,}/.test(head),
    meta_description: /<meta\s+name="description"\s+content="[^"]{50,}"/.test(head),
    canonical_self: canonical === `${ORIGIN}${path}`,
    editorial_text: words > 300,
    formula_section: /C[oó]mo se calcula|C[oó]mo funciona|F[oó]rmula/i.test(mainHtml),
    faq_section: /id="(v2-)?faq"|Preguntas frecuentes/i.test(html),
    sources_section: /id="(v2-)?fuentes"|Fuentes y referencias|Fuentes y metodolog|Fuentes oficiales/i.test(html),
    related_links: relatedLinks >= 3,
    jsonld: /application\/ld\+json/.test(html),
    action_required: '',
  };
  // Páginas prioritarias no-calculadora: no se les exige fórmula/FAQ/fuentes/related.
  const exemptKeys: Set<string> = path === '/blog'
    ? new Set(['formula_section', 'faq_section', 'sources_section', 'related_links'])
    : new Set();
  const missing = (Object.keys(c) as (keyof Check)[]).filter((k) => k !== 'url' && k !== 'action_required' && !exemptKeys.has(k) && !c[k]);
  if (missing.length >= 3) c.action_required = 'needs_ssr_content';
  else if (missing.length) c.action_required = `missing:${missing.join('|')}`;
  results.push(c);
}

writeFileSync(join(REPORTS, 'render-check.json'), JSON.stringify(results, null, 2));

const ok = results.filter((r) => !r.action_required).length;
console.log(`✓ ${results.length} URLs chequeadas (${LIVE ? 'producción' : 'dist local'}) → reports/render-check.json`);
console.log(`  OK completas: ${ok}/${results.length}`);
for (const r of results.filter((x) => x.action_required)) {
  console.log(`  ⚠ ${r.url.replace(ORIGIN, '')} → ${r.action_required}`);
}
process.exitCode = results.some((r) => r.action_required === 'needs_ssr_content' || r.action_required === 'html_not_found') ? 1 : 0;
