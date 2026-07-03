/**
 * Detección de duplicados con algoritmo fijo (§9). Compara solo calcs del mismo
 * país (o ambas globales) + mismo cluster + indexables + no redirigidas.
 * Salida: reports/bing-growth/duplicate-candidates.csv (§9).
 *
 * Similaridades (0..1): title, h1, slug, formula, input. query_overlap=DATA_MISSING
 * (Bing no da el cruce query×url), así que Regla C no aplica; se usan Reglas A/B.
 * recommended_action ∈ MERGE_ALLOWED | DIFFERENTIATE | MANUAL_REVIEW | KEEP_SEPARATE.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = 'reports/bing-growth/duplicate-candidates.csv';
const HEADER = 'url_a,url_b,country,cluster,title_similarity,h1_similarity,slug_similarity,formula_similarity,input_similarity,query_overlap,recommended_action,reason';
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

const STOP = new Set(['calculadora', 'de', 'la', 'el', 'por', 'para', 'con', 'en', 'y', 'a', 'del', 'las', 'los', 'un', 'una', 'cuanto', 'cuanta', 'hace', 'cuentas']);
const tok = (s) => new Set(String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)));
const jaccard = (a, b) => { if (!a.size && !b.size) return 0; let inter = 0; for (const x of a) if (b.has(x)) inter++; return inter / (a.size + b.size - inter); };

// diferencias que PROHÍBEN merge (§10): régimen/empleado-empleador/bruto-neto/período/unidad
const AXES = [
  ['bruto', 'neto'], ['empleado', 'empleador'], ['mensual', 'anual'], ['semanal', 'quincenal'],
  ['calcular', 'comparar'], ['emisor', 'receptor'], ['con hijos', 'sin hijos'],
];
function hasRegimenDiff(a, b) {
  const sa = (a.slug + ' ' + a.title).toLowerCase(), sb = (b.slug + ' ' + b.title).toLowerCase();
  for (const [x, y] of AXES) { if ((sa.includes(x) && sb.includes(y) && !sa.includes(y)) || (sa.includes(y) && sb.includes(x) && !sa.includes(x))) return true; }
  // conversión inversa: "X-en-Y" vs "Y-en-X" (o "X-a-Y" vs "Y-a-X") = intención opuesta
  const dir = (s) => { const m = s.match(/([a-z]+)[- ](?:en|a)[- ]([a-z]+)/); return m ? [m[1], m[2]] : null; };
  const da = dir(a.slug), db = dir(b.slug);
  if (da && db && da[0] === db[1] && da[1] === db[0]) return true;
  // sujeto/entidad distinta: tokens distintivos únicos por lado (deadlift vs squat)
  const ta = tok(a.slug), tb = tok(b.slug);
  const onlyA = [...ta].filter((x) => !tb.has(x)), onlyB = [...tb].filter((x) => !ta.has(x));
  if (onlyA.length === 1 && onlyB.length === 1 && onlyA[0].length > 3 && onlyB[0].length > 3) return true;
  return false;
}

const inv = parseCsv('reports/bing-growth/url-inventory.csv').filter((r) => r.route_type === 'calculator' && r.status !== 'REDIRECT');
// clicks por URL (evidencia B)
const perf = parseCsv('reports/bing-growth/query-url-data.csv').filter((r) => r.url && r.url !== 'DATA_MISSING');
const clicksByUrl = new Map(perf.map((p) => [p.url, Number(p.clicks) || 0]));

// agrupar por (country, cluster)
const groups = new Map();
for (const r of inv) {
  const k = `${r.country}::${r.cluster}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(r);
}

const rows = [];
let pairs = 0;
for (const [k, arr] of groups) {
  if (arr.length < 2 || arr.length > 400) continue; // clusters gigantes: skip pairwise (evita O(n²) explosivo) → MANUAL_REVIEW aparte
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    const a = arr[i], b = arr[j];
    const inputSim = jaccard(new Set((a.input_signature || '').split('|').filter(Boolean)), new Set((b.input_signature || '').split('|').filter(Boolean)));
    if (inputSim < 0.6) continue; // sin solapamiento de inputs no vale comparar
    pairs++;
    const titleSim = jaccard(tok(a.title), tok(b.title));
    const h1Sim = jaccard(tok(a.h1), tok(b.h1));
    const slugSim = jaccard(tok(a.slug), tok(b.slug));
    // formula_similarity: mismo formulaId base → 1.0; si no, proxy por inputs+outputs
    const fa = (a.formula_signature || '').split('::'), fb = (b.formula_signature || '').split('::');
    const sameFormula = fa[0] && fa[0] === fb[0];
    const formulaSim = sameFormula ? 1.0 : Math.min(inputSim, fa[2] === fb[2] ? inputSim : inputSim * 0.8);

    // reglas §9-10
    let action = 'KEEP_SEPARATE', reason = '';
    const regimenDiff = hasRegimenDiff(a, b);
    const evidenceB = (clicksByUrl.get(a.url) || 0) === 0 && (clicksByUrl.get(b.url) || 0) > 0 || (clicksByUrl.get(b.url) || 0) === 0 && (clicksByUrl.get(a.url) || 0) > 0;
    const evidenceD = formulaSim >= 0.99 && inputSim >= 0.99;
    if (formulaSim >= 0.95 && inputSim >= 0.90 && titleSim >= 0.75 && !regimenDiff && (evidenceB || evidenceD)) {
      action = 'MERGE_ALLOWED'; reason = `formula=${formulaSim.toFixed(2)} input=${inputSim.toFixed(2)} title=${titleSim.toFixed(2)} + evidencia ${evidenceD ? 'D(idénticas)' : 'B(clicks asimétricos)'}`;
    } else if (formulaSim >= 0.90 && inputSim >= 0.85 && !regimenDiff) {
      action = 'MANUAL_REVIEW'; reason = `alta similitud (formula=${formulaSim.toFixed(2)} input=${inputSim.toFixed(2)}) pero sin evidencia de merge — revisar a mano`;
    } else if (formulaSim >= 0.85 && regimenDiff) {
      action = 'DIFFERENTIATE'; reason = 'fórmula parecida pero difieren en régimen/bruto-neto/período/rol → diferenciar, NO redirigir';
    } else if (titleSim >= 0.6 || slugSim >= 0.6) {
      action = 'KEEP_SEPARATE'; reason = 'títulos parecidos pero fórmula/inputs distintos';
    } else continue;
    rows.push([a.url, b.url, a.country, a.cluster, titleSim.toFixed(2), h1Sim.toFixed(2), slugSim.toFixed(2), formulaSim.toFixed(2), inputSim.toFixed(2), 'DATA_MISSING', action, reason]);
  }
}

rows.sort((x, y) => Number(y[7]) - Number(x[7]));
writeFileSync(OUT, HEADER + '\n' + rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
const byAction = {}; for (const r of rows) byAction[r[10]] = (byAction[r[10]] || 0) + 1;
console.log(`[duplicates] ${OUT}: ${rows.length} pares (de ${pairs} comparados)`);
console.log('[duplicates] por acción:', JSON.stringify(byAction));
const merge = rows.filter((r) => r[10] === 'MERGE_ALLOWED');
console.log(`[duplicates] MERGE_ALLOWED: ${merge.length}`);
for (const r of merge.slice(0, 10)) console.log(`  ${r[0].replace('https://hacecuentas.com', '')} <> ${r[1].replace('https://hacecuentas.com', '')} — ${r[11]}`);
