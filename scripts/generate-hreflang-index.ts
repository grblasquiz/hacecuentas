/**
 * generate-hreflang-index.ts
 *
 * Emite src/lib/hreflang-index.json: un catálogo slim y distribuible para
 * todos los routes de calculadoras. Cada entrada contiene { slug, clusterKey }.
 * Todos los locales consumen este mismo artefacto, así que la reciprocidad se
 * obtiene por construcción y no por búsquedas ad-hoc diferentes en cada route.
 *
 * Por qué: antes [...slug].astro hacía import.meta.glob({eager:true}) de los 6
 * dirs de locales (~1200 JSON enteros con intro/faqs/explanation) solo para
 * leer .slug/.esSlug en el bloque hreflang. Eso infla el grafo de build y la
 * memoria del prerender (riesgo de OOM en CI al escalar).
 *
 * El índice excluye noindex/restricted, aliases canónicos, pruning 301 y 410.
 * Por lo tanto un route no puede emitir por accidente un alternate hacia una
 * URL que no sea 200 + indexable + autocanónica.
 *
 * Corre en prebuild (fase 2). Idempotente.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HREFLANG_LOCALES,
  isHreflangEligibleCalc,
  type HreflangIndex,
  type HreflangIndexEntry,
  type HreflangLocale,
} from '../src/lib/hreflang.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const OUT = join(ROOT, 'src/lib/hreflang-index.json');

interface LocaleSpec {
  dir: string;
  routePrefix: string;
  /** Matching histórico permitido sólo cuando hay una raíz única equivalente. */
  fuzzyRoot?: boolean;
}

// La key coincide con HreflangClusterMembers. `es` es la raíz /<slug>;
// `esEs` representa España /es/<slug>.
const LOCALES: Record<HreflangLocale, LocaleSpec> = {
  es: { dir: 'calcs', routePrefix: '' },
  en: { dir: 'calcs-en', routePrefix: 'en' },
  pt: { dir: 'calcs-pt', routePrefix: 'pt' },
  mx: { dir: 'calcs-mx', routePrefix: 'mx', fuzzyRoot: true },
  esEs: { dir: 'calcs-es', routePrefix: 'es', fuzzyRoot: true },
  co: { dir: 'calcs-co', routePrefix: 'co', fuzzyRoot: true },
  cl: { dir: 'calcs-cl', routePrefix: 'cl', fuzzyRoot: true },
  pe: { dir: 'calcs-pe', routePrefix: 'pe' },
  ec: { dir: 'calcs-ec', routePrefix: 'ec' },
  ve: { dir: 'calcs-ve', routePrefix: 've' },
  py: { dir: 'calcs-py', routePrefix: 'py' },
  uy: { dir: 'calcs-uy', routePrefix: 'uy' },
  do: { dir: 'calcs-do', routePrefix: 'do' },
  ptPt: { dir: 'calcs-pt-pt', routePrefix: 'pt-pt' },
};

type RawCalc = {
  slug: string;
  esSlug?: string;
  canonicalSlug?: string;
  [key: string]: unknown;
};

function readLocale(dir: string): RawCalc[] {
  const full = join(CONTENT, dir);
  let files: string[];
  try {
    files = readdirSync(full).filter((f) => f.endsWith('.json'));
  } catch {
    return []; // dir ausente → array vacío (locale sin calcs)
  }
  const out: RawCalc[] = [];
  for (const f of files) {
    try {
      const j = JSON.parse(readFileSync(join(full, f), 'utf8'));
      if (!j || typeof j.slug !== 'string') continue;
      out.push(j);
    } catch {
      // JSON inválido — lo agarra la validación Zod del build; acá lo salteamos
    }
  }
  // Orden estable para diffs limpios
  out.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  return out;
}

const strip = (slug?: string): string | undefined =>
  slug ? slug.replace(/^\/+|\/+$/g, '') : undefined;

const comparable = (slug: string): string =>
  slug.replace(/^calculadora-/, '');

const rawByLocale = {} as Record<HreflangLocale, RawCalc[]>;
const eligibleByLocale = {} as Record<HreflangLocale, RawCalc[]>;
for (const locale of HREFLANG_LOCALES) {
  const spec = LOCALES[locale];
  rawByLocale[locale] = readLocale(spec.dir);
  eligibleByLocale[locale] = rawByLocale[locale].filter((calc) =>
    isHreflangEligibleCalc(calc, spec.routePrefix)
  );
}

// Si un esSlug apunta a un alias canónico raíz, agrupamos bajo el destino
// autocanónico. Nunca emitimos el alias: sólo normalizamos la identidad.
const rootCanonicalAliases = new Map<string, string>();
for (const calc of rawByLocale.es) {
  const slug = strip(calc.slug);
  const canonical = strip(calc.canonicalSlug);
  if (slug && canonical && slug !== canonical) rootCanonicalAliases.set(slug, canonical);
}

function resolveRootAlias(rawKey: string): string {
  let key = rawKey;
  const seen = new Set<string>();
  while (rootCanonicalAliases.has(key) && !seen.has(key)) {
    seen.add(key);
    key = rootCanonicalAliases.get(key)!;
  }
  return key;
}

const rootsByComparable = new Map<string, string[]>();
for (const calc of eligibleByLocale.es) {
  const slug = strip(calc.slug);
  if (!slug) continue;
  const key = comparable(slug);
  rootsByComparable.set(key, [...(rootsByComparable.get(key) || []), slug]);
}

function clusterKeyFor(locale: HreflangLocale, calc: RawCalc): string | undefined {
  const slug = strip(calc.slug);
  if (!slug) return undefined;
  if (locale === 'es') return resolveRootAlias(slug);

  const explicit = strip(calc.esSlug);
  if (explicit) return resolveRootAlias(explicit);

  if (LOCALES[locale].fuzzyRoot) {
    const roots = rootsByComparable.get(comparable(slug)) || [];
    if (roots.length === 1) return roots[0];
  }
  return undefined;
}

const index: HreflangIndex = {};
let total = 0;
for (const locale of HREFLANG_LOCALES) {
  const entries: HreflangIndexEntry[] = eligibleByLocale[locale].map((calc) => {
    const entry: HreflangIndexEntry = { slug: strip(calc.slug)! };
    const clusterKey = clusterKeyFor(locale, calc);
    if (clusterKey) entry.clusterKey = clusterKey;
    return entry;
  });
  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  index[locale] = entries;
  total += entries.length;
}

writeFileSync(OUT, JSON.stringify(index) + '\n', 'utf8');
const counts = HREFLANG_LOCALES
  .map((locale) => `${locale}=${index[locale]?.length || 0}`)
  .join(' ');
console.log(`[generate-hreflang-index] ✓ ${total} entradas (${counts})`);
