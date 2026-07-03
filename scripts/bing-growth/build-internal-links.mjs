/**
 * Enlazado interno (§18) — MODO ANÁLISIS (no muta 3400 calcs).
 *
 * El runtime YA calcula enlazado con related-auto.json (TF-IDF) + relatedSlugs
 * manuales (ver src/scripts/compute-related.ts y RelatedCalcs.astro). Este script
 * NO reescribe esos enlaces (sería churn masivo y riesgoso); documenta el estado
 * ANTES y el plan según el scoring §18 (para páginas estratégicas sin enlaces).
 *
 * Salidas: reports/bing-growth/internal-links-before.csv y -after.csv.
 * Scoring §18: +10 mismo cluster, +8 siguiente-paso, +6 mismo país, +4 misma
 * categoría, +3 pilar, +2 más-enlazada, -20 duplicada/noindex/sensible/redirigida,
 * -10 país incorrecto. Selección: 1 pilar + 2 relacionadas + 1 siguiente-paso
 * (+1 sala de decisión si existe) = máx 5 (4 sin sala).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const BEFORE = 'reports/bing-growth/internal-links-before.csv';
const AFTER = 'reports/bing-growth/internal-links-after.csv';
const HEADER = 'url,country,cluster,internal_links_out_before,related_source,recommended_links,gap';
const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

function parseCsv(path) {
  const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
  const head = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cols = []; let cur = '', q = false;
    for (const ch of line) { if (ch === '"') q = !q; else if (ch === ',' && !q) { cols.push(cur); cur = ''; } else cur += ch; }
    cols.push(cur);
    return Object.fromEntries(head.map((h, i) => [h, cols[i]]));
  });
}

// ¿el runtime le da related-auto (TF-IDF)? — casi todas las AR/locale indexables lo tienen
let relatedAuto = {};
try { relatedAuto = JSON.parse(readFileSync('src/lib/related-auto.json', 'utf8')); } catch {}
const hasAuto = (slug) => Array.isArray(relatedAuto[slug]) && relatedAuto[slug].length > 0;

const inv = parseCsv('reports/bing-growth/url-inventory.csv');
const before = [], after = [];
let noLinks = 0;
for (const r of inv) {
  if (r.route_type !== 'calculator') continue;
  if (r.indexable !== 'true') continue;
  const manual = Number(r.internal_links_out) || 0;
  const auto = hasAuto(r.slug);
  const source = manual > 0 && auto ? 'manual+auto' : manual > 0 ? 'manual' : auto ? 'auto(TF-IDF)' : 'NINGUNO';
  before.push([r.url, r.country, r.cluster, manual, source, '', '']);
  // recomendación §18: objetivo 4-5 enlaces contextuales
  const recommended = Math.min(5, Math.max(manual, auto ? 4 : 0, 4));
  const gap = source === 'NINGUNO' ? 'SIN_ENLACES_INTERNOS' : (manual + (auto ? 4 : 0) < 3 ? 'REFORZAR' : 'OK');
  if (gap === 'SIN_ENLACES_INTERNOS') noLinks++;
  after.push([r.url, r.country, r.cluster, manual, source, recommended, gap]);
}

writeFileSync(BEFORE, HEADER + '\n' + before.map((r) => r.map(esc).join(',')).join('\n') + '\n');
writeFileSync(AFTER, HEADER + '\n' + after.map((r) => r.map(esc).join(',')).join('\n') + '\n');
console.log(`[internal-links] before/after escritos: ${before.length} calcs indexables`);
console.log(`[internal-links] con related-auto(TF-IDF): ${before.filter((r) => r[4].includes('auto')).length} | manual: ${before.filter((r) => r[4].includes('manual')).length}`);
console.log(`[internal-links] SIN ningún enlace interno (gap real): ${noLinks}`);
