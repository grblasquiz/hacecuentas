/**
 * Normaliza los exports REALES de Bing Webmaster + GA4 a
 * reports/bing-growth/query-url-data.csv (schema del plan §6).
 *
 * Fuentes reales encontradas en el repo:
 *   - data/bing-perf-latest.json  → { queries[], pages[], opportunities[] }
 *       queries[]: {query, impressions, clicks, position, avg_click_position}  (NIVEL QUERY, sin url)
 *       pages[]:   {page, impressions, clicks, position}                        (NIVEL URL, sin query)
 *   - data/ga4-new-traffic-calcs-organic.csv → path-level sessions/views
 *   - data/ga4-organic-growth.csv            → path-level sessions
 *
 * LIMITACIÓN REAL: Bing Webmaster entrega query Y page por separado, NO el
 * cruce query×url. Por eso el CSV tiene dos tipos de fila:
 *   - filas PAGE  → url completa + métricas, query="" (agregado por URL)
 *   - filas QUERY → query + métricas, url="DATA_MISSING" (no hay join real)
 * No se inventa el join. La clasificación de oportunidades (§11) usa las filas PAGE.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const OUT = 'reports/bing-growth/query-url-data.csv';
const HEADER = 'query,url,country,device,date_range,clicks,impressions,ctr,average_position,sessions,engaged_sessions,source_file';

const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const round4 = (n) => Math.round(n * 10000) / 10000;

// Inferir país desde el path (convención del sitio: /co/, /mx/, /cl/, /pe/, /ec/... o /en /pt)
function countryFromUrl(url) {
  const m = url.replace('https://hacecuentas.com', '').match(/^\/(co|mx|cl|pe|ec|ve|py|uy|do|es|en|pt|pt-pt)(\/|$)/);
  return m ? m[1].toUpperCase() : 'AR';
}

const rows = [];

// ---- GA4: sessions por path ----
const ga4Sessions = new Map(); // path -> {sessions}
for (const f of ['data/ga4-new-traffic-calcs-organic.csv', 'data/ga4-organic-growth.csv', 'data/ga4-new-traffic-calcs.csv']) {
  if (!existsSync(f)) continue;
  const lines = readFileSync(f, 'utf8').split('\n').filter(Boolean);
  const head = lines[0].split(',');
  const iPath = head.indexOf('path');
  const iSess = head.findIndex((h) => h === 'sessions' || h === 'sessions_now');
  if (iPath < 0) continue;
  for (const line of lines.slice(1)) {
    const cols = line.split(',');
    const path = cols[iPath];
    const sess = iSess >= 0 ? Number(cols[iSess]) || 0 : 0;
    if (path) ga4Sessions.set(path, (ga4Sessions.get(path) || 0) + sess);
  }
}

// ---- Bing perf ----
const bingFile = 'data/bing-perf-latest.json';
let dateRange = 'DATA_MISSING';
if (existsSync(bingFile)) {
  const j = JSON.parse(readFileSync(bingFile, 'utf8'));
  dateRange = j.period || j.range || j.date || '28d-to-2026-07-02';

  // filas PAGE (nivel url, con métricas reales + sessions de GA4)
  for (const p of j.pages || []) {
    const url = p.page;
    const path = url.replace('https://hacecuentas.com', '') || '/';
    const impr = p.impressions || 0;
    const clicks = p.clicks || 0;
    const sessions = ga4Sessions.get(path) || 0;
    rows.push([
      '', url, countryFromUrl(url), '', dateRange,
      clicks, impr, round4(impr > 0 ? clicks / impr : 0),
      p.position != null ? round4(p.position) : '', sessions, '',
      'data/bing-perf-latest.json (pages)',
    ]);
  }

  // filas QUERY (nivel query, sin url real → DATA_MISSING)
  for (const q of j.queries || []) {
    const impr = q.impressions || 0;
    const clicks = q.clicks || 0;
    rows.push([
      q.query, 'DATA_MISSING', '', '', dateRange,
      clicks, impr, round4(impr > 0 ? clicks / impr : 0),
      q.position ? round4(q.position) : '', '', '',
      'data/bing-perf-latest.json (queries)',
    ]);
  }
}

writeFileSync(OUT, HEADER + '\n' + rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
const pageRows = rows.filter((r) => r[1] !== 'DATA_MISSING').length;
const queryRows = rows.length - pageRows;
console.log(`[normalize] ${OUT}: ${rows.length} filas (${pageRows} page-level con url, ${queryRows} query-level sin join)`);
console.log(`[normalize] GA4 paths con sessions: ${ga4Sessions.size} | date_range=${dateRange}`);
