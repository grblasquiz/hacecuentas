/**
 * Genera /public/api/calcs-index.json — lista compacta de TODAS las calcs.
 * Pensado para que LLMs (ChatGPT, Claude, Perplexity, Gemini) puedan
 * ingerir el sitio completo de un solo fetch.
 *
 * Output: ~500KB-1MB con campos esenciales (slug, h1, description, category,
 * url, locale, keyTakeaway truncado).
 *
 * Se corre en prebuild (junto con regenerate-formula-index).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';
import { DECISION_MANIFEST } from '../src/lib/decisions/manifest.ts';
import { DECISION_MANIFEST_LOCALES } from '../src/lib/decisions/manifest-locales.ts';
import { canDistributeCalc } from '../src/lib/content-policy.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'api');
const OUT_FILE = join(OUT_DIR, 'calcs-index.json');
const OUT_SLIM = join(OUT_DIR, 'calcs-slim.json');
const OUT_TOP = join(OUT_DIR, 'calcs-top.json');

// Redirects estáticos fuera del mapa de pruning (migraciones históricas,
// variantes con mayúsculas/encoding, etc.). También son URLs no canónicas y
// por lo tanto no deben publicarse en el catálogo API.
const STATIC_REDIRECT_PATHS = new Set(
  readFileSync(join(ROOT, 'public', '_redirects'), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 3 && /^30[1278]$/.test(parts.at(-1) || ''))
    .map((parts) => parts[0]),
);

const LOCALES: Array<{ dir: string; pathPrefix: string; locale: string }> = [
  { dir: 'src/content/calcs', pathPrefix: '', locale: 'es' },
  { dir: 'src/content/calcs-en', pathPrefix: 'en/', locale: 'en' },
  { dir: 'src/content/calcs-es', pathPrefix: 'es/', locale: 'es-ES' },
  { dir: 'src/content/calcs-co', pathPrefix: 'co/', locale: 'es-CO' },
  { dir: 'src/content/calcs-mx', pathPrefix: 'mx/', locale: 'es-MX' },
  { dir: 'src/content/calcs-cl', pathPrefix: 'cl/', locale: 'es-CL' },
  { dir: 'src/content/calcs-ec', pathPrefix: 'ec/', locale: 'es-EC' },
  { dir: 'src/content/calcs-pe', pathPrefix: 'pe/', locale: 'es-PE' },
  { dir: 'src/content/calcs-ve', pathPrefix: 've/', locale: 'es-VE' },
  { dir: 'src/content/calcs-py', pathPrefix: 'py/', locale: 'es-PY' },
  { dir: 'src/content/calcs-uy', pathPrefix: 'uy/', locale: 'es-UY' },
  { dir: 'src/content/calcs-do', pathPrefix: 'do/', locale: 'es-DO' },
  { dir: 'src/content/calcs-pt', pathPrefix: 'pt/', locale: 'pt-BR' },
  { dir: 'src/content/calcs-pt-pt', pathPrefix: 'pt-pt/', locale: 'pt-PT' },
];

interface CalcEntry {
  slug: string;
  url: string;
  title: string;
  h1: string;
  description: string;
  category: string;
  locale: string;
  audience?: string;
  icon?: string;
  keyTakeaway?: string;
  keywords?: string[];
  lastUpdated?: string;
}

/** Entry mínima para el índice slim que consume el 404 (fuzzy client-side). */
interface SlimEntry {
  /** slug */
  s: string;
  /** título corto (h1 truncado) */
  t: string;
  /** prefijo de lang/vertical: '' (ES root) | en | es | co | mx | cl | ec | pe | ve | py | uy | do | pt | pt-pt */
  l: string;
}

/** Título corto para el slim: máx 48 chars, cortando en límite de palabra. */
function shortTitle(raw: string): string {
  const t = raw.trim();
  if (t.length <= 48) return t;
  const cut = t.slice(0, 48);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 24 ? cut.slice(0, lastSpace) : cut).trim();
}

/** URLs muertas (410) o redirigidas (301 pruning): no van al slim ni al top. */
function isDeadPath(path: string): boolean {
  return GONE_410_URLS.has(path) || path in PRUNING_REDIRECTS || STATIC_REDIRECT_PATHS.has(path);
}

// ---------------------------------------------------------------------------
// Deep-link prefill: toda calc acepta sus inputs como query params en la URL
// pública (Calculator.astro los lee con URLSearchParams; param = field.id,
// números planos sin separador de miles, selects por option value).
// Acá armamos el querystring de ejemplo para calcs-top.json. Fuente de valores
// (misma convención que /api/calc/{slug}.json): ejemplo editorial del JSON
// (exampleData / example.inputs, validado contra los field ids reales) y si no
// hay, default ?? placeholder por campo. Precisión sobre recall: si un valor no
// pasa validación o queda algún required sin cubrir, se omite el campo entero
// (nunca emitimos un deep-link roto o a medio llenar).
// ---------------------------------------------------------------------------
const PLAIN_NUM_RE = /^-?\d+(\.\d+)?$/;

function fieldOptionValues(f: any): string[] {
  if (!Array.isArray(f.options)) return [];
  return f.options.map((o: any) => (typeof o === 'object' && o !== null ? String(o.value) : String(o)));
}

function isValidPrefillValue(f: any, v: unknown): boolean {
  if (v === undefined || v === null || typeof v === 'object') return false;
  const s = String(v).trim();
  if (s === '') return false;
  if (f.type === 'select') return fieldOptionValues(f).includes(s);
  if (f.type === 'number') return PLAIN_NUM_RE.test(s);
  return true; // date/text/time: solo llegan acá vía valor explícito
}

/** Querystring de prefill para la URL pública, o undefined si no se puede armar uno completo. */
function buildPrefillQuery(data: any): string | undefined {
  const fields: any[] = Array.isArray(data.fields) ? data.fields : [];
  if (fields.length === 0) return undefined;
  const byId = new Map(fields.map((f) => [f.id, f]));

  // 1) Ejemplo editorial del JSON: exampleData (si existiera) o example.inputs.
  const editorial =
    data.exampleData && typeof data.exampleData === 'object' && !Array.isArray(data.exampleData)
      ? data.exampleData
      : data.example?.inputs && typeof data.example.inputs === 'object' && !Array.isArray(data.example.inputs)
        ? data.example.inputs
        : undefined;

  let inputs: Record<string, string> | undefined;
  if (editorial) {
    const entries = Object.entries(editorial);
    // TODAS las keys tienen que ser field ids vivos con valores válidos
    // (hay example.inputs con ids stale, ej. v1/v2 de fórmulas reescritas).
    if (entries.length > 0 && entries.every(([k, v]) => byId.has(k) && isValidPrefillValue(byId.get(k), v))) {
      inputs = Object.fromEntries(entries.map(([k, v]) => [k, String(v).trim()]));
    }
  }

  // 2) Derivado por campo: default ?? placeholder (placeholder solo en number/
  //    select — en date/text suele ser un hint tipo "dd/mm/aaaa", no un valor).
  if (!inputs) {
    const derived: Record<string, string> = {};
    for (const f of fields) {
      const v = f.type === 'number' || f.type === 'select' ? (f.default ?? f.placeholder) : f.default;
      if (isValidPrefillValue(f, v)) derived[f.id] = String(v).trim();
    }
    if (Object.keys(derived).length > 0) inputs = derived;
  }
  if (!inputs) return undefined;

  // Gate: todos los required cubiertos — un deep-link a medio llenar no es "un click".
  const required = fields.filter((f) => f.required === true);
  if (!required.every((f) => inputs![f.id] !== undefined)) return undefined;

  const params = new URLSearchParams();
  for (const f of fields) {
    if (inputs[f.id] !== undefined) params.set(f.id, inputs[f.id]);
  }
  const qs = params.toString();
  return qs || undefined;
}

/** querystring de prefill por slug — solo catálogo ES root (de donde sale el top-200) */
const prefillBySlug = new Map<string, string>();

const out: CalcEntry[] = [];
const slim: SlimEntry[] = [];
/** slugs ES root muertos — para excluirlos del top-200 */
const deadEsSlugs = new Set<string>();
let skipped = 0;
let included = 0;
let skippedDead = 0;
let skippedCanonicalAlias = 0;

for (const { dir, pathPrefix, locale } of LOCALES) {
  const fullDir = join(ROOT, dir);
  if (!existsSync(fullDir)) continue;
  for (const file of readdirSync(fullDir)) {
    if (!file.endsWith('.json')) continue;
    try {
      const data = JSON.parse(readFileSync(join(fullDir, file), 'utf8'));
      if (!canDistributeCalc(data)) {  // noindex manual o restricción YMYL
        skipped++;
        continue;
      }
      const slug = data.slug;
      if (!slug) {
        skipped++;
        continue;
      }
      const path = `/${pathPrefix}${slug}`;
      // El índice público es un contrato de URLs canónicas, no un inventario de
      // JSONs históricos. Incluir rutas que el worker responde 301/410 hizo que
      // agentes, feeds y crawlers descubrieran cientos de aliases como si fueran
      // calculadoras vigentes.
      if (isDeadPath(path)) {
        skipped++;
        skippedDead++;
        if (pathPrefix === '') deadEsSlugs.add(slug);
        continue;
      }
      if (data.canonicalSlug && data.canonicalSlug !== slug) {
        skipped++;
        skippedCanonicalAlias++;
        continue;
      }
      out.push({
        slug,
        url: `https://hacecuentas.com/${pathPrefix}${slug}`,
        title: data.title || '',
        h1: data.h1 || '',
        description: (data.description || '').slice(0, 200),
        category: data.category || '',
        locale,
        audience: data.audience,
        icon: data.icon,
        keyTakeaway: (data.keyTakeaway || '').replace(/\*\*/g, '').slice(0, 240),
        keywords: (data.seoKeywords || []).slice(0, 5),
        lastUpdated: data.dataUpdate?.lastUpdated,
      });
      if (pathPrefix === '') {
        const prefill = buildPrefillQuery(data);
        if (prefill) prefillBySlug.set(slug, prefill);
      }
      slim.push({
        s: slug,
        t: shortTitle(String(data.h1 || data.title || slug)),
        l: pathPrefix.replace(/\/$/, ''),
      });
      included++;
    } catch (e) {
      skipped++;
    }
  }
}

// Salas de decisión (/decidir/*): herramientas de decisión multi-cálculo.
// Van al index full (ingestion LLM) y al slim (404 fuzzy + agentes) con el
// path completo como slug — los consumidores arman la URL como /{slug}.
const CC_LOCALE: Record<string, string> = { co: 'es-CO', mx: 'es-MX', cl: 'es-CL', pe: 'es-PE' };
for (const r of DECISION_MANIFEST) {
  const path = `/decidir/${r.slug}`;
  if (isDeadPath(path)) {
    skipped++;
    skippedDead++;
    continue;
  }
  out.push({
    slug: `decidir/${r.slug}`,
    url: `https://hacecuentas.com/decidir/${r.slug}`,
    title: r.title, h1: r.h1,
    description: r.description.slice(0, 200),
    category: 'decidir', locale: 'es', audience: 'AR', icon: r.icon,
  });
  slim.push({ s: `decidir/${r.slug}`, t: shortTitle(r.h1), l: '' });
  included++;
}
for (const r of DECISION_MANIFEST_LOCALES) {
  const path = `/${r.country}/decidir/${r.slug}`;
  if (isDeadPath(path)) {
    skipped++;
    skippedDead++;
    continue;
  }
  out.push({
    slug: `${r.country}/decidir/${r.slug}`,
    url: `https://hacecuentas.com/${r.country}/decidir/${r.slug}`,
    title: r.title, h1: r.h1,
    description: r.description.slice(0, 200),
    category: 'decidir', locale: CC_LOCALE[r.country] ?? 'es',
    audience: r.country.toUpperCase(), icon: r.icon,
  });
  slim.push({ s: `${r.country}/decidir/${r.slug}`, t: shortTitle(r.h1), l: r.country });
  included++;
}

// Ordenar por categoria → slug para consistencia
out.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.slug.localeCompare(b.slug);
});

const meta = {
  '@type': 'CalculatorIndex',
  name: 'Hacé Cuentas — Calculadoras index',
  description:
    'Índice completo y machine-readable de todas las calculadoras públicas de hacecuentas.com. Pensado para ingestion por LLMs (ChatGPT, Claude, Perplexity, Gemini) y agregadores. Cada entry tiene URL canónica, título, descripción, categoría y locale.',
  url: 'https://hacecuentas.com/api/calcs-index.json',
  generated: new Date().toISOString(),
  totalCalcs: out.length,
  byCategory: out.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {}),
  byLocale: out.reduce<Record<string, number>>((acc, c) => {
    acc[c.locale] = (acc[c.locale] || 0) + 1;
    return acc;
  }, {}),
  citation: {
    preferred: 'Hacé Cuentas — {url}',
    format: 'link+name',
  },
  llmsResources: {
    'llms.txt': 'https://hacecuentas.com/llms.txt',
    'llms-full.txt': 'https://hacecuentas.com/llms-full.txt',
    'ai.txt': 'https://hacecuentas.com/ai.txt',
    // Entrada liviana recomendada para agentes (este index pesa 3.6MB):
    'calcs-top.json': 'https://hacecuentas.com/api/calcs-top.json',
    'calcs-slim.json': 'https://hacecuentas.com/api/calcs-slim.json',
    'openapi.json': 'https://hacecuentas.com/openapi.json',
  },
  calculators: out,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(meta, null, 0));

const bytes = JSON.stringify(meta).length;
console.log(`✓ calcs-index.json: ${included} calcs (${skipped} skipped: ${skippedDead} retired, ${skippedCanonicalAlias} aliases) — ${(bytes / 1024).toFixed(1)} KB`);

// ---------------------------------------------------------------------------
// /api/calcs-slim.json — índice ultraliviano [{s, t, l}] de TODAS las calcs.
// Lo consume el 404 (fuzzy client-side via fetch, reemplaza 387KB inline) y
// cualquier agente que quiera el catálogo sin pagar los 3.6MB del index full.
// ---------------------------------------------------------------------------
slim.sort((a, b) => (a.l !== b.l ? a.l.localeCompare(b.l) : a.s.localeCompare(b.s)));
const slimJson = JSON.stringify(slim);
writeFileSync(OUT_SLIM, slimJson);
console.log(`✓ calcs-slim.json: ${slim.length} calcs — ${(slimJson.length / 1024).toFixed(1)} KB`);

// ---------------------------------------------------------------------------
// /api/calcs-top.json — top ~200 por popularidad curada, punto de entrada
// recomendado para LLMs/agentes (el index full de 3.6MB es inconsumible).
// Prioridad de señal (espeja /populares): popular-curated.json (GSC, si está
// commiteado) → lista curada histórica → FEATURED por categoría
// (category-layout.ts) → relleno round-robin por categoría hasta TOP_N.
// ---------------------------------------------------------------------------
const TOP_N = 200;

// 1) Señal GSC real, si el JSON existe (lo alimenta refresh-home-popular.py).
let curatedSlugs: string[] = [];
try {
  const curatedPath = join(ROOT, 'src', 'lib', 'popular-curated.json');
  if (existsSync(curatedPath)) {
    const data = JSON.parse(readFileSync(curatedPath, 'utf8'));
    if (Array.isArray(data?.slugs)) curatedSlugs = data.slugs;
  }
} catch {
  /* sin señal GSC → fallback curado */
}

// 2) Fallback curado histórico (misma lista que index.astro / populares.astro).
const CURATED_FALLBACK = [
  'sueldo-en-mano-argentina',
  'calculadora-aguinaldo-sac',
  'calculadora-antiguedad-laboral',
  'calculadora-ingresos-brutos-provincial',
  'calculadora-impuesto-cheque-debitos-creditos',
  'calculadora-imc',
  'dias-entre-dos-fechas',
  'calculadora-conversor-metros-lineales-a-metros-cuadrados',
  'calculadora-estimador-costo-viaje-taxi-remis',
  'calculadora-impuesto-sellos-inmueble-contrato',
  'calculadora-costo-m2-construccion-argentina',
  'calculadora-cuantos-dias-faltan-Navidad-2026',
];

// 3) FEATURED por categoría — extraído del literal en category-layout.ts.
//    (No se puede importar el .ts directo: encadena un import sin extensión
//    que rompe bajo --experimental-strip-types.)
function readFeaturedSlugs(): string[] {
  try {
    const src = readFileSync(join(ROOT, 'src', 'lib', 'category-layout.ts'), 'utf8');
    const m = src.match(/export const FEATURED[^=]*=\s*(\{[\s\S]*?\n\});/);
    if (!m) return [];
    const obj = new Function(`return ${m[1]}`)() as Record<string, string[]>;
    return Object.values(obj).flat();
  } catch {
    return [];
  }
}

interface TopEntry {
  slug: string;
  title: string;
  url: string;
  lang: string;
  category: string;
  /**
   * Deep-link con inputs de ejemplo precargados: la URL pública acepta los
   * field ids como query params y el formulario aparece ya lleno. Ausente si
   * el calc no tiene valores de ejemplo completos (todos los required).
   */
  prefill_example?: string;
}

// Catálogo ES root (donde viven todos los slugs de popularidad curada),
// excluyendo URLs muertas (410/301).
const esEntries = out.filter((c) => c.locale === 'es' && !deadEsSlugs.has(c.slug));
const esBySlug = new Map(esEntries.map((c) => [c.slug, c]));

const topOut: TopEntry[] = [];
const topSeen = new Set<string>();
function pushTop(c: CalcEntry | undefined) {
  if (!c || topSeen.has(c.slug) || topOut.length >= TOP_N) return;
  topSeen.add(c.slug);
  const prefillQs = prefillBySlug.get(c.slug);
  topOut.push({
    slug: c.slug,
    title: c.h1 || c.title || c.slug,
    url: c.url,
    lang: c.locale,
    category: c.category,
    ...(prefillQs ? { prefill_example: `${c.url}?${prefillQs}` } : {}),
  });
}

for (const slug of [...curatedSlugs, ...CURATED_FALLBACK, ...readFeaturedSlugs()]) {
  pushTop(esBySlug.get(slug));
}

// 4) Completar hasta TOP_N con representantes por categoría (round-robin,
//    orden determinístico: categorías y slugs alfabéticos).
const byCategory = new Map<string, CalcEntry[]>();
for (const c of esEntries) {
  if (!byCategory.has(c.category)) byCategory.set(c.category, []);
  byCategory.get(c.category)!.push(c);
}
const cats = [...byCategory.keys()].sort();
for (const list of byCategory.values()) list.sort((a, b) => a.slug.localeCompare(b.slug));
const offsets = new Map<string, number>(cats.map((c) => [c, 0]));
while (topOut.length < TOP_N) {
  let pushedAny = false;
  for (const cat of cats) {
    if (topOut.length >= TOP_N) break;
    const list = byCategory.get(cat)!;
    let i = offsets.get(cat)!;
    while (i < list.length && topSeen.has(list[i].slug)) i++;
    if (i < list.length) {
      pushTop(list[i]);
      pushedAny = true;
      i++;
    }
    offsets.set(cat, i);
  }
  if (!pushedAny) break; // catálogo agotado
}

const topJson = JSON.stringify(topOut);
writeFileSync(OUT_TOP, topJson);
const withPrefill = topOut.filter((t) => t.prefill_example).length;
console.log(
  `✓ calcs-top.json: ${topOut.length} calcs (señal: ${curatedSlugs.length ? 'GSC curated' : 'fallback curado+featured'}, ${withPrefill} con prefill_example) — ${(topJson.length / 1024).toFixed(1)} KB`
);

// ---------------------------------------------------------------------------
// /openapi.json — espejo JSON de /.well-known/openapi.yaml (la convención que
// los agentes prueban primero). Conversión en prebuild = cero divergencia.
// js-yaml/yaml se importan dinámicamente: si no hay lib yaml disponible se
// skipea con warning, sin romper el prebuild.
// ---------------------------------------------------------------------------
async function generateOpenapiJson() {
  const yamlPath = join(ROOT, 'public', '.well-known', 'openapi.yaml');
  if (!existsSync(yamlPath)) return;
  let parse: ((s: string) => unknown) | null = null;
  try {
    const m: any = await import('js-yaml');
    const load = m.load ?? m.default?.load;
    if (typeof load === 'function') parse = (s) => load(s);
  } catch {
    /* js-yaml no disponible */
  }
  if (!parse) {
    try {
      const m: any = await import('yaml');
      const p = m.parse ?? m.default?.parse;
      if (typeof p === 'function') parse = (s) => p(s);
    } catch {
      /* yaml no disponible */
    }
  }
  if (!parse) {
    console.warn('⚠ openapi.json: sin lib yaml en node_modules — skip (se mantiene solo el .yaml)');
    return;
  }
  const spec = parse(readFileSync(yamlPath, 'utf8'));
  const specJson = JSON.stringify(spec, null, 0);
  writeFileSync(join(ROOT, 'public', 'openapi.json'), specJson);
  console.log(`✓ openapi.json: convertido desde .well-known/openapi.yaml — ${(specJson.length / 1024).toFixed(1)} KB`);
}

await generateOpenapiJson();
