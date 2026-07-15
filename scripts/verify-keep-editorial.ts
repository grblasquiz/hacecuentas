/**
 * Verificación exhaustiva de las calculadoras KEEP para el gate editorial.
 *
 * - Ejecuta la fórmula de cada configuración con inputs típicos y valida el output.
 * - Abre todas las fuentes citadas (con caché por URL) y conserva evidencia HTTP.
 * - Distingue evidencia automática de aprobación humana: este script sólo puede
 *   escribir `automatedTests: passed`; nunca falsifica `sourceVerified` ni
 *   `editorialReview: approved`.
 *
 * Uso:
 *   node --experimental-strip-types scripts/verify-keep-editorial.ts
 *   node --experimental-strip-types scripts/verify-keep-editorial.ts --write-tests
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { formulas } from '../src/lib/formulas/index.ts';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const REPORTS = join(ROOT, 'reports');
const AUDIT = JSON.parse(readFileSync(join(REPORTS, 'adsense-audit.json'), 'utf8'));
const WRITE_TESTS = process.argv.includes('--write-tests');
const WRITE_SOURCE_CHECKS = process.argv.includes('--write-source-checks');
const FORMULA_ONLY = process.argv.includes('--formula-only');
const GATE = process.argv.includes('--gate');
const CHECKED_AT = new Date().toISOString();

const LOCALES: Record<string, { country: string; prefix: string }> = {
  calcs: { country: 'AR', prefix: '' }, 'calcs-mx': { country: 'MX', prefix: 'mx' },
  'calcs-co': { country: 'CO', prefix: 'co' }, 'calcs-cl': { country: 'CL', prefix: 'cl' },
  'calcs-pe': { country: 'PE', prefix: 'pe' }, 'calcs-ec': { country: 'EC', prefix: 'ec' },
  'calcs-ve': { country: 'VE', prefix: 've' }, 'calcs-py': { country: 'PY', prefix: 'py' },
  'calcs-uy': { country: 'UY', prefix: 'uy' }, 'calcs-do': { country: 'DO', prefix: 'do' },
  'calcs-es': { country: 'ES', prefix: 'es' }, 'calcs-en': { country: 'US', prefix: 'en' },
  'calcs-pt': { country: 'BR', prefix: 'pt' }, 'calcs-pt-pt': { country: 'PT', prefix: 'pt-pt' },
};

type CalcEntry = { file: string; calc: any; country: string; url: string };
const entries = new Map<string, CalcEntry>();
for (const [dir, meta] of Object.entries(LOCALES)) {
  const full = join(CONTENT, dir); if (!existsSync(full)) continue;
  for (const name of readdirSync(full).filter((x) => x.endsWith('.json'))) {
    const file = join(full, name); let calc: any;
    try { calc = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
    if (!calc?.slug) continue;
    entries.set(`${calc.slug}@${meta.country}`, {
      file, calc, country: meta.country,
      url: `https://hacecuentas.com/${meta.prefix ? `${meta.prefix}/` : ''}${calc.slug}`,
    });
  }
}

const keepRows = AUDIT.rows.filter((x: any) => x.decision === 'KEEP');
const keep: CalcEntry[] = keepRows.map((row: any) => entries.get(`${row.slug}@${row.country}`)).filter(Boolean);

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  let v = value.trim().replace(/^\s*(?:ej(?:emplo)?|e\.g\.)\s*[:.]?\s*/i, '');
  v = v.split(/\s+(?:o|or)\s+/i)[0];
  if (!/[-+]?\d/.test(v)) return undefined;
  if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
  else if (!/^[-+]?\d+\.\d+$/.test(v)) v = v.replace(/\./g, '');
  const n = Number(v.replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function typicalInputs(fields: any[]): Record<string, any> {
  const out: Record<string, any> = {};
  const past = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);
  for (const f of Array.isArray(fields) ? fields : []) {
    const id = f?.id || f?.key;
    if (!id) continue;
    if (f.default !== undefined && f.default !== null && f.default !== '') { out[id] = f.default; continue; }
    const type = f.type || 'number';
    if (['number', 'range', 'currency', 'percentage'].includes(type)) {
      let n = parseNumber(f.placeholder);
      if (n === undefined && Number.isFinite(f.min)) n = f.min > 0 ? f.min : (f.step || 1);
      if (n === undefined) n = 1;
      if (Number.isFinite(f.min)) n = Math.max(n, f.min);
      if (Number.isFinite(f.max)) n = Math.min(n, f.max);
      if (n === 0 && (!Number.isFinite(f.min) || f.min <= 1)) n = 1;
      out[id] = n;
    } else if (type === 'select' || type === 'radio') {
      const opts = Array.isArray(f.options) ? f.options : [];
      const chosen = opts.find((o: any) => (typeof o === 'object' ? o.value : o) === f.default)
        ?? opts.find((o: any) => String(typeof o === 'object' ? o.value : o).trim() !== '');
      out[id] = typeof chosen === 'object' ? chosen?.value : (chosen ?? '');
    } else if (['boolean', 'checkbox', 'toggle'].includes(type)) out[id] = false;
    else if (type === 'date') out[id] = /^\d{4}-\d{2}-\d{2}$/.test(String(f.placeholder || '')) ? f.placeholder : past;
    else if (type === 'datetime-local') out[id] = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(f.placeholder || '')) ? f.placeholder : `${past}T12:00`;
    else {
      let text = String(f.placeholder || '').replace(/^\s*(?:ej(?:emplo)?|e\.g\.)\s*[:.]?\s*/i, '');
      out[id] = text.split(/\s+(?:o|or)\s+/i)[0] || '10,20,30';
    }
  }
  if ('capitalInicial' in out && 'aporteMensual' in out && Number(out.capitalInicial) === 0 && Number(out.aporteMensual) === 0) out.capitalInicial = 1000;
  if ('domingos' in out && 'festivos' in out && 'descansos' in out && Number(out.domingos) + Number(out.festivos) + Number(out.descansos) === 0) out.domingos = 1;
  if ('fechaVencimiento' in out && 'fechaPresentacion' in out) {
    out.fechaVencimiento = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);
    out.fechaPresentacion = new Date(Date.now() - 10 * 86400_000).toISOString().slice(0, 10);
  }
  if ('v1' in out && 'v2' in out && String(out.v1).includes('—')) { out.v1 = '88,92,76,91'; out.v2 = '3,4,3,2'; }
  return out;
}

function validateOutput(result: any): string[] {
  const errors: string[] = [];
  if (!result || typeof result !== 'object' || Array.isArray(result)) return ['output-no-es-objeto'];
  const vals = Object.values(result);
  if (!vals.length) return ['output-vacio'];
  const walk = (v: any, path: string, depth = 0) => {
    if (typeof v === 'number' && !Number.isFinite(v)) errors.push(`${path}:numero-no-finito`);
    if (depth === 0 && typeof v === 'string' && /^(?:nan|undefined|null|infinity|todo|fixme|resultado)$/i.test(v.trim())) errors.push(`${path}:placeholder`);
    if (Array.isArray(v)) v.slice(0, 20).forEach((x, i) => walk(x, `${path}[${i}]`, depth + 1));
    else if (v && typeof v === 'object') Object.entries(v).slice(0, 50).forEach(([k, x]) => walk(x, `${path}.${k}`, depth + 1));
  };
  vals.forEach((v, i) => walk(v, `out${i}`));
  const useful = vals.some((v) => (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.trim().length > 0) || (v && typeof v === 'object'));
  if (!useful) errors.push('sin-output-util');
  return errors;
}

async function formulaCheck(entry: CalcEntry) {
  const id = entry.calc.formulaId;
  const fn = formulas[id as keyof typeof formulas] as any;
  if (!id) return { passed: false, formulaId: '', error: 'sin-formulaId' };
  if (typeof fn !== 'function') return { passed: false, formulaId: id, error: 'formula-no-registrada' };
  const inputs = typicalInputs(entry.calc.fields || []);
  try {
    const output = await Promise.resolve(fn(inputs));
    const errors = validateOutput(output);
    return { passed: errors.length === 0, formulaId: id, inputs, errors };
  } catch (error: any) {
    return { passed: false, formulaId: id, inputs, error: String(error?.message || error).slice(0, 500) };
  }
}

const STOP = new Set('calculadora calcular calculo calculate calculator como para por con del las los una uno unos unas que qué este esta estos estas sobre desde hasta según segun cuanto cuánto cual cuál hace cuentas 2026 2025 2024 argentina mexico colombia chile peru españa brasil uruguay paraguay ecuador venezuela republica dominicana'.split(' '));
function tokens(text: string): string[] {
  return [...new Set(String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter((x) => x.length >= 4 && !STOP.has(x)))];
}
async function readPrefix(response: Response, limit = 160_000): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  while (size < limit) {
    const { done, value } = await reader.read(); if (done) break;
    if (value) { chunks.push(value); size += value.length; }
  }
  await reader.cancel().catch(() => {});
  const bytes = new Uint8Array(Math.min(size, limit)); let offset = 0;
  for (const chunk of chunks) { const slice = chunk.slice(0, Math.min(chunk.length, limit - offset)); bytes.set(slice, offset); offset += slice.length; if (offset >= limit) break; }
  return new TextDecoder().decode(bytes);
}

type SourceResult = { url: string; ok: boolean; status: number; finalUrl?: string; title?: string; text?: string; error?: string };
async function fetchSource(url: string): Promise<SourceResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000), headers: {
        'user-agent': 'Mozilla/5.0 (compatible; HaceCuentasEditorialAudit/1.0; +https://hacecuentas.com/metodologia)',
        accept: 'text/html,application/pdf,text/plain;q=0.9,*/*;q=0.5', 'accept-language': 'es,en;q=0.8,pt;q=0.7',
      }});
      const raw = await readPrefix(response);
      const title = (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
      const text = raw.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
      return { url, ok: response.ok, status: response.status, finalUrl: response.url, title, text };
    } catch (error: any) {
      if (attempt === 1) return { url, ok: false, status: 0, error: String(error?.message || error).slice(0, 300) };
    }
  }
  return { url, ok: false, status: 0, error: 'unknown' };
}

async function pool<T, R>(items: T[], fn: (x: T) => Promise<R>, concurrency: number): Promise<R[]> {
  const out = new Array<R>(items.length); let next = 0, done = 0;
  async function worker() {
    while (true) {
      const i = next++; if (i >= items.length) return;
      out[i] = await fn(items[i]); done++;
      if (done % 250 === 0) console.error(`[editorial-verify] ${done}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker)); return out;
}

console.log(`[editorial-verify] KEEP=${keep.length}`);
const formulaResults = await pool(keep, formulaCheck, 24);
const sourceUrls = [...new Set(keep.flatMap((e) => (e.calc.sources || []).map((s: any) => s?.url).filter((u: any) => typeof u === 'string' && u)))];
console.log(`[editorial-verify] fuentes únicas=${sourceUrls.length}`);
const previousByUrl = new Map<string, any>();
if (FORMULA_ONLY && existsSync(join(REPORTS, 'editorial-keep-verification.json'))) {
  const previous = JSON.parse(readFileSync(join(REPORTS, 'editorial-keep-verification.json'), 'utf8'));
  for (const row of previous.rows || []) previousByUrl.set(row.url, row);
}
const fetched = FORMULA_ONLY ? [] : await pool(sourceUrls, fetchSource, 40);
const sourceMap = new Map(fetched.map((x) => [x.url, x]));

const rows = keep.map((entry, i) => {
  const prior = previousByUrl.get(entry.url);
  const calcTokens = tokens(`${entry.calc.title} ${entry.calc.h1} ${entry.calc.slug} ${entry.calc.intro || ''} ${entry.calc.keyTakeaway || ''} ${entry.calc.explanation || ''}`);
  const sourceRefsRaw = FORMULA_ONLY && prior ? prior.sourceEvidence : (entry.calc.sources || []).filter((s: any) => s?.url).map((s: any) => {
    const result = sourceMap.get(s.url) || { url: s.url, ok: false, status: 0, error: 'no-fetch-result' };
    let deep = false; try { const u = new URL(s.url); deep = u.pathname.split('/').filter(Boolean).length >= 1 || !!u.search; } catch { /* invalid */ }
    const sourceTokens = new Set(tokens(`${s.name || ''} ${result.title || ''} ${result.text || ''} ${result.finalUrl || s.url}`));
    const overlap = calcTokens.filter((x) => sourceTokens.has(x));
    return { name: s.name || '', url: s.url, ok: result.ok, status: result.status, finalUrl: result.finalUrl || '', deep, title: result.title || '', topicOverlap: overlap.slice(0, 12), error: result.error || '' };
  });
  const sourceRefs = sourceRefsRaw.map((s: any) => {
    const sourceTokens = new Set(tokens(`${s.name || ''} ${s.title || ''} ${s.finalUrl || s.url}`));
    return { ...s, topicOverlap: [...new Set([...(s.topicOverlap || []), ...calcTokens.filter((x) => sourceTokens.has(x))])].slice(0, 12) };
  });
  const formula = formulaResults[i];
  // 401/403/405/429 prueban que el recurso existe aunque el servidor bloquee
  // al robot auditor; se conservan como "reachable", no como contenido leído.
  const isReachable = (s: any) => s.ok || [401, 403, 405, 429].includes(Number(s.status));
  const accessible = sourceRefs.filter((s: any) => s.ok).length;
  const reachable = sourceRefs.filter(isReachable).length;
  const deepAccessible = sourceRefs.filter((s: any) => isReachable(s) && s.deep).length;
  const topicMatched = sourceRefs.filter((s: any) => isReachable(s) && s.topicOverlap.length > 0).length;
  return {
    file: relative(ROOT, entry.file), url: entry.url, slug: entry.calc.slug, country: entry.country,
    formulaPassed: formula.passed, formulaId: formula.formulaId, formulaError: formula.error || (formula.errors || []).join('|'),
    sources: sourceRefs.length, accessibleSources: accessible, reachableSources: reachable, deepAccessibleSources: deepAccessible, topicMatchedSources: topicMatched,
    sourceAutomatedReady: entry.calc.editorialGateQuarantine !== true
      && sourceRefs.length > 0 && accessible > 0 && deepAccessible > 0 && topicMatched > 0,
    sourceVerified: entry.calc.sourceVerified === true, editorialReview: entry.calc.editorialReview || 'pending', automatedTests: entry.calc.automatedTests || 'pending',
    noindex: entry.calc.noindex === true, adsenseEligible: entry.calc.adsenseEligible !== false,
    sourceEvidence: sourceRefs,
  };
});

if (WRITE_TESTS) {
  let changed = 0;
  for (let i = 0; i < keep.length; i++) {
    if (!formulaResults[i].passed) continue;
    const { file, calc } = keep[i];
    if (calc.automatedTests === 'passed') continue;
    calc.automatedTests = 'passed';
    writeFileSync(file, `${JSON.stringify(calc, null, 2)}\n`, 'utf8'); changed++;
  }
  console.log(`[editorial-verify] automatedTests=passed escritos: ${changed}`);
}

if (WRITE_SOURCE_CHECKS) {
  let passed = 0; let needsReview = 0; let changed = 0;
  for (let i = 0; i < keep.length; i++) {
    const { file, calc } = keep[i]; const row = rows[i];
    const state = row.sourceAutomatedReady ? 'passed' : 'needs-review';
    if (state === 'passed') passed++; else needsReview++;
    if (calc.sourceAutomatedCheck === state && calc.sourceCheckedAt === CHECKED_AT.slice(0, 10)) continue;
    calc.sourceAutomatedCheck = state;
    calc.sourceCheckedAt = CHECKED_AT.slice(0, 10);
    writeFileSync(file, `${JSON.stringify(calc, null, 2)}\n`, 'utf8'); changed++;
  }
  console.log(`[editorial-verify] sourceAutomatedCheck escritos: ${changed} (passed=${passed}, needs-review=${needsReview})`);
}

mkdirSync(REPORTS, { recursive: true });
const summary = {
  generatedAt: CHECKED_AT, keep: rows.length, uniqueSourceUrls: sourceUrls.length,
  formulaPassed: rows.filter((r) => r.formulaPassed).length, formulaFailed: rows.filter((r) => !r.formulaPassed).length,
  sourceAutomatedReady: rows.filter((r) => r.sourceAutomatedReady).length,
  sourceNeedsReview: rows.filter((r) => !r.sourceAutomatedReady).length,
  sourceVerified: rows.filter((r) => r.sourceVerified).length,
  editorialApproved: rows.filter((r) => r.editorialReview === 'approved').length,
  automatedTestsPassedInContent: rows.filter((r) => r.automatedTests === 'passed' || (WRITE_TESTS && r.formulaPassed)).length,
  indexableWithoutSourceEvidence: rows.filter((r) => !r.noindex && (!r.sourceAutomatedReady || !r.sourceVerified)).length,
  indexableWithoutEditorialApproval: rows.filter((r) => !r.noindex && r.editorialReview !== 'approved').length,
  pendingStillAdsEligible: rows.filter((r) => !r.sourceAutomatedReady && r.adsenseEligible).length,
  writeTests: WRITE_TESTS,
};
writeFileSync(join(REPORTS, 'editorial-keep-verification.json'), `${JSON.stringify({ summary, rows }, null, 2)}\n`);
const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
writeFileSync(join(REPORTS, 'editorial-keep-verification.csv'), [
  'url,file,country,formula_id,formula_passed,formula_error,sources,accessible_sources,reachable_sources,deep_accessible_sources,topic_matched_sources,source_automated_ready,source_verified,editorial_review,automated_tests',
  ...rows.map((r) => [r.url, r.file, r.country, r.formulaId, r.formulaPassed, r.formulaError, r.sources, r.accessibleSources, r.reachableSources, r.deepAccessibleSources, r.topicMatchedSources, r.sourceAutomatedReady, r.sourceVerified, r.editorialReview, r.automatedTests].map(esc).join(',')),
].join('\n') + '\n');
console.log(JSON.stringify(summary, null, 2));

if (GATE) {
  const failed = summary.formulaFailed > 0
    || summary.indexableWithoutSourceEvidence > 0
    || summary.indexableWithoutEditorialApproval > 0
    || summary.pendingStillAdsEligible > 0;
  if (failed) {
    console.error('\n❌ GATE editorial falló.');
    process.exit(1);
  }
  console.log('\n✅ GATE editorial OK: toda KEEP indexable tiene fórmula, fuente y aprobación; las pendientes están noindex y sin anuncios.');
}
