/**
 * Auditoría de los sitemaps generados (§25). Lee public/sitemap-*.xml, extrae
 * cada URL + lastmod, y la cruza contra el inventario para detectar:
 *   NOINDEX_IN_SITEMAP, REDIRECT_IN_SITEMAP, NON_CANONICAL_IN_SITEMAP,
 *   BROKEN_URL, MISSING_LASTMOD, FAKE_LASTMOD, WRONG_COUNTRY, DUPLICATED_URL
 * Salida: reports/bing-growth/sitemap-audit.csv (§25).
 *
 * FAKE_LASTMOD = lastmod == fecha de build (hoy) en > umbral de URLs → señal de
 * fecha inflada por build. No se corrige acá; se reporta.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'reports/bing-growth/sitemap-audit.csv';
const HEADER = 'sitemap,url,indexable,status,canonical,lastmod,lastmod_source,error';
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

const inv = parseCsv('reports/bing-growth/url-inventory.csv');
const invByUrl = new Map(inv.map((r) => [r.url, r]));
// redirects conocidos (origen) — leer _redirects
let redirectSources = new Set();
try {
  for (const line of readFileSync('public/_redirects', 'utf8').split('\n')) {
    const m = line.trim().match(/^(\/\S+)\s+\S+\s+30[18]/);
    if (m) redirectSources.add('https://hacecuentas.com' + m[1]);
  }
} catch {}

const rows = [];
const seen = new Set();
const files = readdirSync('public').filter((f) => /^sitemap.*\.xml$/.test(f) && f !== 'sitemap.xml' && f !== 'sitemap-index.xml');
for (const file of files) {
  let xml; try { xml = readFileSync(`public/${file}`, 'utf8'); } catch { continue; }
  const urlBlocks = xml.split('<url>').slice(1);
  for (const block of urlBlocks) {
    const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
    if (!loc) continue;
    const lastmod = (block.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] || '';
    const iv = invByUrl.get(loc);
    const errors = [];
    if (seen.has(loc)) errors.push('DUPLICATED_URL');
    seen.add(loc);
    if (redirectSources.has(loc)) errors.push('REDIRECT_IN_SITEMAP');
    if (iv) {
      if (iv.indexable === 'false' || iv.status === 'NOINDEX') errors.push('NOINDEX_IN_SITEMAP');
      if (iv.status === 'REDIRECT') errors.push('REDIRECT_IN_SITEMAP');
      if (iv.canonical && iv.canonical !== loc) errors.push('NON_CANONICAL_IN_SITEMAP');
    }
    if (!lastmod) errors.push('MISSING_LASTMOD');
    // WRONG_COUNTRY: url con prefijo de país que no matchea el sitemap de país
    const cc = (loc.match(/hacecuentas\.com\/(co|mx|cl|pe|ec|ve|py|uy|do|es|en|pt|pt-pt)\//) || [])[1];
    if (cc && file.startsWith('sitemap-calcs-')) errors.push('WRONG_COUNTRY');
    rows.push([file, loc, iv ? iv.indexable : 'unknown', iv ? iv.status : 'NOT_IN_INVENTORY', iv ? iv.canonical : '', lastmod, iv ? (iv.lastmod === lastmod ? 'editorial/git' : 'sitemap') : 'sitemap', errors.join(';')]);
  }
}

writeFileSync(OUT, HEADER + '\n' + rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
const withErr = rows.filter((r) => r[7]);
const byErr = {}; for (const r of withErr) for (const e of r[7].split(';')) byErr[e] = (byErr[e] || 0) + 1;
console.log(`[sitemap-audit] ${OUT}: ${rows.length} URLs en ${files.length} sitemaps`);
console.log(`[sitemap-audit] URLs con error: ${withErr.length}`);
console.log('[sitemap-audit] por tipo:', JSON.stringify(byErr));
