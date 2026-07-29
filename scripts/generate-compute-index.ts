/**
 * Genera src/lib/calc-compute-index.json — índice slim slug → { formulaId, campos }
 * consumido por el endpoint SSR /api/calc/[slug]/compute.ts y el servidor MCP
 * (/mcp.ts), vía src/lib/calc-compute.ts. Incluye TODAS las colecciones de
 * locale (ES/EN/ES-ES/MX/CO/CL/PT) — los slugs son únicos entre colecciones.
 *
 * POR QUÉ existe (no borrar sin entender):
 * El endpoint compute corre en el Worker de Cloudflare. Importar ahí los miles de
 * JSON de calcs (eager glob) mete ~21 MiB en el Worker y revienta el límite de
 * bundle (3 MiB free / 10 MiB paid) — mismo problema documentado en
 * src/pages/search-index.json.ts. Por eso bakeamos en build-time SOLO lo mínimo
 * que compute necesita (formulaId para lazy-load la fórmula + tipos de campo
 * para coercion) en un JSON chico (~250 KB) que sí entra cómodo.
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
import { canServeCalc } from '../src/lib/content-policy.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FORMULAS_DIR = join(ROOT, 'src/lib/formulas');
const OUT = join(ROOT, 'src/lib/calc-compute-index.json');

// Mismas colecciones/prefijos que generate-calc-api-index.ts (fuente de verdad
// del catálogo). El locale sale de la colección — el campo `locale` del JSON va
// vacío. Los slugs son globalmente únicos entre colecciones (0 colisiones), así
// que el índice se sigue keyeando por slug; el prefijo (p) reconstruye la URL.
const LOCALES: Array<{ dir: string; pathPrefix: string; locale: string }> = [
  { dir: 'src/content/calcs', pathPrefix: '', locale: 'es' },
  { dir: 'src/content/calcs-en', pathPrefix: 'en/', locale: 'en' },
  { dir: 'src/content/calcs-es', pathPrefix: 'es/', locale: 'es-ES' },
  { dir: 'src/content/calcs-co', pathPrefix: 'co/', locale: 'es-CO' },
  { dir: 'src/content/calcs-mx', pathPrefix: 'mx/', locale: 'es-MX' },
  { dir: 'src/content/calcs-cl', pathPrefix: 'cl/', locale: 'es-CL' },
  { dir: 'src/content/calcs-pe', pathPrefix: 'pe/', locale: 'es-PE' },
  { dir: 'src/content/calcs-ec', pathPrefix: 'ec/', locale: 'es-EC' },
  { dir: 'src/content/calcs-ve', pathPrefix: 've/', locale: 'es-VE' },
  { dir: 'src/content/calcs-py', pathPrefix: 'py/', locale: 'es-PY' },
  { dir: 'src/content/calcs-uy', pathPrefix: 'uy/', locale: 'es-UY' },
  { dir: 'src/content/calcs-do', pathPrefix: 'do/', locale: 'es-DO' },
  { dir: 'src/content/calcs-pt', pathPrefix: 'pt/', locale: 'pt-BR' },
  { dir: 'src/content/calcs-pt-pt', pathPrefix: 'pt-pt/', locale: 'pt-PT' },
];

interface SlimField {
  id: string;
  t: string; // type: number | select | date | text | boolean | radio | ...
  fmt?: string; // format (ej. "thousands")
  r?: 1; // required
  def?: string; // default || placeholder (fallback para campos opcionales)
  o?: string[]; // valores válidos (solo select/radio) — para que get_calculator los liste
}

interface SlimEntry {
  f: string; // formulaId
  h?: string; // h1
  cat?: string; // category
  aud?: string; // audience
  loc?: string; // locale (es, en, es-MX, pt-BR, ...)
  p?: string; // path prefix de la URL pública (en/, mx/, ...); ausente = root ES
  fields: SlimField[];
}

function slimField(fl: any): SlimField | null {
  if (!fl || typeof fl.id !== 'string') return null;
  const out: SlimField = { id: fl.id, t: String(fl.type || 'text') };
  if (fl.format) out.fmt = String(fl.format);
  if (fl.required) out.r = 1;
  const def = fl.default ?? fl.placeholder;
  if (def !== undefined && def !== null && def !== '') out.def = String(def);
  // Valores válidos de select/radio (sin labels — solo el value que espera la fórmula).
  if ((fl.type === 'select' || fl.type === 'radio') && Array.isArray(fl.options)) {
    const vals = fl.options
      .map((o: any) => (o && typeof o === 'object' ? o.value : o))
      .filter((v: any) => v !== undefined && v !== null)
      .map((v: any) => String(v));
    if (vals.length) out.o = vals;
  }
  return out;
}

const index: Record<string, SlimEntry> = {};
let skippedNoFormula = 0;
let skippedNoFile = 0;
let skippedNoindex = 0;
let collisions = 0;

for (const { dir, pathPrefix, locale } of LOCALES) {
  const fullDir = join(ROOT, dir);
  if (!existsSync(fullDir)) continue;
  for (const file of readdirSync(fullDir)) {
    if (!file.endsWith('.json')) continue;
    let d: any;
    try {
      d = JSON.parse(readFileSync(join(fullDir, file), 'utf8'));
    } catch {
      continue;
    }
    // noindex/restringida: no la exponemos en la API de cómputo. Los aliases
    // canónicos sí siguen sirviéndose para no romper integraciones existentes;
    // `canDistributeCalc` los excluye sólo de superficies de descubrimiento.
    if (!canServeCalc(d, pathPrefix)) {
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
    entry.loc = locale; // el locale lo define la colección (el campo JSON va vacío)
    if (pathPrefix) entry.p = pathPrefix; // prefijo de URL: en/, mx/, ... ('' = root ES)
    // Los slugs son globalmente únicos entre colecciones. Si esto sube de 0,
    // hay drift (dos calcs con el mismo slug) y compute serviría el equivocado.
    if (index[slug]) collisions++;
    index[slug] = entry;
  }
}

// Ordenar por slug -> output determinístico (diffs mínimos en git/incremental).
const sorted: Record<string, SlimEntry> = {};
for (const k of Object.keys(index).sort()) sorted[k] = index[k];

// La migración 2026-07-28 consolidó las páginas HTML en hubs Astro y dejó
// vacíos los directorios content/calcs*. Las fórmulas y el contrato REST/MCP
// siguen vigentes: no debemos convertir un índice programático sano en `{}`.
// Si no hay fuentes editoriales nuevas, preservamos el último índice no vacío.
let finalIndex = sorted;
if (Object.keys(finalIndex).length === 0 && existsSync(OUT)) {
  try {
    const previous = JSON.parse(readFileSync(OUT, 'utf8')) as Record<string, SlimEntry>;
    if (previous && Object.keys(previous).length > 0) {
      finalIndex = previous;
      console.log(`calc-compute-index.json: migración hub detectada — preservo ${Object.keys(previous).length} herramientas existentes`);
    }
  } catch {
    // El gate de cantidad de abajo deja visible el fallo.
  }
}
if (Object.keys(finalIndex).length === 0) {
  throw new Error('calc-compute-index.json quedaría vacío; aborto para no romper REST/MCP');
}

writeFileSync(OUT, JSON.stringify(finalIndex), 'utf8');
const n = Object.keys(finalIndex).length;
const kb = (JSON.stringify(finalIndex).length / 1024).toFixed(0);
console.log(
  `calc-compute-index.json: ${n} calcs (${kb} KB) — skip noindex=${skippedNoindex}, sin-formulaId=${skippedNoFormula}, sin-.ts=${skippedNoFile}, colisiones=${collisions}`,
);
if (collisions > 0) {
  console.warn(
    `⚠️  ${collisions} colisión(es) de slug entre colocaciones de locale — compute/MCP servirá un solo calc por slug. Revisá los slugs duplicados.`,
  );
}
