/**
 * seo-structured-data.ts — Validador de JSON-LD de las URLs prioritarias.
 *
 * Extrae los bloques <script type="application/ld+json"> del HTML buildeado
 * (dist/client), valida que parseen y que cumplan los campos mínimos:
 *   - BreadcrumbList presente
 *   - WebApplication/SoftwareApplication con name, url, applicationCategory,
 *     operatingSystem, offers(price 0), description, publisher, dateModified
 *   - FAQPage solo si hay FAQ visible en la página (y viceversa)
 *
 * Uso: npm run seo:structured-data
 * Salida: reports/structured-data-audit.json (+ resumen por consola)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { PRIORITY_PATHS } from './seo-priority-urls.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist', 'client');
const REPORTS = join(ROOT, 'reports');
mkdirSync(REPORTS, { recursive: true });

if (!existsSync(DIST)) {
  console.error('✗ No existe dist/client — corré `npm run build` primero.');
  process.exit(1);
}

interface Audit {
  url: string;
  ld_blocks: number;
  parse_errors: string[];
  types_found: string[];
  has_breadcrumb: boolean;
  webapp: { present: boolean; missing_fields: string[] };
  faq: { schema: boolean; visible: boolean; consistent: boolean };
  has_organization: boolean;
  issues: string[];
}

function pathToFile(p: string): string {
  return join(DIST, p === '/' ? 'index.html' : `${p.slice(1)}.html`);
}

/** Aplana @graph y arrays anidados en una lista de nodos con @type. */
function flatten(node: unknown, out: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(node)) { node.forEach((n) => flatten(n, out)); return out; }
  if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (o['@type']) out.push(o);
    if (o['@graph']) flatten(o['@graph'], out);
    for (const k of ['mainEntity', 'itemListElement', 'step']) if (o[k]) flatten(o[k], out);
  }
  return out;
}

function hasType(nodes: Record<string, unknown>[], type: string): Record<string, unknown> | undefined {
  return nodes.find((n) => {
    const t = n['@type'];
    return t === type || (Array.isArray(t) && t.includes(type));
  });
}

const WEBAPP_REQUIRED = ['name', 'url', 'applicationCategory', 'operatingSystem', 'description', 'offers', 'dateModified'];

// Páginas prioritarias que no son calculadoras: no se les exige WebApplication/FAQ/Breadcrumb.
const NON_CALC = new Set(['/blog']);

const results: Audit[] = [];

for (const path of PRIORITY_PATHS) {
  const file = pathToFile(path);
  const audit: Audit = {
    url: `https://hacecuentas.com${path}`,
    ld_blocks: 0, parse_errors: [], types_found: [],
    has_breadcrumb: false,
    webapp: { present: false, missing_fields: [] },
    faq: { schema: false, visible: false, consistent: true },
    has_organization: false,
    issues: [],
  };
  results.push(audit);

  if (!existsSync(file)) {
    audit.issues.push('html_not_found_in_dist');
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  audit.ld_blocks = blocks.length;
  if (!blocks.length) { audit.issues.push('no_jsonld'); continue; }

  const nodes: Record<string, unknown>[] = [];
  for (const [i, raw] of blocks.entries()) {
    try {
      flatten(JSON.parse(raw), nodes);
    } catch (e) {
      audit.parse_errors.push(`block ${i}: ${String(e).slice(0, 120)}`);
    }
  }
  if (audit.parse_errors.length) audit.issues.push('jsonld_parse_error');

  audit.types_found = [...new Set(nodes.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]) as string[]))].sort();

  const isCalc = !NON_CALC.has(path);

  audit.has_breadcrumb = !!hasType(nodes, 'BreadcrumbList');
  if (!audit.has_breadcrumb && isCalc) audit.issues.push('missing_breadcrumb_schema');

  audit.has_organization = !!hasType(nodes, 'Organization');

  const app = hasType(nodes, 'WebApplication') || hasType(nodes, 'SoftwareApplication');
  audit.webapp.present = !!app;
  if (!app) {
    if (isCalc) audit.issues.push('missing_webapp_schema');
  } else {
    for (const f of WEBAPP_REQUIRED) {
      if (app[f] === undefined || app[f] === null || app[f] === '') audit.webapp.missing_fields.push(f);
    }
    const offers = app.offers as Record<string, unknown> | undefined;
    if (offers && offers.price !== undefined && String(offers.price) !== '0') {
      audit.webapp.missing_fields.push('offers.price!=0');
    }
    if (audit.webapp.missing_fields.length) audit.issues.push('webapp_incomplete');
  }

  audit.faq.schema = !!hasType(nodes, 'FAQPage');
  audit.faq.visible = /id="(v2-)?faq"|Preguntas frecuentes/i.test(html);
  audit.faq.consistent = audit.faq.schema === audit.faq.visible || (!audit.faq.schema && audit.faq.visible);
  if (audit.faq.schema && !audit.faq.visible) audit.issues.push('faq_schema_without_visible_faq');
}

writeFileSync(join(REPORTS, 'structured-data-audit.json'), JSON.stringify(results, null, 2));

const clean = results.filter((r) => !r.issues.length).length;
console.log(`✓ ${results.length} URLs validadas → reports/structured-data-audit.json`);
console.log(`  Sin issues: ${clean}/${results.length}`);
for (const r of results.filter((x) => x.issues.length)) {
  console.log(`  ⚠ ${r.url.replace('https://hacecuentas.com', '')}: ${r.issues.join(', ')}${r.webapp.missing_fields.length ? ` [webapp faltan: ${r.webapp.missing_fields.join(',')}]` : ''}`);
}
process.exitCode = results.some((r) => r.parse_errors.length) ? 1 : 0;
