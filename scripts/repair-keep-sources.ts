/** Repara fuentes KEEP usando sólo evidencia ya presente en cada JSON. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const report = JSON.parse(readFileSync(join(ROOT, 'reports/editorial-keep-verification.json'), 'utf8'));
const pending = report.rows.filter((row: any) => !row.sourceAutomatedReady);
let promoted = 0;
let borrowed = 0;
let institutionMatched = 0;

const normalize = (value: unknown) => String(value || '').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const institution = (value: unknown) => normalize(String(value || '').split(/\s+[—–-]\s+|\s*\(|\s*:/)[0]);
const stop = new Set('calculadora calcular calculo calculator calculate para por con del las los una uno unos unas que este esta 2026 2025 argentina mexico chile colombia peru ecuador espana brasil'.split(' '));
const tokens = (value: unknown) => new Set(normalize(value).split(/\s+/).filter((token) => token.length >= 4 && !stop.has(token)));

const readyByFormula = new Map<string, any>();
const goodByInstitution = new Map<string, any[]>();
for (const row of report.rows.filter((item: any) => item.sourceAutomatedReady)) {
  if (!readyByFormula.has(row.formulaId)) readyByFormula.set(row.formulaId, row);
  for (const source of row.sourceEvidence || []) {
    if (!source.deep || !source.topicOverlap?.length || !(source.ok || [401, 403, 405, 429].includes(Number(source.status)))) continue;
    const key = institution(source.name); if (!key) continue;
    const list = goodByInstitution.get(key) || [];
    if (!list.some((item) => item.url === source.url)) list.push(source);
    goodByInstitution.set(key, list);
  }
}

for (const row of pending) {
  const file = join(ROOT, row.file);
  const calc = JSON.parse(readFileSync(file, 'utf8'));
  const url = calc.dataUpdate?.sourceUrl;
  if (typeof url !== 'string' || !url) continue;
  let deep = false;
  try { const parsed = new URL(url); deep = parsed.pathname.split('/').filter(Boolean).length > 0 || !!parsed.search; } catch { continue; }
  if (!deep) continue;
  const sources = Array.isArray(calc.sources) ? calc.sources : [];
  if (sources.some((source: any) => source?.url === url)) continue;
  sources.unshift({ name: calc.dataUpdate?.source || 'Fuente principal de los datos', url });
  calc.sources = sources;
  writeFileSync(file, `${JSON.stringify(calc, null, 2)}\n`, 'utf8');
  promoted++;
}

// Una misma fórmula compartida entre idiomas/países usa la misma metodología.
// Si otra versión KEEP ya tiene fuentes específicas verificables, reutilizamos
// esas citas en la versión pendiente (no una fuente genérica por categoría).
for (const row of pending) {
  const donor = readyByFormula.get(row.formulaId);
  if (!donor) continue;
  const file = join(ROOT, row.file);
  const calc = JSON.parse(readFileSync(file, 'utf8'));
  const sources = Array.isArray(calc.sources) ? calc.sources : [];
  const donorGood = (donor.sourceEvidence || []).filter((source: any) =>
    source.deep && source.topicOverlap?.length && (source.ok || [401, 403, 405, 429].includes(Number(source.status))));
  let changed = false;
  for (const source of donorGood) {
    if (sources.some((current: any) => current?.url === source.url)) continue;
    sources.push({ name: source.name, url: source.url }); changed = true;
  }
  if (!changed) continue;
  calc.sources = sources;
  writeFileSync(file, `${JSON.stringify(calc, null, 2)}\n`, 'utf8');
  borrowed++;
}

// Si la página ya cita una institución concreta pero su link está roto o es la
// home, buscamos dentro del corpus otra cita ESPECÍFICA y verificada de esa
// misma institución. Elegimos la que más vocabulario comparte con el contenido.
for (const row of pending) {
  const file = join(ROOT, row.file);
  const calc = JSON.parse(readFileSync(file, 'utf8'));
  const sources = Array.isArray(calc.sources) ? calc.sources : [];
  const calcTokens = tokens(`${calc.title} ${calc.h1} ${calc.slug} ${calc.intro || ''} ${calc.explanation || ''}`);
  let changed = false;
  for (const current of sources) {
    const candidates = goodByInstitution.get(institution(current?.name)) || [];
    let best: any = null; let bestScore = 0;
    for (const candidate of candidates) {
      if (sources.some((item: any) => item?.url === candidate.url)) continue;
      const candidateTokens = tokens(`${candidate.name} ${candidate.title || ''} ${candidate.url}`);
      let score = 0; for (const token of calcTokens) if (candidateTokens.has(token)) score++;
      if (score > bestScore) { best = candidate; bestScore = score; }
    }
    if (!best || bestScore < 1) continue;
    sources.push({ name: best.name, url: best.url }); changed = true;
  }
  if (!changed) continue;
  calc.sources = sources;
  writeFileSync(file, `${JSON.stringify(calc, null, 2)}\n`, 'utf8');
  institutionMatched++;
}

console.log(JSON.stringify({ pending: pending.length, dataUpdateSourcesPromoted: promoted, exactFormulaSourcesBorrowed: borrowed, institutionSpecificSourcesMatched: institutionMatched }, null, 2));
