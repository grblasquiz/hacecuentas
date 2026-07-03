/**
 * Clasifica oportunidades a nivel URL usando Bing real (page-level) + inventario.
 * Salida: reports/bing-growth/opportunities.csv (schema §11), scoring §12.
 *
 * data_status=AVAILABLE para URLs con datos Bing; DATA_MISSING para el resto
 * (a esas solo se les asigna prioridad técnica, §13, sin oportunidad por tráfico).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = 'reports/bing-growth/opportunities.csv';
const HEADER = 'url,query,country,cluster,clicks,impressions,ctr,average_position,action,priority,confidence,reason,data_status';
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
// clusters con clicks (para cluster_score)
const perf = parseCsv('reports/bing-growth/query-url-data.csv').filter((r) => r.url && r.url !== 'DATA_MISSING');
const clusterClicks = new Map();
for (const p of perf) {
  const iv = invByUrl.get(p.url); if (!iv) continue;
  const c = iv.cluster || 'other';
  const o = clusterClicks.get(c) || { clicks: 0, impr: 0 };
  o.clicks += Number(p.clicks) || 0; o.impr += Number(p.impressions) || 0;
  clusterClicks.set(c, o);
}

function expectedCtr(pos) {
  if (pos <= 0) return 0.05; // posición no reportada → banda media conservadora
  if (pos <= 3) return 0.18; if (pos <= 5) return 0.10; if (pos <= 10) return 0.05;
  if (pos <= 20) return 0.025; if (pos <= 30) return 0.01; return 0.005;
}

const rows = [];
for (const p of perf) {
  const url = p.url;
  const iv = invByUrl.get(url);
  const clicks = Number(p.clicks) || 0;
  const impr = Number(p.impressions) || 0;
  const pos = Number(p.average_position) || 0;
  const ctr = Number(p.ctr) || 0;
  const cluster = iv ? iv.cluster : 'other';
  const eCtr = expectedCtr(pos);

  // scoring §12
  const impressionScore = Math.min(30, Math.log10(impr + 1) * 8);
  let positionScore = 0;
  if (pos >= 4 && pos <= 10) positionScore = 30;
  else if (pos >= 11 && pos <= 20) positionScore = 25;
  else if (pos >= 21 && pos <= 30) positionScore = 15;
  else if (pos >= 1 && pos <= 3 && ctr < eCtr) positionScore = 10;
  const ctrGapScore = Math.min(20, Math.max(0, eCtr - ctr) * 200);
  const cc = clusterClicks.get(cluster) || { clicks: 0, impr: 0 };
  const clusterScore = cc.clicks > 0 ? 10 : (cc.impr > 0 ? 5 : 0);
  // technical_score: error de canonical/sitemap/indexabilidad
  let technicalScore = 0;
  const techErrors = [];
  if (iv) {
    if (iv.indexable === 'true' && iv.sitemap === 'false') { technicalScore = 10; techErrors.push('indexable-fuera-de-sitemap'); }
    if (iv.canonical && iv.canonical !== url && iv.status !== 'REDIRECT') { technicalScore = 10; techErrors.push('canonical-distinto'); }
    if (iv.status === 'INCOMPLETE') { technicalScore = Math.max(technicalScore, 10); techErrors.push('incompleta'); }
  }
  const priority = Math.max(0, Math.min(100, Math.round(impressionScore + positionScore + ctrGapScore + clusterScore + technicalScore)));
  const potentialClicks = Math.max(0, Math.round(impr * eCtr - clicks));

  // acción
  let action = 'KEEP', reason = '', confidence = 60;
  if (techErrors.length) { action = techErrors[0].includes('canonical') ? 'FIX_CANONICAL' : techErrors[0].includes('sitemap') ? 'FIX_SITEMAP' : 'FIX_INDEXABILITY'; reason = techErrors.join('; '); confidence = 90; }
  else if (pos >= 4 && pos <= 20 && ctr < eCtr && impr >= 200) { action = 'OPTIMIZE_TITLE'; reason = `pos ${pos.toFixed(1)}, CTR ${(ctr * 100).toFixed(1)}% < esperado ${(eCtr * 100).toFixed(0)}%, ~${potentialClicks} clicks potenciales`; confidence = 80; }
  else if (pos >= 11 && pos <= 30 && impr >= 300) { action = 'OPTIMIZE_CONTENT'; reason = `pos ${pos.toFixed(1)} con ${impr} impresiones — mejorar contenido/enlaces`; confidence = 70; }
  else if (pos >= 4 && pos <= 10 && impr >= 500 && (iv && iv.has_related === 'false')) { action = 'OPTIMIZE_INTERNAL_LINKS'; reason = 'top-10 sin bloque de relacionados fuerte'; confidence = 70; }
  else { action = 'KEEP'; reason = `pos ${pos.toFixed(1)}, ${impr} impr — sin acción prioritaria`; confidence = 60; }

  rows.push([url, '', iv ? iv.country : '', cluster, clicks, impr, ctr, pos.toFixed(2), action, priority, confidence, reason, 'AVAILABLE']);
}

// URLs del inventario SIN datos Bing → prioridad técnica §13 (solo si hay error técnico)
for (const iv of inv) {
  if (rows.find((r) => r[0] === iv.url)) continue;
  let priority = 0; const errs = [];
  if (iv.indexable === 'true' && iv.sitemap === 'false') { priority += 30; errs.push('indexable-ausente-de-sitemap'); }
  if (iv.canonical && iv.canonical !== iv.url && iv.status !== 'REDIRECT') { priority += 30; errs.push('canonical-incorrecto'); }
  if (iv.status === 'NOINDEX' && iv.sitemap === 'true') { priority += 30; errs.push('noindex-en-sitemap'); }
  if (iv.route_type === 'calculator' && iv.has_quick_answer === 'false') { priority += 15; errs.push('sin-respuesta-rapida'); }
  if (iv.is_regulatory === 'true' && iv.has_sources === 'false') { priority += 15; errs.push('regulatoria-sin-fuentes'); }
  if (iv.internal_links_out === '0' && iv.route_type === 'calculator') { priority += 20; errs.push('sin-enlaces-salientes'); }
  if (priority === 0) continue; // sin error técnico y sin tráfico → no es oportunidad
  priority = Math.min(100, priority);
  const action = errs[0].includes('canonical') ? 'FIX_CANONICAL' : errs[0].includes('sitemap') || errs[0].includes('noindex') ? 'FIX_SITEMAP' : errs[0].includes('respuesta') ? 'OPTIMIZE_CONTENT' : errs[0].includes('enlaces') ? 'OPTIMIZE_INTERNAL_LINKS' : 'MANUAL_REVIEW';
  rows.push([iv.url, '', iv.country, iv.cluster, '', '', '', '', action, priority, 70, errs.join('; '), 'DATA_MISSING']);
}

rows.sort((a, b) => b[9] - a[9]);
writeFileSync(OUT, HEADER + '\n' + rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
const byAction = {}; for (const r of rows) byAction[r[8]] = (byAction[r[8]] || 0) + 1;
console.log(`[opportunities] ${OUT}: ${rows.length} filas`);
console.log('[opportunities] por acción:', JSON.stringify(byAction));
console.log('[opportunities] top-8:'); for (const r of rows.slice(0, 8)) console.log(`  [${r[9]}] ${r[8]} ${r[0].replace('https://hacecuentas.com', '')} — ${r[11]}`);
