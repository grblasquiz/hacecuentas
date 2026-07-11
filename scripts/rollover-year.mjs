#!/usr/bin/env node
/**
 * rollover-year.mjs — Inventario y rollover de años hardcodeados (2026 → 2027).
 *
 * El sitio tiene ~270 slugs, ~37 páginas .astro y ~1.060 fórmulas .ts con "2026"
 * hardcodeado. Este script escanea el repo, clasifica cada hardcode y (opcionalmente)
 * aplica los bumps mecánicamente seguros.
 *
 * CLASES:
 *   A      — auto-bumpeable: constantes de año calendario (ANIO_ACTUAL, edad,
 *            proyecciones año+n) donde 2026→2027 es mecánicamente correcto.
 *   B      — archivo cuyo NOMBRE contiene el año (calc JSON, fórmula .ts, página
 *            .astro). Se reporta la estrategia SEO recomendada por patrón.
 *            NO se migra automáticamente.
 *   C      — datos fiscales / dependencias de data anual (src/lib/data/*-2026.ts,
 *            imports de data, identificadores tipo UVT_2026, años junto a montos).
 *            Rollover manual / pipeline update-data.
 *   FECHA  — fechas puntuales en código (new Date(2026, m, d), '2026-06-16').
 *            Bumpearlas depende del calendario (una fecha objetivo no pasada NO se
 *            adelanta) → revisión manual.
 *   TEXTO  — prosa, comentarios, FAQ, títulos, keywords → revisión editorial.
 *   REVIEW — código con el año que no matchea ningún patrón conocido (tablas por
 *            año, keys de objetos, etc.) → revisión manual.
 *   (ignorados: URLs/citas de fuentes, fechas de dato tipo lastReviewed /
 *    dataUpdate / DATA_AS_OF / sources[].date, node_modules/dist/.astro,
 *    archivos generados y snapshots de data viva)
 *
 * USO:
 *   node scripts/rollover-year.mjs                  # dry-run → reports/rollover-2027-dryrun.md
 *   node scripts/rollover-year.mjs --dry            # ídem
 *   node scripts/rollover-year.mjs --target-year=2027
 *   node scripts/rollover-year.mjs --apply --class=A   # aplica SOLO clase A (imprime diff + backup)
 *   node scripts/rollover-year.mjs --out=reports/otro.md
 *
 * Sin dependencias externas. Node >= 18.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const getFlag = (name) => argv.includes(`--${name}`);
const getOpt = (name, def) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};

const TARGET_YEAR = parseInt(getOpt('target-year', '2027'), 10);
const FROM_YEAR = parseInt(getOpt('from-year', String(TARGET_YEAR - 1)), 10);
const APPLY = getFlag('apply');
const APPLY_CLASS = getOpt('class', null);
const ROOT = path.resolve(getOpt('root', path.join(path.dirname(fileURLToPath(import.meta.url)), '..')));
const OUT = path.resolve(ROOT, getOpt('out', `reports/rollover-${TARGET_YEAR}-dryrun.md`));

if (!Number.isInteger(TARGET_YEAR) || !Number.isInteger(FROM_YEAR)) {
  console.error('target-year / from-year inválidos');
  process.exit(1);
}
if (APPLY && APPLY_CLASS !== 'A') {
  console.error('--apply requiere --class=A (única clase auto-aplicable). Abortando.');
  process.exit(1);
}

const Y = String(FROM_YEAR); // ej "2026"
const TY = String(TARGET_YEAR); // ej "2027"

// ---------------------------------------------------------------------------
// Configuración de escaneo
// ---------------------------------------------------------------------------
const SCAN_ROOTS = ['src/content', 'src/pages', 'src/lib', 'src/components', 'src/layouts', 'src/data'];

const IGNORE_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', '.wrangler', 'coverage']);
// Data viva / archivos generados: se ignoran (los regeneran pipelines).
const IGNORE_FILES = [
  'src/data/live', // snapshots auto-actualizados por cron
  'src/lib/calc-compute-index.json', // generado desde fórmulas
  'src/lib/formula-strings-i18n-pt.json', // generado
  'src/lib/bcra-indices.json', // snapshot de data
  'src/lib/converter-tables.json', // snapshot de data
  'src/lib/hreflang-index.json', // scripts/generate-hreflang-index.ts
];
// Prefijos de archivos generados (todas las variantes por locale)
const IGNORE_PREFIXES = [
  'src/lib/related-auto', // npm run related (related-auto.json + related-auto-<locale>.json)
];
// Marca de archivo autogenerado en el header → se saltea
const GENERATED_HEADER_RE = /AUTOGENERADO|AUTO-?GENERATED|DO NOT EDIT|NO editar a mano/i;

// Claves JSON cuyos valores son "fecha del dato" o citas → ignorar (anti-falso-positivo)
const JSON_IGNORE_KEYS = new Set(['lastReviewed', 'dataUpdate', 'sources', 'source', 'lastUpdated', 'updatedAt', 'publishDate', 'date', 'reviewedBy']);

// Señales fiscales: si el año convive con esto en la misma línea, NO es clase A.
const FISCAL_RE = /al[ií]cuota|aliquota|\btope\b|topes\b|monto|tarifa|tramo|escala|deducc|dedu[çc][aã]o|impon|imponible|\buvt\b|\buit\b|\bufv\b|smlmv|smmlv|smvm|\bisr\b|irrf|inss|\biva\b|reten[cç]|impuesto|imposto|\btax\b|fiscal|tribut|monotribut|ganancias|aguinaldo|salario|sueldo|jubilaci|pension|haber|\bbpc\b|\butm\b|\buta\b|\bafp\b|\bipc\b|categor[ií]a\s+[a-k]\b|resoluci[oó]n|\bley\b|decreto/i;

// Nombre de variable "de año calendario" → candidata a clase A
const YEARISH_NAME_RE = /an[ioõ]|añ[oa]|year|hoy|today|actual|curr|base|target|futuro|antig|edad|idade|\bage/i;
// Nombre que indica año fiscal / de data → clase C aunque parezca año
const YEARNAME_DEMOTE_RE = /fiscal|tribut|data|ref|vigenc|tabla|escala/i;

// Patrones evento (no se rolloverean: son del evento puntual)
const EVENT_RE = /mundial|copa|fixture|goleadores|posiciones|llave|donde-ver|cuando-juega|quando-joga|partidos-hoy|eleccion|censo/i;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

function* walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (IGNORE_FILES.some((ig) => rel(full) === ig || rel(full).startsWith(ig + '/'))) continue;
      yield* walk(full);
    } else if (e.isFile()) {
      const full = path.join(dir, e.name);
      const r = rel(full);
      if (IGNORE_FILES.some((ig) => r === ig)) continue;
      if (IGNORE_PREFIXES.some((ig) => r.startsWith(ig))) { ignored.archivosGenerados++; continue; }
      yield full;
    }
  }
}

const isDigit = (c) => c >= '0' && c <= '9';

/** Índices de ocurrencias del año como número de 4 dígitos aislado (no parte de un número más largo). */
function yearOccurrences(text) {
  const out = [];
  let i = text.indexOf(Y);
  while (i !== -1) {
    const before = text[i - 1];
    const after = text[i + Y.length];
    if (!(before && isDigit(before)) && !(after && isDigit(after))) out.push(i);
    i = text.indexOf(Y, i + 1);
  }
  return out;
}

/**
 * Escáner de contextos para TS/JS/frontmatter: devuelve para cada índice del
 * archivo si está en 'code' | 'string' | 'template' | 'comment'.
 * Tokenizador aproximado con soporte de // , /* * / , '', "", `` y ${ } anidado.
 */
function buildContextMap(src) {
  const ctx = new Array(src.length);
  let state = 'code'; // code | line | block | s1 | s2 | tpl
  const tplStack = []; // profundidad de ${} dentro de templates
  let braceDepth = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    switch (state) {
      case 'code':
        if (c === '/' && n === '/') { state = 'line'; ctx[i] = 'comment'; break; }
        if (c === '/' && n === '*') { state = 'block'; ctx[i] = 'comment'; break; }
        if (c === "'") { state = 's1'; ctx[i] = 'string'; break; }
        if (c === '"') { state = 's2'; ctx[i] = 'string'; break; }
        if (c === '`') { state = 'tpl'; ctx[i] = 'string'; break; }
        if (c === '{') braceDepth++;
        if (c === '}') {
          if (braceDepth === 0 && tplStack.length) { tplStack.pop(); state = 'tpl'; ctx[i] = 'string'; break; }
          braceDepth = Math.max(0, braceDepth - 1);
        }
        ctx[i] = 'code';
        break;
      case 'line':
        ctx[i] = 'comment';
        if (c === '\n') state = 'code';
        break;
      case 'block':
        ctx[i] = 'comment';
        if (c === '*' && n === '/') { ctx[i + 1] = 'comment'; i++; state = 'code'; }
        break;
      case 's1':
        ctx[i] = 'string';
        if (c === '\\') { ctx[i + 1] = 'string'; i++; break; }
        if (c === "'" || c === '\n') state = 'code';
        break;
      case 's2':
        ctx[i] = 'string';
        if (c === '\\') { ctx[i + 1] = 'string'; i++; break; }
        if (c === '"' || c === '\n') state = 'code';
        break;
      case 'tpl':
        ctx[i] = 'string';
        if (c === '\\') { ctx[i + 1] = 'string'; i++; break; }
        if (c === '$' && n === '{') { ctx[i + 1] = 'string'; i++; tplStack.push(braceDepth); braceDepth = 0; state = 'code'; break; }
        if (c === '`') state = 'code';
        break;
    }
  }
  return ctx;
}

function lineAt(src, idx) {
  const start = src.lastIndexOf('\n', idx - 1) + 1;
  let end = src.indexOf('\n', idx);
  if (end === -1) end = src.length;
  return { text: src.slice(start, end), start, end, num: src.slice(0, start).split('\n').length };
}

const trunc = (s, n = 110) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const mdCode = (s) => '`' + trunc(s.trim()).replace(/`/g, '’').replace(/\|/g, '¦') + '`';

// ---------------------------------------------------------------------------
// Acumuladores
// ---------------------------------------------------------------------------
const findings = { A: [], B: [], C: [], FECHA: [], TEXTO: [], REVIEW: [] };
const ignored = { urls: 0, fechasDato: 0, archivosGenerados: 0 };
const add = (cls, f) => findings[cls].push(f);

// ---------------------------------------------------------------------------
// Clase B — archivos con el año en el nombre
// ---------------------------------------------------------------------------
function recommendB(relPath) {
  const base = path.basename(relPath);
  const inFormulas = relPath.startsWith('src/lib/formulas/');
  const inBlog = /^src\/content\/blog(-pt)?\//.test(relPath);
  const inHistorias = relPath.startsWith('src/content/historias/');

  if (EVENT_RE.test(base)) {
    return { tipo: 'evento', rec: `NO rollover: es contenido del evento (Mundial ${Y}, etc.). Post-evento evaluar 301 al hub temático o dejar como histórico.` };
  }
  if (/(^|\/)(datos|dados)-/.test(relPath) || /vencimientos/.test(base)) {
    return { tipo: 'dato-oficial', rec: `Esperar publicación oficial del dato ${TY} (pipeline update-data). Recién ahí crear la versión ${TY} + 301 de la ${Y}.` };
  }
  if (/feriados|vacaciones-invierno|calendario/.test(base)) {
    return { tipo: 'calendario-anual', rec: `Crear versión ${TY} cuando el país publique el calendario oficial (2° semestre ${Y}). Mantener la ${Y} hasta fin de año, después 301 → ${TY}.` };
  }
  if (inBlog || inHistorias) {
    return { tipo: 'contenido-fechado', rec: `Editorial fechado: NO rollover automático. Opcional escribir pieza ${TY} nueva y cross-linkear.` };
  }
  if (/navidad|ano-nuevo|año-nuevo|reyes|cuanto-falta|quanto-falta/i.test(base)) {
    return { tipo: 'countdown-anual', rec: `Crear slug ${TY} apenas pase la fecha + 301 del ${Y} → ${TY}. Evaluar migrar a slug evergreen sin año (con los años como alias 301).` };
  }
  if (/junio|julio|agosto|septiembre|marzo|febrero|enero|recategorizacion|aumento-jubilaciones/.test(base)) {
    return { tipo: 'evento-de-temporada', rec: `Página de ventana temporal: crear equivalente ${TY} en su temporada + 301 de la ${Y}.` };
  }
  if (inFormulas) {
    return { tipo: 'formula-de-calc-con-año', rec: `Migra JUNTO con el calc JSON del mismo slug: crear <slug>-${TY}.ts, actualizar src/lib/formulas/index.ts, 301 del calc viejo.` };
  }
  return {
    tipo: 'calc-fiscal-anual',
    rec: `Crear slug-${TY} nuevo cuando salgan los valores ${TY} + 301 viejo→nuevo vía src/lib/pruning-redirects.ts (NO public/_redirects: límite 2000 de CF, hoy ~1.830 reglas). Después: npm run related + build.`,
  };
}

// ---------------------------------------------------------------------------
// Clasificación línea a línea (TS / frontmatter astro)
// ---------------------------------------------------------------------------
const A_ASSIGN_RE = new RegExp(`(?:const|let|var)\\s+([\\w$À-ÿ]+)\\s*=\\s*${Y}\\b`);
const LOCAL_YEAR_DECL_RE = new RegExp(`(?:const|let|var)\\s+[\\w$]*${Y}[\\w$]*\\s*=`);
const bigMoneyRe = /\b\d{5,}\b|\d{1,3}(?:\.\d{3}){2,}/; // 10000+ o 1.234.567

function classifyTsOccurrence(file, src, ctxMap, idx) {
  const { text: line, start: lineStart, num } = lineAt(src, idx);
  const col = idx - lineStart;
  const bumpHere = line.slice(0, col) + TY + line.slice(col + Y.length); // solo ESTA ocurrencia
  const ctx = ctxMap[idx] || 'code';
  const relFile = rel(file);
  const entry = { file: relFile, line: num, code: line, idx, col };

  // --- comentario ---
  if (ctx === 'comment') {
    if (/https?:\/\//.test(line)) { ignored.urls++; return; }
    add('TEXTO', { ...entry, sub: 'comentario' });
    return;
  }

  // --- string ---
  if (ctx === 'string') {
    // import/export ... from '.../xxx-2026' → dependencia de archivo con año
    if (/^\s*(import|export)\b.*\bfrom\s*['"]/.test(line) || /\brequire\s*\(/.test(line)) {
      add('C', { ...entry, sub: /\/data\//.test(line) ? 'import-data-anual' : 'import-de-módulo-con-año (migra con clase B)' });
      return;
    }
    // URL → ignorar (cita/fuente)
    const strBefore = line.slice(0, col);
    if (/https?:\/\/[^\s'"`]*$/.test(strBefore) || /https?:\/\//.test(line)) { ignored.urls++; return; }
    // fecha ISO 2026-MM(-DD) o MM-2026
    const around = src.slice(Math.max(0, idx - 8), idx + 12);
    if (new RegExp(`${Y}-\\d{2}`).test(around) || new RegExp(`\\d{2}[-/]${Y}`).test(around)) {
      if (/lastreviewed|data_as_of|as_of|lastupdated|actualizad|fecha.*(dato|data)|snapshot/i.test(line)) { ignored.fechasDato++; return; }
      add('FECHA', { ...entry, sub: 'fecha-iso-en-string' });
      return;
    }
    // referencia a slug con año ('-2026' dentro de un path/slug)
    if (src[idx - 1] === '-' || /['"`/]([\w-]*-)?$/.test(strBefore) && line.includes(`-${Y}`)) {
      add('TEXTO', { ...entry, sub: 'referencia-slug-con-año' });
      return;
    }
    add('TEXTO', { ...entry, sub: 'prosa-string' });
    return;
  }

  // --- código ---
  const before2 = src.slice(Math.max(0, idx - 24), idx);
  const charBefore = src[idx - 1];

  // new Date(2026, ...) / Date.UTC(2026 ...
  if (/(?:new\s+Date|Date\.UTC)\s*\($/.test(before2.trimEnd()) || /(?:new\s+Date|Date\.UTC)\s*\([^)]*$/.test(before2)) {
    add('FECHA', { ...entry, sub: 'new-Date' });
    return;
  }
  // identificador que contiene el año: UVT_2026, calcIrrf2026, MEXICO_2026
  if ((charBefore && /[A-Za-z_$]/.test(charBefore)) || /[A-Za-z_$]/.test(src[idx + Y.length] || '')) {
    add('C', { ...entry, sub: 'identificador-con-año' });
    return;
  }

  // candidata A: asignación const/let/var NOMBRE = 2026
  const assign = line.match(A_ASSIGN_RE);
  const lineNoYear = line.replaceAll(Y, '');
  const demoteA = (name) => {
    if (name && FISCAL_RE.test(name)) return `nombre-fiscal (${name})`;
    if (FISCAL_RE.test(lineNoYear)) return 'contexto-fiscal-en-línea';
    if (bigMoneyRe.test(lineNoYear)) return 'monto-en-línea';
    return null;
  };
  // Acoplamiento: si el archivo declara localmente un dataset con el año en el
  // nombre (ej: const FERIADOS_2026 = [...]), bumpear solo la constante de año
  // desalinearía la data → los candidatos A de ese archivo van a REVIEW.
  const addA = (sub, extra = {}) => {
    if (LOCAL_YEAR_DECL_RE.test(src)) {
      add('REVIEW', { ...entry, sub: `candidato-A-acoplado-a-dataset-${Y}-local (${sub})` });
    } else {
      add('A', { ...entry, sub, proposed: bumpHere, ...extra });
    }
  };
  if (assign) {
    const name = assign[1];
    if (YEARNAME_DEMOTE_RE.test(name)) { add('C', { ...entry, sub: `año-de-${/fiscal|tribut/i.test(name) ? 'ejercicio-fiscal' : 'referencia-de-data'} (${name})` }); return; }
    if (YEARISH_NAME_RE.test(name)) {
      const demote = demoteA(name);
      if (demote) { add('C', { ...entry, sub: `${demote}` }); return; }
      addA(`const-año (${name})`);
      return;
    }
    add('REVIEW', { ...entry, sub: `asignación-nombre-no-año (${name})` });
    return;
  }

  // candidata A: fallback de año actual — `?? 2026` / `|| 2026` en asignación con nombre de año
  if (/(\|\||\?\?)\s*$/.test(src.slice(Math.max(0, idx - 6), idx))) {
    const asgn = line.match(/(?:const|let|var)\s+([\w$À-ÿ]+)\s*=/);
    const name = asgn?.[1];
    if (name && YEARISH_NAME_RE.test(name) && !YEARNAME_DEMOTE_RE.test(name)) {
      const demote = demoteA(name);
      if (demote) { add('C', { ...entry, sub: demote }); return; }
      addA(`fallback-año-actual (${name})`);
      return;
    }
    add('REVIEW', { ...entry, sub: `fallback-nombre-no-año (${name ?? '¿?'})` });
    return;
  }

  // candidata A: aritmética/comparación de edad o proyección — 2026 - x | x - 2026 | 2026 + x | <op> 2026
  const arith =
    new RegExp(`${Y}\\s*[-−+]\\s*[\\w($]`).test(line) ||
    new RegExp(`[\\w)\\]]\\s*[-−]\\s*${Y}\\b`).test(line) ||
    new RegExp(`[<>]=?\\s*${Y}\\b`).test(line) ||
    new RegExp(`\\b${Y}\\s*[<>]=?`).test(line);
  if (arith) {
    const demote = demoteA(null);
    if (demote) { add('C', { ...entry, sub: `aritmética-con-${demote}` }); return; }
    addA('aritmética-de-año (edad/proyección)');
    return;
  }

  // key de objeto / tabla por año: 2026: {...}
  if (new RegExp(`\\b${Y}\\s*:`).test(line)) {
    if (FISCAL_RE.test(lineNoYear) || bigMoneyRe.test(lineNoYear)) { add('C', { ...entry, sub: 'tabla-por-año-fiscal' }); return; }
    add('REVIEW', { ...entry, sub: 'key-de-tabla-por-año' });
    return;
  }
  // resto: si huele a fiscal/monto → C, si no → REVIEW
  if (FISCAL_RE.test(lineNoYear) || bigMoneyRe.test(lineNoYear)) {
    add('C', { ...entry, sub: 'código-fiscal-sin-clasificar' });
    return;
  }
  add('REVIEW', { ...entry, sub: 'código-sin-clasificar' });
}

// ---------------------------------------------------------------------------
// .astro: frontmatter como TS, template como prosa
// ---------------------------------------------------------------------------
function scanAstro(file, src) {
  const fmMatch = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fmStart = fmMatch ? fmMatch.index + fmMatch[0].indexOf('\n') + 1 : -1;
  const fmEnd = fmMatch ? fmMatch.index + fmMatch[0].length - 3 : -1;
  const ctxMap = fmMatch ? buildContextMap(src) : null; // aproximación: el template no rompe el escáner en la práctica

  for (const idx of yearOccurrences(src)) {
    const inFm = fmMatch && idx >= fmStart && idx < fmEnd;
    if (inFm) {
      classifyTsOccurrence(file, src, ctxMap, idx);
      continue;
    }
    const { text: line, num } = lineAt(src, idx);
    const entry = { file: rel(file), line: num, code: line, idx };
    if (/https?:\/\//.test(line)) { ignored.urls++; continue; }
    if (/^\s*(\/\/|\/?\*|<!--)/.test(line)) { add('TEXTO', { ...entry, sub: 'comentario' }); continue; }
    if (new RegExp(`${Y}-\\d{2}`).test(src.slice(idx, idx + 8))) { add('FECHA', { ...entry, sub: 'fecha-iso-en-template' }); continue; }
    if (src[idx - 1] === '-') { add('TEXTO', { ...entry, sub: 'referencia-slug-con-año' }); continue; }
    add('TEXTO', { ...entry, sub: 'prosa-astro-template' });
  }
}

// ---------------------------------------------------------------------------
// JSON de contenido: prosa/FAQ → TEXTO; slug con año → B
// ---------------------------------------------------------------------------
function scanJson(file, src) {
  let data;
  try {
    data = JSON.parse(src);
  } catch {
    add('REVIEW', { file: rel(file), line: 0, code: '(JSON inválido)', sub: 'json-no-parseable' });
    return;
  }
  const relFile = rel(file);
  let textoCount = 0;
  const isoDateRe = new RegExp(`^\\d{4}-\\d{2}(-\\d{2})?`);

  // slug/canonicalSlug con año en archivo SIN año en el nombre → es clase B encubierta
  for (const key of ['slug', 'canonicalSlug', 'formulaId']) {
    const v = data?.[key];
    if (typeof v === 'string' && v.includes(Y)) {
      // clasificar por el SLUG (que es lo que Google ve), no por el filename
      const pseudoPath = path.posix.join(path.posix.dirname(relFile), v + '.json');
      add('B', { file: relFile, line: 0, code: `${key}: "${v}"`, ...recommendB(pseudoPath), nota: `${key} contiene ${Y} aunque el filename no` });
      break; // una sola entrada B por archivo
    }
  }

  (function visit(node, keyPath) {
    if (node && typeof node === 'object') {
      if (Array.isArray(node)) { node.forEach((v, i) => visit(v, `${keyPath}[${i}]`)); return; }
      for (const [k, v] of Object.entries(node)) {
        if (JSON_IGNORE_KEYS.has(k)) { ignored.fechasDato += countYearInside(v); continue; }
        visit(v, keyPath ? `${keyPath}.${k}` : k);
      }
      return;
    }
    if (typeof node !== 'string' || !node.includes(Y)) return;
    if (/https?:\/\//.test(node)) { ignored.urls++; return; }
    if (isoDateRe.test(node) && node.length <= 24) { ignored.fechasDato++; return; }
    textoCount += yearOccurrences(node).length;
  })(data, '');

  if (textoCount > 0) add('TEXTO', { file: relFile, line: 0, code: '', sub: 'json-prosa', count: textoCount });
}

function countYearInside(v) {
  try {
    return yearOccurrences(JSON.stringify(v)).length;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Escaneo principal
// ---------------------------------------------------------------------------
for (const scanRoot of SCAN_ROOTS) {
  const abs = path.join(ROOT, scanRoot);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const relFile = rel(file);
    const base = path.basename(file);
    const ext = path.extname(file);
    if (!['.ts', '.mts', '.js', '.mjs', '.astro', '.json'].includes(ext)) continue;

    const nameHasYear = base.includes(Y);
    const isDataDir = relFile.startsWith('src/lib/data/') || relFile.startsWith('src/data/');

    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    if (GENERATED_HEADER_RE.test(src.slice(0, 300))) { ignored.archivosGenerados++; continue; }
    const occ = yearOccurrences(src);

    // C: todo src/lib/data y src/data → data anual (inventario, sin línea a línea)
    if (isDataDir) {
      if (nameHasYear || occ.length > 0) {
        add('C', { file: relFile, line: 0, code: '', sub: nameHasYear ? 'archivo-de-data-anual' : 'data-con-año-en-contenido', count: occ.length, nombreConAño: nameHasYear });
      }
      continue;
    }

    // B: el nombre contiene el año → estrategia SEO, sin clasificar contenido
    if (nameHasYear) {
      add('B', { file: relFile, line: 0, code: '', ...recommendB(relFile), count: occ.length });
      continue;
    }

    if (occ.length === 0) continue;

    if (ext === '.json') { scanJson(file, src); continue; }
    if (ext === '.astro') { scanAstro(file, src); continue; }

    const ctxMap = buildContextMap(src);
    for (const idx of occ) classifyTsOccurrence(file, src, ctxMap, idx);
  }
}

// ---------------------------------------------------------------------------
// APPLY (solo clase A)
// ---------------------------------------------------------------------------
if (APPLY) {
  const byFile = new Map();
  for (const f of findings.A) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  if (byFile.size === 0) {
    console.log('Clase A vacía: nada que aplicar.');
    process.exit(0);
  }
  const backupDir = fs.mkdtempSync(path.join(os.tmpdir(), `rollover-backup-${FROM_YEAR}-`));
  console.log(`\n=== APPLY clase A: ${findings.A.length} ocurrencias en ${byFile.size} archivos ===`);
  console.log(`Backup de originales en: ${backupDir}\n`);
  for (const [relFile, items] of byFile) {
    const abs = path.join(ROOT, relFile);
    const src = fs.readFileSync(abs, 'utf8');
    // backup
    const bak = path.join(backupDir, relFile.replaceAll('/', '__'));
    fs.writeFileSync(bak, src);
    // reemplazos por índice, de atrás hacia adelante
    let out = src;
    const sorted = [...items].sort((a, b) => b.idx - a.idx);
    for (const it of sorted) out = out.slice(0, it.idx) + TY + out.slice(it.idx + Y.length);
    // diff por línea (aplica TODAS las ocurrencias clase A de esa línea, y solo esas)
    console.log(`--- ${relFile}`);
    const byLine = new Map();
    for (const it of items) {
      if (!byLine.has(it.line)) byLine.set(it.line, []);
      byLine.get(it.line).push(it);
    }
    for (const [lineNum, lineItems] of [...byLine.entries()].sort((a, b) => a[0] - b[0])) {
      let newLine = lineItems[0].code;
      for (const it of lineItems.sort((a, b) => b.col - a.col)) {
        newLine = newLine.slice(0, it.col) + TY + newLine.slice(it.col + Y.length);
      }
      console.log(`  @@ L${lineNum}`);
      console.log(`  - ${lineItems[0].code.trim()}`);
      console.log(`  + ${newLine.trim()}`);
    }
    fs.writeFileSync(abs, out);
  }
  console.log(`\nListo. ${byFile.size} archivos modificados (${FROM_YEAR} → ${TARGET_YEAR}).`);
  console.log('Recordá (CLAUDE.md §2): si la fórmula cambia, bumpear lastReviewed en el JSON del calc para mover el sitemap.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Reporte dry-run
// ---------------------------------------------------------------------------
const md = [];
const push = (s = '') => md.push(s);

const byFileCount = (arr) => new Set(arr.map((f) => f.file)).size;

push(`# Rollover ${FROM_YEAR} → ${TARGET_YEAR} — Dry run`);
push();
push(`Generado: ${new Date().toISOString().slice(0, 10)} · \`node scripts/rollover-year.mjs --dry --target-year=${TARGET_YEAR}\``);
push();
push(`> Snapshot del árbol de trabajo al momento de correr el script. Si hay sesiones/crons tocando el repo en paralelo, los conteos pueden variar ±unos pocos entre corridas: re-generar antes de ejecutar la migración.`);
push();
push(`## Resumen`);
push();
push(`| Clase | Qué es | Ocurrencias | Archivos | Acción |`);
push(`|---|---|---:|---:|---|`);
push(`| **A** | Constantes de año calendario auto-bumpeables | ${findings.A.length} | ${byFileCount(findings.A)} | \`--apply --class=A\` (mecánico) |`);
push(`| **B** | Archivos con ${FROM_YEAR} en el nombre (slugs/páginas/fórmulas) | ${findings.B.length} | ${byFileCount(findings.B)} | Migración SEO por patrón (ver tabla) |`);
push(`| **C** | Datos fiscales / data anual / dependencias | ${findings.C.length} | ${byFileCount(findings.C)} | Manual + pipeline update-data al publicarse valores ${TARGET_YEAR} |`);
push(`| **FECHA** | Fechas puntuales en código (\`new Date(${FROM_YEAR},…)\`, ISO) | ${findings.FECHA.length} | ${byFileCount(findings.FECHA)} | Revisión por calendario (no adelantar fechas no pasadas) |`);
push(`| **TEXTO** | Prosa/FAQ/títulos/comentarios con el año | ${findings.TEXTO.reduce((s, f) => s + (f.count ?? 1), 0)} | ${byFileCount(findings.TEXTO)} | Revisión editorial |`);
push(`| **REVIEW** | Código con año sin patrón conocido | ${findings.REVIEW.length} | ${byFileCount(findings.REVIEW)} | Revisión manual |`);
push();
push(`Ignorados por heurísticas anti-falso-positivo: **${ignored.urls}** años en URLs/citas de fuentes · **${ignored.fechasDato}** fechas de dato (lastReviewed/dataUpdate/sources/DATA_AS_OF) · **${ignored.archivosGenerados}** archivos generados/data viva excluidos (related-auto*, hreflang-index, headers AUTOGENERADO, src/data/live).`);
push();

// ---- CLASE A ----
push(`## CLASE A — auto-bumpeables (${findings.A.length} ocurrencias, ${byFileCount(findings.A)} archivos)`);
push();
push(`Constantes de año calendario: bump ${FROM_YEAR}→${TARGET_YEAR} mecánicamente correcto. Aplicar con \`node scripts/rollover-year.mjs --apply --class=A\` (imprime diff y deja backup en tmp). **Después del apply: bumpear \`lastReviewed\` en el JSON de cada calc afectado** (CLAUDE.md §2: si tocás la fórmula, tocá el calc).`);
push();
{
  const byFile = new Map();
  for (const f of findings.A) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  const coCount = (file) =>
    ['C', 'REVIEW', 'FECHA', 'TEXTO']
      .map((cls) => [cls, findings[cls].filter((f) => f.file === file).length])
      .filter(([, n]) => n > 0);
  for (const [file, items] of [...byFile.entries()].sort()) {
    push(`### ${file}`);
    push();
    const co = coCount(file);
    if (co.length) push(`> ⚠ mismo archivo tiene además: ${co.map(([c, n]) => `${n} ${c}`).join(', ')} — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan ${FROM_YEAR}).`);
    for (const it of items.sort((a, b) => a.line - b.line)) {
      push(`- L${it.line} · ${it.sub}`);
      push(`  - \`- ${trunc(it.code.trim())}\``);
      push(`  - \`+ ${trunc(it.proposed.trim())}\``);
    }
    push();
  }
}

// ---- CLASE B ----
{
  const groups = new Map();
  for (const f of findings.B) {
    if (!groups.has(f.tipo)) groups.set(f.tipo, []);
    groups.get(f.tipo).push(f);
  }
  push(`## CLASE B — archivos con ${FROM_YEAR} en el nombre (${findings.B.length})`);
  push();
  push(`Inventario con estrategia SEO recomendada. NO se migra automáticamente. Regla de oro (CLAUDE.md §1): nunca borrar un slug sin 301.`);
  push();
  for (const [tipo, items] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
    push(`### ${tipo} (${items.length})`);
    push();
    push(`> ${items[0].rec}`);
    push();
    for (const it of items.sort((a, b) => a.file.localeCompare(b.file))) {
      push(`- \`${it.file}\`${it.nota ? ` — ${it.nota}` : ''}${it.count ? ` (${it.count} × ${FROM_YEAR} adentro)` : ''}`);
    }
    push();
  }
}

// ---- CLASE C ----
{
  push(`## CLASE C — datos fiscales / data anual (${findings.C.length} ítems, ${byFileCount(findings.C)} archivos)`);
  push();
  push(`Dependen de publicación oficial (topes, alícuotas, escalas ${TARGET_YEAR}). Rollover manual o vía pipeline update-data; NO bumpear el año sin actualizar los valores.`);
  push();
  const dataFiles = findings.C.filter((f) => f.sub === 'archivo-de-data-anual' || f.sub === 'data-con-año-en-contenido');
  push(`### Archivos de data anual (${dataFiles.length})`);
  push();
  for (const f of dataFiles.sort((a, b) => a.file.localeCompare(b.file))) push(`- \`${f.file}\` (${f.count} × ${FROM_YEAR})`);
  push();
  const rest = findings.C.filter((f) => !dataFiles.includes(f));
  const byFile = new Map();
  for (const f of rest) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  push(`### Ocurrencias fiscales en fórmulas (${rest.length} en ${byFile.size} archivos)`);
  push();
  push(`| Archivo | Ocurr. | Subtipos |`);
  push(`|---|---:|---|`);
  for (const [file, items] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const subs = [...new Set(items.map((i) => i.sub.replace(/\s*\(.*\)$/, '')))].join(', ');
    push(`| \`${file}\` | ${items.length} | ${subs} |`);
  }
  push();
}

// ---- FECHA ----
{
  push(`## FECHA — fechas puntuales en código (${findings.FECHA.length})`);
  push();
  push(`Countdown/objetivos con fecha completa. NO auto-bumpear: adelantar una fecha que todavía no pasó rompe el cálculo (ej: Navidad ${FROM_YEAR} bumpeada en noviembre daría ~390 días). Revisar cada una DESPUÉS de que pase la fecha, o reescribir la fórmula para derivar el año de \`new Date().getFullYear()\`.`);
  push();
  push(`| Archivo | Línea | Código |`);
  push(`|---|---:|---|`);
  for (const f of findings.FECHA.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    push(`| \`${f.file}\` | ${f.line} | ${mdCode(f.code)} |`);
  }
  push();
}

// ---- TEXTO ----
{
  const withCount = findings.TEXTO.map((f) => ({ ...f, count: f.count ?? 1 }));
  const byFile = new Map();
  for (const f of withCount) {
    const cur = byFile.get(f.file) || { count: 0, subs: new Set() };
    cur.count += f.count;
    cur.subs.add(f.sub);
    byFile.set(f.file, cur);
  }
  const total = withCount.reduce((s, f) => s + f.count, 0);
  const byDir = new Map();
  for (const [file, info] of byFile) {
    const dir = file.split('/').slice(0, 3).join('/');
    byDir.set(dir, (byDir.get(dir) || 0) + info.count);
  }
  push(`## TEXTO — revisar editorialmente (${total} ocurrencias en ${byFile.size} archivos)`);
  push();
  push(`Años en prosa, FAQ, títulos, keywords, comentarios y referencias a slugs. La mayoría se resuelve al migrar el calc B correspondiente o al refrescar contenido ${TARGET_YEAR}. Agregado por directorio + top 60 archivos:`);
  push();
  push(`| Directorio | Ocurrencias |`);
  push(`|---|---:|`);
  for (const [dir, c] of [...byDir.entries()].sort((a, b) => b[1] - a[1])) push(`| \`${dir}\` | ${c} |`);
  push();
  push(`### Top 60 archivos por ocurrencias`);
  push();
  push(`| Archivo | Ocurr. | Subtipos |`);
  push(`|---|---:|---|`);
  for (const [file, info] of [...byFile.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 60)) {
    push(`| \`${file}\` | ${info.count} | ${[...info.subs].join(', ')} |`);
  }
  push();
}

// ---- REVIEW ----
{
  push(`## REVIEW — código sin clasificar (${findings.REVIEW.length})`);
  push();
  push(`El año aparece en código pero no matchea ningún patrón seguro (tablas por año, arrays, asignaciones con nombre ambiguo). Revisar a mano.`);
  push();
  push(`| Archivo | Línea | Subtipo | Código |`);
  push(`|---|---:|---|---|`);
  for (const f of findings.REVIEW.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    push(`| \`${f.file}\` | ${f.line} | ${f.sub} | ${mdCode(f.code)} |`);
  }
  push();
}

// ---- metodología ----
push(`## Metodología y heurísticas`);
push();
push(`- Escaneo: ${SCAN_ROOTS.map((r) => `\`${r}\``).join(', ')} (extensiones .ts/.js/.astro/.json).`);
push(`- Excluidos: node_modules, dist, .astro, .git, data viva (\`src/data/live\`) y generados (\`related-auto.json\`, \`calc-compute-index.json\`, etc.).`);
push(`- Un "año" es el literal ${FROM_YEAR} como número de 4 dígitos aislado (no parte de un número más largo).`);
push(`- Tokenizador TS aproximado distingue código / string / comentario (soporta template literals con \\\${} anidado).`);
push(`- Anti-falso-positivo: URLs y citas de fuente se ignoran; fechas de dato (lastReviewed, dataUpdate, sources[].date, DATA_AS_OF) se ignoran; prosa va a TEXTO, no a A.`);
push(`- Clase A exige: archivo SIN año en el nombre, fuera de src/lib/data y src/data, nombre de variable "de año" (anio/año/year/actual/base/…) o aritmética de edad, y SIN keyword fiscal ni monto ≥5 dígitos en la misma línea.`);
push();
push(`## Limitaciones conocidas`);
push();
push(`- La demotión fiscal es por LÍNEA: un año calendario legítimo en un archivo 100% fiscal puede quedar en C (falso negativo conservador, intencional).`);
push(`- FECHA no distingue fecha-objetivo recurrente (Navidad) de fecha de evento único (debut del Mundial): ambas requieren ojo humano.`);
push(`- El template de .astro se clasifica como prosa: una constante JS dentro de un \`<script>\` inline del template caería en TEXTO.`);
push(`- TEXTO en JSON cuenta ocurrencias por archivo pero no propone reemplazos (el texto correcto depende de si el dato ${TARGET_YEAR} existe).`);
push(`- \`--apply\` NO bumpea \`lastReviewed\` de los calc JSON asociados: hacerlo a mano o el sitemap no se mueve (CLAUDE.md §2).`);
push();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md.join('\n') + '\n');

// stdout resumen
console.log(`Rollover ${FROM_YEAR} → ${TARGET_YEAR} — dry run`);
console.log(`  A (auto-bump):   ${String(findings.A.length).padStart(5)} ocurr. en ${byFileCount(findings.A)} archivos`);
console.log(`  B (nombre):      ${String(findings.B.length).padStart(5)} archivos`);
console.log(`  C (fiscal/data): ${String(findings.C.length).padStart(5)} ítems en ${byFileCount(findings.C)} archivos`);
console.log(`  FECHA:           ${String(findings.FECHA.length).padStart(5)}`);
console.log(`  TEXTO:           ${String(findings.TEXTO.reduce((s, f) => s + (f.count ?? 1), 0)).padStart(5)} ocurr. en ${byFileCount(findings.TEXTO)} archivos`);
console.log(`  REVIEW:          ${String(findings.REVIEW.length).padStart(5)}`);
console.log(`  ignorados: ${ignored.urls} urls/citas, ${ignored.fechasDato} fechas de dato`);
console.log(`Reporte: ${rel(OUT)}`);
