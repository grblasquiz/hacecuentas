/**
 * auto-internal-link.ts
 *
 * Auto-internal-linking en `explanation` (y opcionalmente `intro`) de cada calc.
 *
 * Que hace:
 *   1) Lee TODAS las calcs en src/content/calcs/*.json y construye un indice
 *      de keywords -> slug a partir de h1, slug, title y seoKeywords.
 *   2) Lee glosario en src/content/glosario/*.json y agrega keywords
 *      (term, aka) -> /glosario/{slug}.
 *   3) Para cada calc, escanea explanation buscando matches de keywords.
 *   4) Reemplaza la PRIMERA ocurrencia de cada keyword con
 *      [texto](/slug-destino) o [texto](/glosario/termino).
 *   5) MAX 5 links nuevos por calc. NO toca menciones ya linkeadas.
 *      Skip self-links y matches dentro de code/headers/tables/links.
 *   6) Idempotente: correrlo 2 veces no duplica nada (se chequea contexto).
 *
 * Uso:
 *   node --experimental-strip-types scripts/auto-internal-link.ts          # apply
 *   node --experimental-strip-types scripts/auto-internal-link.ts --dry    # dry-run
 *
 * Hook: corre como `npm run autolink` (manual). NO se ataca al prebuild
 * automaticamente para mantener el build determinista; los cambios al JSON
 * van al repo y se commitean.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CALCS_DIR = join(ROOT, 'src/content/calcs');
const GLOSARIO_DIR = join(ROOT, 'src/content/glosario');

const MAX_LINKS_PER_CALC = 5;
const MIN_KEYWORD_LEN = 4;
const MIN_EXPLANATION_LEN = 200;

const DRY = process.argv.includes('--dry') || process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const SAMPLE = process.argv.includes('--sample');

type Calc = {
  slug: string;
  title?: string;
  h1?: string;
  description?: string;
  seoKeywords?: string[];
  explanation?: string;
  intro?: string;
  [k: string]: unknown;
};

type GlosarioEntry = {
  slug: string;
  term: string;
  aka?: string[];
};

type LinkRec = { keyword: string; url: string; priority: number };

// ---------------------------------------------------------------------------
// 1) Cargar fuentes
// ---------------------------------------------------------------------------

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function listJson(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

const calcFiles = listJson(CALCS_DIR);
const calcs: Calc[] = calcFiles
  .map((f) => readJson<Calc>(f))
  .filter((c): c is Calc => !!c && !!c.slug);

const glosarioFiles = listJson(GLOSARIO_DIR);
const glosario: GlosarioEntry[] = glosarioFiles
  .map((f) => readJson<GlosarioEntry>(f))
  .filter((g): g is GlosarioEntry => !!g && !!g.slug);

const validSlugs = new Set<string>(calcs.map((c) => c.slug));
const validGlosarioSlugs = new Set<string>(glosario.map((g) => g.slug));

console.log(
  `[autolink] cargadas ${calcs.length} calcs, ${glosario.length} glosario terms`
);

// ---------------------------------------------------------------------------
// 2) Construir indice de keywords -> destino
// ---------------------------------------------------------------------------
//
// Prioridad (mayor = preferido):
//   100  exact match seoKeywords     (frase muy especifica del SEO)
//    80  match h1 / title de calc
//    70  glosario term / aka
//    50  derivado del slug
//
// Una misma keyword puede tener varios destinos; nos quedamos con el de mayor
// prioridad y, en empates, el primero. Las keywords muy cortas o demasiado
// genericas se filtran.

const STOPWORDS = new Set([
  'calculadora', 'calculadoras', 'calcular', 'calculo',
  'argentina', 'mexico', 'chile', 'colombia', 'peru',
  'gratis', 'online', 'mensual', 'anual', '2026', '2027', '2025',
  'que', 'como', 'cuanto', 'cuando', 'donde',
  'para', 'sobre', 'segun', 'desde', 'hasta', 'entre',
  'precio', 'monto', 'valor', 'costo', 'total',
  'hace', 'cuentas', 'hacecuentas',
  'tabla', 'lista', 'guia', 'simulador',
  'tu', 'mi', 'su', 'el', 'la', 'los', 'las',
  'gestacion', 'embarazo', 'bebe', 'beba', 'hijo', 'hija',
  'auto', 'casa', 'hogar',
]);

const TOO_GENERIC = new Set([
  'numero', 'numeros', 'porcentaje', 'porcentajes',
  'pais', 'paises', 'ciudad', 'persona', 'personas',
  'dia', 'dias', 'mes', 'meses', 'ano', 'anos',
  'hora', 'horas', 'minuto', 'minutos',
  'peso', 'pesos', 'edad', 'altura', 'tiempo',
  'sueldo', 'gasto', 'ingreso', 'pago',
]);

function normalize(s: string): string {
  // Lowercase + strip diacriticos. NFD descompone caracteres acentuados
  // en base + diacritico (ej. "á" -> "a" + "́"); luego strippeamos
  // los marks (rango ̀-ͯ).
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function isGoodKeyword(kw: string): boolean {
  if (!kw) return false;
  const norm = normalize(kw).trim();
  if (norm.length < MIN_KEYWORD_LEN) return false;
  // Multi-word keywords are great. Single word: check stopword/generic.
  const words = norm.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  // Numeric or mostly-numeric keywords? skip
  if (/^\d+$/.test(norm)) return false;
  // Short single word that is generic -> skip
  if (words.length === 1) {
    if (STOPWORDS.has(norm) || TOO_GENERIC.has(norm)) return false;
    if (norm.length < 5) return false; // single 4-char words too risky
  }
  // If ALL words are stopwords, skip
  if (words.every((w) => STOPWORDS.has(w))) return false;
  return true;
}

// keyword (normalized) -> { keyword (display), url, priority }
const keywordIndex = new Map<string, LinkRec>();

function addKeyword(displayKw: string, url: string, priority: number) {
  const kw = displayKw.trim();
  if (!isGoodKeyword(kw)) return;
  const key = normalize(kw);
  const existing = keywordIndex.get(key);
  if (!existing || priority > existing.priority) {
    keywordIndex.set(key, { keyword: kw, url, priority });
  }
}

// 2a) calcs
for (const c of calcs) {
  const url = `/${c.slug}`;

  // seoKeywords: frases SEO ya curadas
  if (Array.isArray(c.seoKeywords)) {
    for (const k of c.seoKeywords) {
      if (typeof k === 'string') addKeyword(k, url, 100);
    }
  }

  // h1: titulo visible
  if (c.h1) {
    // h1 limpio sin "Calculadora de" / "Calculá ..."
    let h1 = c.h1
      .replace(/^calculadora\s+(de\s+)?/i, '')
      .replace(/^calcul[aá]\s+/i, '')
      .replace(/\s*[—–-]\s*Hac[eé]\s*Cuentas.*/i, '')
      .replace(/\s+(20\d{2})\s*$/, '')
      .trim();
    if (h1.length >= MIN_KEYWORD_LEN) addKeyword(h1, url, 80);
  }

  // slug: ultima parte semantica
  // calculadora-aguinaldo-sac -> "aguinaldo sac"
  const slugWords = c.slug
    .replace(/^calculadora[-_]?/, '')
    .replace(/[-_]\d{4}$/, '')
    .replace(/[-_]/g, ' ')
    .trim();
  if (slugWords.length >= MIN_KEYWORD_LEN) addKeyword(slugWords, url, 50);
}

// 2b) glosario
for (const g of glosario) {
  const url = `/glosario/${g.slug}`;

  // term: a veces incluye parentesis: "UVA (Unidad de Valor Adquisitivo)"
  // Tomamos la parte antes del parentesis como keyword corta y el contenido
  // del parentesis como keyword larga.
  if (g.term) {
    const m = g.term.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/);
    if (m) {
      addKeyword(m[1], url, 75);
      addKeyword(m[2], url, 70);
    } else {
      addKeyword(g.term, url, 75);
    }
  }
  if (Array.isArray(g.aka)) {
    for (const a of g.aka) addKeyword(a, url, 70);
  }
}

console.log(`[autolink] indice: ${keywordIndex.size} keywords unicas`);

// Ordenamos: longitud desc primero (regex alternation matchea greedy por
// posicion, no por longitud, asi que poner las largas primero garantiza
// que "indemnizacion por despido" gane a "despido"); en empates por
// prioridad desc.
const sortedKeywords: LinkRec[] = [...keywordIndex.values()].sort((a, b) => {
  const la = normalize(a.keyword).length;
  const lb = normalize(b.keyword).length;
  if (lb !== la) return lb - la;
  return b.priority - a.priority;
});

// Validar que el destino existe + dedup por URL (max 2 keywords por URL,
// la de mayor prioridad/longitud). Esto baja drasticamente el #keywords
// para que el regex consolidado sea rapido.
const MAX_KEYWORDS_PER_URL = 2;
const perUrl = new Map<string, LinkRec[]>();
for (const rec of sortedKeywords) {
  const ok = rec.url.startsWith('/glosario/')
    ? validGlosarioSlugs.has(rec.url.replace('/glosario/', ''))
    : validSlugs.has(rec.url.replace(/^\//, ''));
  if (!ok) continue;
  const arr = perUrl.get(rec.url) ?? [];
  if (arr.length < MAX_KEYWORDS_PER_URL) {
    arr.push(rec);
    perUrl.set(rec.url, arr);
  }
}

const validatedKeywords: LinkRec[] = [];
for (const arr of perUrl.values()) validatedKeywords.push(...arr);

// Re-ordenar por longitud desc.
validatedKeywords.sort((a, b) => {
  const la = normalize(a.keyword).length;
  const lb = normalize(b.keyword).length;
  if (lb !== la) return lb - la;
  return b.priority - a.priority;
});

// Mapa keyword normalizada -> LinkRec (para lookup post-match).
const normToRec = new Map<string, LinkRec>();
for (const rec of validatedKeywords) {
  const k = normalize(rec.keyword);
  if (!normToRec.has(k)) normToRec.set(k, rec);
}

console.log(`[autolink] keywords validadas (post-dedup): ${normToRec.size}`);

// Construimos UN regex consolidado por chunks. Usamos boundary ASCII
// simple `\b` que es ~10x mas rapido que los lookbehind/lookahead unicode.
// Como el texto tambien lo normalizamos (ASCII, lowercase), \b funciona
// correctamente.
const CHUNK_SIZE = 800;
const keywordChunks: { regex: RegExp }[] = [];
const allNorms = [...normToRec.keys()];
allNorms.sort((a, b) => b.length - a.length); // greedy: longest first
for (let i = 0; i < allNorms.length; i += CHUNK_SIZE) {
  const chunk = allNorms.slice(i, i + CHUNK_SIZE);
  const alternation = chunk.map(escapeRegex).join('|');
  const regex = new RegExp(`\\b(?:${alternation})\\b`, 'gi');
  keywordChunks.push({ regex });
}

console.log(
  `[autolink] regex chunks: ${keywordChunks.length} (${CHUNK_SIZE} kw/chunk)`
);

// ---------------------------------------------------------------------------
// 3) Linker
// ---------------------------------------------------------------------------
//
// Estrategia: para no romper sintaxis markdown ni linkear dentro de codigo,
// tablas markdown, headers o links existentes, identificamos rangos
// "prohibidos" en el texto y solo aceptamos matches que caen FUERA de ellos.

type Range = [number, number]; // [start, end) exclusive

function findForbiddenRanges(text: string): Range[] {
  const ranges: Range[] = [];

  // Markdown links existentes: [texto](url)
  for (const m of text.matchAll(/\[[^\]]*\]\([^)]*\)/g)) {
    ranges.push([m.index!, m.index! + m[0].length]);
  }
  // Imagenes: ![alt](src)
  for (const m of text.matchAll(/!\[[^\]]*\]\([^)]*\)/g)) {
    ranges.push([m.index!, m.index! + m[0].length]);
  }
  // Code fences ```...```
  for (const m of text.matchAll(/```[\s\S]*?```/g)) {
    ranges.push([m.index!, m.index! + m[0].length]);
  }
  // Inline code `...`
  for (const m of text.matchAll(/`[^`\n]+`/g)) {
    ranges.push([m.index!, m.index! + m[0].length]);
  }
  // HTML tags y links HTML
  for (const m of text.matchAll(/<[^>]+>/g)) {
    ranges.push([m.index!, m.index! + m[0].length]);
  }
  // Headers de tabla / separadores de tabla / lineas de tabla completas
  // Linea que arranca con | y contiene |
  const lines = text.split('\n');
  let offset = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('|') &&
      trimmed.includes('|', 1)
    ) {
      ranges.push([offset, offset + line.length]);
    }
    offset += line.length + 1;
  }
  // Headers markdown (#, ##, ###) - linea entera
  offset = 0;
  for (const line of lines) {
    if (/^\s{0,3}#{1,6}\s/.test(line)) {
      ranges.push([offset, offset + line.length]);
    }
    offset += line.length + 1;
  }
  return ranges;
}

function inForbidden(pos: number, ranges: Range[]): boolean {
  for (const [s, e] of ranges) {
    if (pos >= s && pos < e) return true;
  }
  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type Replacement = {
  start: number;
  end: number;
  replacement: string;
  keyword: string;
};

function autoLink(text: string, calcSlug: string): {
  text: string;
  added: number;
  details: { keyword: string; url: string }[];
} {
  if (!text || text.length < MIN_EXPLANATION_LEN) {
    return { text, added: 0, details: [] };
  }

  const forbidden = findForbiddenRanges(text);

  // Idempotencia: contamos los links INTERNOS ya presentes (markdown links
  // que apuntan a paths internos) hacia el cap de MAX_LINKS_PER_CALC. Asi,
  // si ya hay 5 links, no agregamos mas. Tambien registramos las URLs ya
  // usadas para no duplicar destinos.
  const preExistingUrls = new Set<string>();
  let preExistingCount = 0;
  for (const m of text.matchAll(/\[[^\]]*\]\((\/[^)]+)\)/g)) {
    preExistingCount++;
    preExistingUrls.add(m[1]);
  }
  const remainingBudget = MAX_LINKS_PER_CALC - preExistingCount;
  if (remainingBudget <= 0) return { text, added: 0, details: [] };

  const norm = normalize(text);
  // Si normalize() cambia longitudes, fallback (lento).
  if (norm.length !== text.length) {
    return autoLinkFallback(text, calcSlug, forbidden);
  }

  type Hit = { start: number; end: number; rec: LinkRec };
  const hits: Hit[] = [];

  // Recolectar TODOS los matches de TODAS las keywords (multiples chunks)
  // sobre el texto normalizado. Filtrar a vuelo los que caen en zonas
  // prohibidas para no procesarlos despues.
  for (const { regex } of keywordChunks) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(norm)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (inForbidden(start, forbidden)) continue;
      if (inForbidden(end - 1, forbidden)) continue;
      const rec = normToRec.get(m[0].toLowerCase());
      if (!rec) continue;
      if (rec.url === `/${calcSlug}`) continue;
      // Skip URLs ya linkeadas en el texto (idempotencia).
      if (preExistingUrls.has(rec.url)) continue;
      hits.push({ start, end, rec });
    }
  }

  if (hits.length === 0) return { text, added: 0, details: [] };

  // Greedy: priorizamos keywords mas largas y de mayor prioridad. Para cada
  // posicion, si ya tenemos un hit que cubre el rango, descartar el mas
  // chico/menor prioridad. Hacemos sort + filtro de overlaps.
  hits.sort((a, b) => {
    const la = a.end - a.start;
    const lb = b.end - b.start;
    if (lb !== la) return lb - la;
    if (b.rec.priority !== a.rec.priority) return b.rec.priority - a.rec.priority;
    return a.start - b.start;
  });

  // Seleccionar hits no-solapados, max 1 por URL, max MAX_LINKS_PER_CALC.
  const chosen: Hit[] = [];
  const usedRanges: Range[] = [];
  const usedUrls = new Set<string>();

  for (const h of hits) {
    if (chosen.length >= remainingBudget) break;
    if (usedUrls.has(h.rec.url)) continue;
    let overlaps = false;
    for (const [s, e] of usedRanges) {
      if (h.start < e && h.end > s) { overlaps = true; break; }
    }
    if (overlaps) continue;
    chosen.push(h);
    usedRanges.push([h.start, h.end]);
    usedUrls.add(h.rec.url);
  }

  if (chosen.length === 0) return { text, added: 0, details: [] };

  // Aplicar reemplazos de derecha a izquierda, preservando el texto
  // original (case y acentos).
  chosen.sort((a, b) => b.start - a.start);
  let out = text;
  const details: { keyword: string; url: string }[] = [];
  for (const h of chosen) {
    const original = text.slice(h.start, h.end);
    out = out.slice(0, h.start) + `[${original}](${h.rec.url})` + out.slice(h.end);
    details.unshift({ keyword: original, url: h.rec.url });
  }
  return { text: out, added: chosen.length, details };
}

// Fallback si normalize cambia longitudes (raro): usa regex unicode sobre
// texto original. Menos preciso para acentos pero seguro.
function autoLinkFallback(
  text: string,
  calcSlug: string,
  forbidden: Range[]
): { text: string; added: number; details: { keyword: string; url: string }[] } {
  const replacements: Replacement[] = [];
  const usedRanges: Range[] = [];
  const usedUrls = new Set<string>();
  const details: { keyword: string; url: string }[] = [];

  for (const rec of sortedKeywords) {
    if (replacements.length >= MAX_LINKS_PER_CALC) break;
    if (rec.url === `/${calcSlug}`) continue;
    if (usedUrls.has(rec.url)) continue;

    if (rec.url.startsWith('/glosario/')) {
      const gs = rec.url.replace('/glosario/', '');
      if (!validGlosarioSlugs.has(gs)) continue;
    } else {
      const cs = rec.url.replace(/^\//, '');
      if (!validSlugs.has(cs)) continue;
    }

    const re = new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegex(rec.keyword)}(?![\\p{L}\\p{N}])`,
      'iu'
    );
    const m = re.exec(text);
    if (!m) continue;
    const start = m.index;
    const end = start + m[0].length;
    if (inForbidden(start, forbidden) || inForbidden(end - 1, forbidden)) continue;
    let overlaps = false;
    for (const [s, e] of usedRanges) if (start < e && end > s) { overlaps = true; break; }
    if (overlaps) continue;

    const original = text.slice(start, end);
    replacements.push({ start, end, replacement: `[${original}](${rec.url})`, keyword: rec.keyword });
    usedRanges.push([start, end]);
    usedUrls.add(rec.url);
    details.push({ keyword: original, url: rec.url });
  }

  if (replacements.length === 0) return { text, added: 0, details: [] };
  replacements.sort((a, b) => b.start - a.start);
  let out = text;
  for (const r of replacements) {
    out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
  }
  return { text: out, added: replacements.length, details };
}

// ---------------------------------------------------------------------------
// 4) Run
// ---------------------------------------------------------------------------

let modifiedCount = 0;
let totalLinks = 0;
const samples: { slug: string; before: string; after: string }[] = [];

for (let i = 0; i < calcs.length; i++) {
  const c = calcs[i];
  const file = calcFiles[i];
  if (!c.explanation) continue;

  const before = c.explanation;
  const { text: after, added, details } = autoLink(before, c.slug);
  if (added === 0) continue;

  modifiedCount++;
  totalLinks += added;

  if (samples.length < 5) {
    samples.push({ slug: c.slug, before, after });
  }

  if (VERBOSE) {
    console.log(
      `  ${c.slug}: +${added} (${details.map((d) => d.keyword).join(', ')})`
    );
  }

  if (!DRY) {
    const updated = { ...c, explanation: after };
    writeFileSync(file, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
  }
}

console.log('');
console.log(`[autolink] === RESULTADOS ${DRY ? '(dry-run)' : ''} ===`);
console.log(`[autolink] calcs procesadas: ${calcs.length}`);
console.log(`[autolink] calcs modificadas: ${modifiedCount}`);
console.log(`[autolink] links agregados (total): ${totalLinks}`);
console.log(
  `[autolink] promedio links/calc-modificada: ${
    modifiedCount ? (totalLinks / modifiedCount).toFixed(2) : '0'
  }`
);

if (SAMPLE || DRY) {
  console.log('');
  console.log('[autolink] === SAMPLES (antes / despues) ===');
  for (const s of samples) {
    console.log(`\n--- ${s.slug} ---`);
    // Solo mostrar fragmento alrededor del primer link nuevo
    const idx = s.after.indexOf('](');
    const start = Math.max(0, idx - 120);
    const end = Math.min(s.after.length, idx + 120);
    console.log('ANTES:', s.before.slice(start, end).replace(/\n/g, ' '));
    console.log('DESPUES:', s.after.slice(start, end).replace(/\n/g, ' '));
  }
}
