/**
 * Genera src/lib/calc-compute-index.json — índice slim slug → { formulaId, campos }
 * consumido por el endpoint SSR /api/calc/[slug]/compute.ts.
 *
 * POR QUÉ existe (no borrar sin entender):
 * El endpoint compute corre en el Worker de Cloudflare. Importar ahí los 2850
 * JSON de calcs (eager glob) mete ~21 MiB en el Worker y revienta el límite de
 * bundle (3 MiB free / 10 MiB paid) — mismo problema documentado en
 * src/pages/search-index.json.ts. Por eso bakeamos en build-time SOLO lo mínimo
 * que compute necesita (formulaId para lazy-load la fórmula + tipos de campo
 * para coercion) en un JSON chico (~150 KB) que sí entra cómodo.
 *
 * Las fórmulas (.ts) SÍ se cargan lazy en el Worker (1 chunk por fórmula) —
 * eso es inevitable porque compute las ejecuta, pero suma solo ~2 MB gzip.
 *
 * filename del JSON != formulaId en ~1060 casos, PERO el .ts de la fórmula
 * SIEMPRE se llama igual que formulaId (así lo importa el registry). Por eso
 * el índice mapea slug -> formulaId y el loader arma `formulas/${formulaId}.ts`.
 *
 * Output ordenado por slug -> diffs estables (incremental build + git friendly).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CALCS_DIR = join(ROOT, 'src/content/calcs');
const FORMULAS_DIR = join(ROOT, 'src/lib/formulas');
const OUT = join(ROOT, 'src/lib/calc-compute-index.json');

interface SlimField {
  id: string;
  t: string; // type: number | select | date | text | boolean | radio | ...
  fmt?: string; // format (ej. "thousands")
  r?: 1; // required
  def?: string; // default || placeholder (fallback para campos opcionales)
}

interface SlimEntry {
  f: string; // formulaId
  h?: string; // h1
  cat?: string; // category
  aud?: string; // audience
  loc?: string; // locale
  fields: SlimField[];
}

function slimField(fl: any): SlimField | null {
  if (!fl || typeof fl.id !== 'string') return null;
  const out: SlimField = { id: fl.id, t: String(fl.type || 'text') };
  if (fl.format) out.fmt = String(fl.format);
  if (fl.required) out.r = 1;
  const def = fl.default ?? fl.placeholder;
  if (def !== undefined && def !== null && def !== '') out.def = String(def);
  return out;
}

const index: Record<string, SlimEntry> = {};
let skippedNoFormula = 0;
let skippedNoFile = 0;
let skippedNoindex = 0;

for (const file of readdirSync(CALCS_DIR)) {
  if (!file.endsWith('.json')) continue;
  let d: any;
  try {
    d = JSON.parse(readFileSync(join(CALCS_DIR, file), 'utf8'));
  } catch {
    continue;
  }
  // noindex: el dueño la ocultó del índice de búsqueda. No la exponemos en la API.
  if (d.noindex === true) {
    skippedNoindex++;
    continue;
  }
  const slug = d.slug;
  const formulaId = d.formulaId;
  if (!slug || !formulaId) {
    skippedNoFormula++;
    continue;
  }
  // El .ts de la fórmula tiene que existir (filename == formulaId). Si no,
  // compute no puede ejecutar -> lo dejamos fuera del índice (404 limpio en API).
  if (!existsSync(join(FORMULAS_DIR, `${formulaId}.ts`))) {
    skippedNoFile++;
    continue;
  }
  const fields = (Array.isArray(d.fields) ? d.fields : [])
    .map(slimField)
    .filter(Boolean) as SlimField[];

  const entry: SlimEntry = { f: formulaId, fields };
  if (d.h1) entry.h = d.h1;
  if (d.category) entry.cat = d.category;
  if (d.audience) entry.aud = d.audience;
  if (d.locale) entry.loc = d.locale;
  index[slug] = entry;
}

// Ordenar por slug -> output determinístico (diffs mínimos en git/incremental).
const sorted: Record<string, SlimEntry> = {};
for (const k of Object.keys(index).sort()) sorted[k] = index[k];

writeFileSync(OUT, JSON.stringify(sorted), 'utf8');
const n = Object.keys(sorted).length;
const kb = (JSON.stringify(sorted).length / 1024).toFixed(0);
console.log(
  `calc-compute-index.json: ${n} calcs (${kb} KB) — skip noindex=${skippedNoindex}, sin-formulaId=${skippedNoFormula}, sin-.ts=${skippedNoFile}`,
);
