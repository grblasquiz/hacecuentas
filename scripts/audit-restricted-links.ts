#!/usr/bin/env node
/**
 * Audita LINKS INTERNOS HARDCODEADOS que apuntan a calcs que no se pueden
 * distribuir (`canDistributeCalc() === false`: restringidas YMYL, noindex o
 * podadas).
 *
 * Por qué existe: las relacionadas automáticas ya pasan por content-policy,
 * pero cada lista curada a mano (rails, hubs, `ctaHref`, prosa markdown de los
 * JSON) esquiva ese filtro. En jul-2026 el rail de /calculadora-imc tenía
 * hardcodeado `/calculadora-imc-infantil-percentil` —restringida Y podada—, y
 * la misma calc estaba enlazada desde HealthHub y desde el `ctaHref` de
 * imc.json, ambos VIVOS en prod. Un link a una podada manda al usuario (y al
 * crawler) a un 301; uno a una restringida promociona una herramienta que el
 * gate YMYL desactivó a propósito.
 *
 * NO afloja ningún gate: sólo reporta quién enlaza lo que la política ya
 * excluyó. El fix siempre es cambiar/sacar el link, nunca la política.
 *
 * Alcance: links a calcs del root ES (`/slug`) escritos a mano en src/ y
 * public/. Los archivos que DEFINEN los redirects/410 quedan excluidos: ahí
 * mencionar el slug es el punto.
 *
 * Uso:
 *   node --experimental-strip-types scripts/audit-restricted-links.ts          # reporta, exit 0
 *   node --experimental-strip-types scripts/audit-restricted-links.ts --check  # exit 1 si hay alguno
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canDistributeCalc,
  isRestrictedCalc,
  isPrunedCalc,
  isNoindexCalc,
} from '../src/lib/content-policy.ts';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const CALCS = join(ROOT, 'src', 'content', 'calcs');
const CHECK = process.argv.includes('--check');

/** Archivos que DEFINEN la poda/redirects: nombrar el slug ahí es correcto. */
const EXCLUDED_FILES = new Set([
  'src/lib/pruning-redirects.ts',
  'src/lib/gone-410.ts',
  'src/lib/content-policy.ts',
  'public/_redirects',
  'scripts/audit-restricted-links.ts',
]);

/** Generados por scripts (el fix va en el generador, no en el archivo). */
const GENERATED = /related-auto(-en|-pt)?\.json$|search-index|\.astro\/|dist\//;

const SCAN_EXT = /\.(astro|ts|tsx|js|mjs|json|md|html)$/;
/**
 * Directorios a saltear, por NOMBRE EXACTO de la entrada. Ojo: probar este
 * patrón contra el path completo hace que `.astro$` matchee todos los ARCHIVOS
 * .astro (no sólo la carpeta de caché) y el audit saltee en silencio toda la
 * capa de componentes/páginas — que es justo donde viven las listas curadas.
 */
const SKIP_DIR = /^(node_modules|\.git|dist|\.astro|\.wrangler|coverage)$/;

// ── 1. Política: qué calcs NO se pueden distribuir ───────────────────────────
interface Calc {
  slug?: string;
  h1?: string;
  [k: string]: unknown;
}

const calcs: Calc[] = readdirSync(CALCS)
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const c = JSON.parse(readFileSync(join(CALCS, f), 'utf8')) as Calc;
    // path relativo del JSON dueño (el filename NO es el slug: mapear por campo).
    c.__file = join('src', 'content', 'calcs', f);
    return c;
  });

/** slug → motivo por el que la política lo excluye. */
const blocked = new Map<string, string>();
for (const c of calcs) {
  if (!c.slug || canDistributeCalc(c)) continue;
  const why: string[] = [];
  if (isRestrictedCalc(c)) why.push('restringida');
  if (isPrunedCalc(c)) why.push('podada (301)');
  if (isNoindexCalc(c) && !isRestrictedCalc(c)) why.push('noindex');
  blocked.set(c.slug, why.join(' + ') || 'no distribuible');
}

// ── 2. Archivos a escanear ───────────────────────────────────────────────────
function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIR.test(e)) walk(p, out);
    } else if (SCAN_EXT.test(e)) out.push(p);
  }
  return out;
}

const files = [
  ...walk(join(ROOT, 'src')),
  ...walk(join(ROOT, 'public')),
].filter((p) => {
  const rel = relative(ROOT, p);
  return !EXCLUDED_FILES.has(rel) && !GENERATED.test(rel);
});

// ── 3. Buscar `/slug` con borde (así `/calculadora-imc` no matchea
//      `/calculadora-imc-infantil-percentil`) ─────────────────────────────────
interface Hit {
  file: string;
  line: number;
  slug: string;
  why: string;
  snippet: string;
  /** ¿La página que enlaza es visible? Un link desde una página ya oculta
   *  (restringida/podada) no filtra tráfico; desde una viva, sí. */
  liveSource: boolean;
}
const hits: Hit[] = [];

/** slug de la calc dueña de un JSON de contenido (para saber si la fuente es visible). */
const slugByFile = new Map<string, string>();
for (const c of calcs) {
  if (c.slug && typeof c.__file === 'string') slugByFile.set(c.__file, c.slug);
}

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file);
  // Fuente oculta = el propio JSON de una calc que la política ya excluyó.
  const ownSlug = slugByFile.get(rel);
  const liveSource = !(ownSlug && blocked.has(ownSlug));
  for (const [slug, why] of blocked) {
    if (!src.includes(slug)) continue;
    if (slug === ownSlug) continue; // auto-referencia: no es un link entrante
    const re = new RegExp(`/${slug}(?![a-z0-9-])`);
    src.split('\n').forEach((line, i) => {
      if (!re.test(line)) return;
      hits.push({
        file: rel,
        line: i + 1,
        slug,
        why,
        snippet: line.trim().slice(0, 110),
        liveSource,
      });
    });
  }
}

// ── 4. Reporte ───────────────────────────────────────────────────────────────
console.log(
  `\n🔒 Links internos a calcs no distribuibles (canDistributeCalc() === false)\n` +
    `   ${calcs.length} calcs ES · ${blocked.size} excluidas por política · ${files.length} archivos escaneados\n`
);

if (hits.length === 0) {
  console.log('✅ Ningún link hardcodeado apunta a una calc excluida.\n');
  process.exit(0);
}

/**
 * Orden de severidad:
 *   1. RESTRINGIDA desde página viva → el gate YMYL desactivó la herramienta y
 *      una página indexada la sigue promocionando. Es el caso que importa.
 *   2. Podada desde página viva → el link va a un 301 (mala UX, equity diluida).
 *   3. Cualquiera desde página ya oculta → cosmético.
 */
function tier(h: Hit): 0 | 1 | 2 {
  if (!h.liveSource) return 2;
  return h.why.includes('restringida') ? 0 : 1;
}
const TIERS = [
  { t: 0, title: '🔴 RESTRINGIDA enlazada desde página viva (gate YMYL burlado)' },
  { t: 1, title: '🟡 Podada enlazada desde página viva (el link va a un 301)' },
  { t: 2, title: '⚪ Enlazada desde una página que ya está oculta (cosmético)' },
] as const;

for (const { t, title } of TIERS) {
  const group = hits.filter((h) => tier(h) === t);
  if (!group.length) continue;
  console.log(`${title} — ${group.length}\n`);
  const byFile = new Map<string, Hit[]>();
  for (const h of group) {
    if (!byFile.has(h.file)) byFile.set(h.file, []);
    byFile.get(h.file)!.push(h);
  }
  for (const [file, fh] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${file}`);
    for (const h of fh) console.log(`    :${h.line}  → /${h.slug}  [${h.why}]`);
  }
  console.log('');
}

const blocking = hits.filter((h) => tier(h) === 0);
console.log(
  `${blocking.length ? '❌' : '⚠️ '} ${hits.length} link(s) · ${blocking.length} a restringidas desde páginas vivas.`
);
console.log('   Fix: apuntar a una calc equivalente que pase la política, o sacar el link.');
console.log('   NO ablandar content-policy.ts: la exclusión es intencional.\n');

// El gate sólo corta por el tier 0 (YMYL). Las podadas son backlog conocido y
// mucho más ancho: romperían el build de entrada sin aportar señal nueva.
process.exit(CHECK && blocking.length ? 1 : 0);
