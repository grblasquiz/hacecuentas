/**
 * validate-data-sanity.ts
 *
 * NO chequea frescura (eso es check-stale-data.ts). Chequea que los VALORES
 * sean creíbles. Dos señales independientes:
 *
 *   1. Bounds absolutos    — atrapa errores de orden de magnitud / unidad
 *                            (ej. UF en 4.06 en vez de 40.610, dólar en 14,30).
 *   2. Drift vs valor previo — compara el valor en el working tree contra el
 *                            último valor commiteado en git (HEAD). Atrapa el
 *                            caso peligroso: dato con FECHA reciente pero VALOR
 *                            mal (la UF que quedó 25% arriba). Una serie estable
 *                            (UF ~0,3%/día) que salta 25% es casi siempre un bug
 *                            del fetcher / fuente, no un movimiento real.
 *   3. (opcional) Cross-source — con --cross-source trae una 2ª fuente para el
 *                            dólar AR y la compara. Un solo origen = punto de
 *                            falla silenciosa.
 *   4. Cross-file          — series que aparecen en dos archivos (UVA, plazo
 *                            fijo) deben coincidir dentro de tolerancia.
 *
 * Diseñado para correr en el pipeline de data-refresh ANTES de commitear:
 *   fetch-all → validate-data-sanity (gate) → commit. Si hay un FAIL, no se
 *   commitea el dato sospechoso y el job falla (alerta por email de GitHub).
 *
 * Uso:
 *   node --experimental-strip-types scripts/validate-data-sanity.ts
 *   node --experimental-strip-types scripts/validate-data-sanity.ts --json
 *   node --experimental-strip-types scripts/validate-data-sanity.ts --strict       # FAIL → exit 1 (rompe build)
 *   node --experimental-strip-types scripts/validate-data-sanity.ts --cross-source  # + 2ª fuente (red)
 *   node --experimental-strip-types scripts/validate-data-sanity.ts --out=audits/data-sanity.md
 *
 * Exit codes:
 *   0 = todo OK
 *   1 = error fatal, o (con --strict) hay al menos un FAIL
 *   2 = hay issues (FAIL sin --strict, o WARN) — informativo, no rompe build
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

type Severity = 'FAIL' | 'WARN';
type Kind = 'continuous' | 'periodic';

interface Check {
  /** id legible para el reporte */
  id: string;
  /** archivo relativo al cwd */
  file: string;
  /** extrae { value, date } del JSON parseado; null si la clave no existe */
  extract: (j: any) => { value: number; date?: string } | null;
  /** rango absoluto creíble [min, max] */
  min: number;
  max: number;
  /** % máximo de cambio día-a-día vs valor previo (HEAD). undefined = no chequear drift */
  maxDriftPct?: number;
  /** continuous: drift estricto. periodic (mensual): drift solo informativo */
  kind: Kind;
}

interface Issue {
  id: string;
  file: string;
  severity: Severity;
  message: string;
}

// --- Configuración de series ----------------------------------------------
// Bounds GENEROSOS a propósito: no queremos falsos positivos que bloqueen
// updates legítimos. Lo que tienen que atrapar es el error grosero (orden de
// magnitud, unidad) y, vía drift, el salto imposible en una serie estable.

const dolarVenta = (casa: string) => (j: any) => {
  const q = j?.quotes?.[casa];
  if (!q || typeof q.venta !== 'number') return null;
  return { value: q.venta, date: q.fechaActualizacion };
};

const liveField = (path: string[]) => (j: any) => {
  let cur = j;
  for (const k of path) cur = cur?.[k];
  if (typeof cur !== 'number') return null;
  return { value: cur };
};

const liveValor = (key: string) => (j: any) => {
  const o = j?.[key];
  if (!o || typeof o.valor !== 'number') return null;
  return { value: o.valor, date: o.fecha };
};

const dbUltimoValor = (j: any) => {
  if (typeof j?.ultimoValor !== 'number') return null;
  return { value: j.ultimoValor, date: j.ultimaFecha };
};

const CHECKS: Check[] = [
  // --- Dólar AR (src/data/live/dolar.json) ---
  { id: 'dolar.oficial.venta', file: 'src/data/live/dolar.json', extract: dolarVenta('oficial'), min: 600, max: 6000, maxDriftPct: 18, kind: 'continuous' },
  { id: 'dolar.blue.venta', file: 'src/data/live/dolar.json', extract: dolarVenta('blue'), min: 600, max: 8000, maxDriftPct: 18, kind: 'continuous' },
  { id: 'dolar.bolsa.venta', file: 'src/data/live/dolar.json', extract: dolarVenta('bolsa'), min: 600, max: 8000, maxDriftPct: 18, kind: 'continuous' },
  { id: 'dolar.ccl.venta', file: 'src/data/live/dolar.json', extract: dolarVenta('contadoconliqui'), min: 600, max: 9000, maxDriftPct: 18, kind: 'continuous' },
  { id: 'dolar.cripto.venta', file: 'src/data/live/dolar.json', extract: dolarVenta('cripto'), min: 600, max: 9000, maxDriftPct: 18, kind: 'continuous' },

  // --- Inflación AR (src/data/live/inflacion.json) — mensual ---
  { id: 'inflacion.mensual', file: 'src/data/live/inflacion.json', extract: liveField(['last_month', 'valor']), min: -5, max: 35, kind: 'periodic' },
  { id: 'inflacion.acum_12m', file: 'src/data/live/inflacion.json', extract: liveField(['acumulado_12m_pct']), min: 0, max: 500, kind: 'periodic' },

  // --- Tasas AR (src/data/live/tasas.json) ---
  { id: 'tasas.plazo_fijo_30d', file: 'src/data/live/tasas.json', extract: liveValor('plazo_fijo_30d'), min: 0, max: 400, maxDriftPct: 35, kind: 'continuous' },
  { id: 'tasas.badlar', file: 'src/data/live/tasas.json', extract: liveValor('badlar'), min: 0, max: 400, maxDriftPct: 35, kind: 'continuous' },
  { id: 'tasas.prestamos_personales', file: 'src/data/live/tasas.json', extract: liveValor('prestamos_personales'), min: 0, max: 600, maxDriftPct: 35, kind: 'continuous' },
  { id: 'tasas.uva', file: 'src/data/live/tasas.json', extract: liveValor('uva'), min: 800, max: 12000, maxDriftPct: 8, kind: 'continuous' },

  // --- Chile (src/data/live/chile.json) — UF es la serie clave (bug histórico) ---
  { id: 'chile.uf', file: 'src/data/live/chile.json', extract: liveValor('uf'), min: 25000, max: 90000, maxDriftPct: 3, kind: 'continuous' },
  { id: 'chile.dolar', file: 'src/data/live/chile.json', extract: liveValor('dolar'), min: 500, max: 1600, maxDriftPct: 6, kind: 'continuous' },
  { id: 'chile.utm', file: 'src/data/live/chile.json', extract: liveValor('utm'), min: 40000, max: 130000, maxDriftPct: 10, kind: 'periodic' },
  { id: 'chile.euro', file: 'src/data/live/chile.json', extract: liveValor('euro'), min: 550, max: 1800, maxDriftPct: 6, kind: 'continuous' },
  { id: 'chile.uta', file: 'src/data/live/chile.json', extract: liveValor('uta'), min: 400000, max: 1600000, maxDriftPct: 10, kind: 'periodic' },

  // --- Colombia (src/data/live/colombia.json) ---
  { id: 'colombia.trm', file: 'src/data/live/colombia.json', extract: liveValor('trm'), min: 1500, max: 9000, maxDriftPct: 6, kind: 'continuous' },

  // --- Series BCRA persistidas (db/*.json) ---
  { id: 'db.uva', file: 'db/uva.json', extract: dbUltimoValor, min: 800, max: 12000, maxDriftPct: 8, kind: 'continuous' },
  { id: 'db.icl', file: 'db/icl.json', extract: dbUltimoValor, min: 1, max: 200, maxDriftPct: 8, kind: 'continuous' },
  { id: 'db.cer', file: 'db/cer.json', extract: dbUltimoValor, min: 100, max: 3000, maxDriftPct: 8, kind: 'continuous' },
  { id: 'db.tm20', file: 'db/tm20.json', extract: dbUltimoValor, min: 0, max: 400, maxDriftPct: 35, kind: 'continuous' },
  { id: 'db.ripte', file: 'db/ripte.json', extract: dbUltimoValor, min: 200000, max: 8000000, maxDriftPct: 15, kind: 'periodic' },
  { id: 'db.plazo_fijo_30d', file: 'db/plazo-fijo-bcra-30d.json', extract: dbUltimoValor, min: 0, max: 400, maxDriftPct: 35, kind: 'continuous' },
];

// Series que aparecen en dos archivos y deben coincidir dentro de tolerancia.
// UVA y plazo fijo viven tanto en src/data/live/tasas.json como en db/*.json.
const ck = (id: string): Check => CHECKS.find((c) => c.id === id)!;
const CROSS_FILE: Array<{ id: string; a: Check; b: Check; tolPct: number }> = [
  // UVA: tasas.json publica el valor con vigencia futura, db/uva.json el último
  // efectivo → pueden diferir unos días. Tolerancia amplia (10%).
  { id: 'xfile.uva', a: ck('tasas.uva'), b: ck('db.uva'), tolPct: 10 },
  // Plazo fijo 30d: ambos vienen del mismo idBcra → deben coincidir casi exacto.
  { id: 'xfile.plazo_fijo', a: ck('tasas.plazo_fijo_30d'), b: ck('db.plazo_fijo_30d'), tolPct: 5 },
];

function pct(a: number, b: number): number {
  if (b === 0) return a === 0 ? 0 : Infinity;
  return Math.abs((a - b) / b) * 100;
}

function readJson(file: string): any | null {
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch { return null; }
}

function readPrevJson(file: string): any | null {
  try {
    const raw = execSync(`git show HEAD:${file}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(raw);
  } catch { return null; }
}

function runChecks(): { issues: Issue[]; ran: number; values: Record<string, number> } {
  const issues: Issue[] = [];
  const values: Record<string, number> = {};
  const byId = new Map<string, Check>();
  let ran = 0;

  for (const c of CHECKS) {
    byId.set(c.id, c);
    const j = readJson(c.file);
    if (!j) { issues.push({ id: c.id, file: c.file, severity: 'WARN', message: `no se pudo leer ${c.file}` }); continue; }
    const cur = c.extract(j);
    if (!cur) { issues.push({ id: c.id, file: c.file, severity: 'WARN', message: `clave ausente en ${c.file}` }); continue; }
    ran++;
    values[c.id] = cur.value;

    // 1) bounds absolutos
    if (cur.value < c.min || cur.value > c.max) {
      issues.push({ id: c.id, file: c.file, severity: 'FAIL', message: `valor ${cur.value} fuera de rango creíble [${c.min}, ${c.max}]${cur.date ? ` (fecha ${cur.date})` : ''}` });
    }

    // 2) drift vs valor previo commiteado
    if (c.maxDriftPct != null) {
      const prevJ = readPrevJson(c.file);
      const prev = prevJ ? c.extract(prevJ) : null;
      if (prev && prev.value !== cur.value) {
        const drift = pct(cur.value, prev.value);
        if (drift > c.maxDriftPct) {
          const sev: Severity = c.kind === 'periodic' ? 'WARN' : (drift > c.maxDriftPct * 2 ? 'FAIL' : 'WARN');
          issues.push({
            id: c.id, file: c.file, severity: sev,
            message: `drift ${drift.toFixed(1)}% vs valor previo (${prev.value} → ${cur.value}), umbral ${c.maxDriftPct}%${c.kind === 'periodic' ? ' [serie periódica — revisar manual]' : ''}`,
          });
        }
      }
    }
  }

  // 4) cross-file consistency (solo si ambas series existen)
  for (const x of CROSS_FILE) {
    const va = values[x.a.id], vb = values[x.b.id];
    if (va == null || vb == null) continue;
    const d = pct(va, vb);
    if (d > x.tolPct) {
      issues.push({ id: x.id, file: `${x.a.file} vs ${x.b.file}`, severity: 'WARN', message: `divergencia ${d.toFixed(1)}% entre ${x.a.id}=${va} y ${x.b.id}=${vb} (tol ${x.tolPct}%)` });
    }
  }

  return { issues, ran, values };
}

// --- Cross-source: 2ª fuente para el dólar AR (--cross-source) -------------
// Best-effort: si la red falla, NO rompe (warn informativo). DolarAPI es la
// fuente primaria; Bluelytics es la 2ª fuente independiente.
async function crossSourceDolar(values: Record<string, number>): Promise<Issue[]> {
  const issues: Issue[] = [];
  const TOL = 12; // % — el blue/oficial entre 2 agregadores suele diferir <5%, 12% es señal de error
  try {
    const res = await fetch('https://api.bluelytics.com.ar/v2/latest', { headers: { 'User-Agent': 'hacecuentas-sanity/1.0' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Bluelytics ${res.status}`);
    const data: any = await res.json();
    const pairs: Array<[string, number | undefined, number | undefined]> = [
      ['dolar.oficial.venta', values['dolar.oficial.venta'], data?.oficial?.value_sell],
      ['dolar.blue.venta', values['dolar.blue.venta'], data?.blue?.value_sell],
    ];
    for (const [id, primary, secondary] of pairs) {
      if (typeof primary !== 'number' || typeof secondary !== 'number') continue;
      const d = pct(primary, secondary);
      if (d > TOL) {
        issues.push({ id: `xsrc.${id}`, file: 'DolarAPI vs Bluelytics', severity: 'WARN', message: `divergencia ${d.toFixed(1)}% — primaria=${primary} 2ª-fuente=${secondary} (tol ${TOL}%)` });
      }
    }
  } catch (err) {
    issues.push({ id: 'xsrc.dolar', file: 'Bluelytics', severity: 'WARN', message: `2ª fuente no disponible: ${(err as Error).message} (no bloqueante)` });
  }
  return issues;
}

function render(issues: Issue[], ran: number): string {
  const fails = issues.filter((i) => i.severity === 'FAIL');
  const warns = issues.filter((i) => i.severity === 'WARN');
  const lines: string[] = [];
  lines.push(`# Sanity de datos — ${fails.length} FAIL · ${warns.length} WARN · ${ran} series chequeadas`);
  lines.push('');
  if (issues.length === 0) {
    lines.push('Todos los valores dentro de rango y sin drift sospechoso.');
    lines.push('');
    return lines.join('\n');
  }
  if (fails.length) {
    lines.push('## FAIL (bloquean en --strict)');
    lines.push('');
    for (const i of fails) lines.push(`- \`${i.id}\` (${i.file}): ${i.message}`);
    lines.push('');
  }
  if (warns.length) {
    lines.push('## WARN (revisar)');
    lines.push('');
    for (const i of warns) lines.push(`- \`${i.id}\` (${i.file}): ${i.message}`);
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const strict = args.includes('--strict');
  const crossSource = args.includes('--cross-source');
  const outArg = args.find((a) => a.startsWith('--out='));
  const outFile = outArg ? outArg.split('=')[1] : null;

  const { issues, ran, values } = runChecks();
  if (crossSource) issues.push(...await crossSourceDolar(values));

  const fails = issues.filter((i) => i.severity === 'FAIL');
  const warns = issues.filter((i) => i.severity === 'WARN');

  if (json) {
    const out = JSON.stringify({ ran, fails: fails.length, warns: warns.length, issues }, null, 2);
    if (outFile) writeFileSync(outFile, out); else console.log(out);
  } else {
    const md = render(issues, ran);
    if (outFile) writeFileSync(outFile, md); else console.log(md);
  }

  console.log(`SANITY_SUMMARY::${JSON.stringify({ ran, fails: fails.length, warns: warns.length, strict })}`);

  if (fails.length > 0) process.exit(strict ? 1 : 2);
  if (warns.length > 0) process.exit(2);
  process.exit(0);
}

main().catch((err) => { console.error('[validate-data-sanity] ✗', err); process.exit(1); });
