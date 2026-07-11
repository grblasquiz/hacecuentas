/**
 * Auditoría de INLINKS contextuales (grafo entrante) sobre las URLs indexables.
 *
 * A diferencia de scripts/bing-growth/build-internal-links.mjs (que solo mira
 * presencia de related-auto AR y mide salida), este script:
 *   1. Carga TODOS los locales con su propio mapa related-auto-<locale>.json
 *      (los mismos que renderiza RelatedCalcs.astro — mismo idioma-país por
 *      construcción).
 *   2. Replica EXACTAMENTE la selección que renderiza RelatedCalcs.astro:
 *      manual (relatedSlugs) → auto (TF-IDF) → fallback de categoría por score
 *      de riqueza, dedup, corte a `limit` (cap del render).
 *   3. Suma los enlaces calc ← sala de decisión (componentCalcs de /decidir/*).
 *   4. Computa inbound REAL por URL y clasifica ORPHAN (0) / WEAK (<3) / OK.
 *
 * NO cuenta (a propósito, criterio conservador): footer, hubs/categorías,
 * breadcrumbs, NextCalcs (duplica los mismos targets del top del mesh), links
 * en prosa. Es decir: mide el mesh CONTEXTUAL que controla compute-related.
 *
 * Tiers (para el mínimo de 3 inlinks):
 *   - T1 = curated topPrioritySlugs/topSlugs del sitemap + daily keywords.
 *   - T2 = completenessScore >= 8 (misma fórmula que sitemap-priority).
 *   - T3 = resto.
 *
 * Uso:
 *   node --experimental-strip-types scripts/internal-linking/inbound-audit.ts \
 *     [--cap 4] [--suffix before]
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { canDistributeCalc } from '../../src/lib/content-policy.ts';

const args = process.argv.slice(2);
function argVal(name: string, dflt: string): string {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
}
const CAP = Number(argVal('cap', '4'));
const SUFFIX = argVal('suffix', 'audit');
const MIN_INLINKS = 3;

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'reports', 'internal-linking');
mkdirSync(OUT_DIR, { recursive: true });

interface LocaleDef {
  key: string;
  dir: string;
  map: string;
  prefix: string;
}
const LOCALES: LocaleDef[] = [
  { key: 'es', dir: 'src/content/calcs', map: 'src/lib/related-auto.json', prefix: '/' },
  { key: 'en', dir: 'src/content/calcs-en', map: 'src/lib/related-auto-en.json', prefix: '/en/' },
  { key: 'pt', dir: 'src/content/calcs-pt', map: 'src/lib/related-auto-pt.json', prefix: '/pt/' },
  { key: 'es-ES', dir: 'src/content/calcs-es', map: 'src/lib/related-auto-es.json', prefix: '/es/' },
  { key: 'co', dir: 'src/content/calcs-co', map: 'src/lib/related-auto-co.json', prefix: '/co/' },
  { key: 'mx', dir: 'src/content/calcs-mx', map: 'src/lib/related-auto-mx.json', prefix: '/mx/' },
  { key: 'cl', dir: 'src/content/calcs-cl', map: 'src/lib/related-auto-cl.json', prefix: '/cl/' },
  { key: 'pe', dir: 'src/content/calcs-pe', map: 'src/lib/related-auto-pe.json', prefix: '/pe/' },
  { key: 'ec', dir: 'src/content/calcs-ec', map: 'src/lib/related-auto-ec.json', prefix: '/ec/' },
  { key: 've', dir: 'src/content/calcs-ve', map: 'src/lib/related-auto-ve.json', prefix: '/ve/' },
  { key: 'py', dir: 'src/content/calcs-py', map: 'src/lib/related-auto-py.json', prefix: '/py/' },
  { key: 'uy', dir: 'src/content/calcs-uy', map: 'src/lib/related-auto-uy.json', prefix: '/uy/' },
  { key: 'do', dir: 'src/content/calcs-do', map: 'src/lib/related-auto-do.json', prefix: '/do/' },
  { key: 'pt-pt', dir: 'src/content/calcs-pt-pt', map: 'src/lib/related-auto-pt-pt.json', prefix: '/pt-pt/' },
];

// Misma fórmula que el fallback de RelatedCalcs.astro (riqueza de contenido).
function fallbackScore(c: any): number {
  return (
    (c.faq?.length || 0) * 2 +
    (c.useCases?.length || 0) +
    (c.example ? 3 : 0) +
    (c.explanation ? Math.min(c.explanation.length / 500, 5) : 0) +
    (c.sources?.length || 0) +
    (c.relatedSlugs?.length || 0) +
    (c.presets?.items?.length || 0)
  );
}

// Misma fórmula que sitemap-priority (calcs "maduras").
function completenessScore(c: any): number {
  let s = 0;
  if (c.example?.steps?.length) s += 2;
  if (c.sources?.length >= 2) s += 2;
  if (c.faq?.length >= 7) s += 2;
  if (c.useCases?.length >= 4) s += 1;
  if (c.keyTakeaway) s += 1;
  if (c.explanation && c.explanation.length > 1500) s += 2;
  if (c.lastReviewed) s += 1;
  if (c.dataUpdate?.lastUpdated) s += 1;
  return s;
}

// Tier 1: listas curadas del sitemap (topPrioritySlugs / topSlugs / DAILY_KEYWORDS)
// extraídas del propio generate-sitemap.ts para no duplicar la fuente de verdad.
function extractSitemapLists(): { curated: Set<string>; dailyKw: string[] } {
  const curated = new Set<string>();
  let dailyKw: string[] = [];
  try {
    const src = readFileSync(join(ROOT, 'scripts', 'generate-sitemap.ts'), 'utf8');
    for (const arrName of ['topPrioritySlugs', 'topSlugs']) {
      const m = src.match(new RegExp(`const ${arrName}[^=]*=\\s*(?:new Set\\()?\\[([\\s\\S]*?)\\]`));
      if (m) for (const s of m[1].matchAll(/'([^']+)'/g)) curated.add(s[1]);
    }
    const dk = src.match(/const DAILY_KEYWORDS[^=]*=\s*\[([\s\S]*?)\]/);
    if (dk) dailyKw = [...dk[1].matchAll(/'([^']+)'/g)].map((m2) => m2[1]);
  } catch {}
  return { curated, dailyKw };
}
const { curated: TIER1_SLUGS, dailyKw: DAILY_KW } = extractSitemapLists();

function tierOf(c: any, localeKey: string): 1 | 2 | 3 {
  if (localeKey === 'es') {
    if (TIER1_SLUGS.has(c.slug)) return 1;
    if (DAILY_KW.some((k) => c.slug.includes(k))) return 1;
  }
  if (completenessScore(c) >= 8) return 2;
  return 3;
}

// Slices prioritarios pedidos (clusters por locale + keywords de slug/categoría).
const PRIORITY_SLICES: Record<string, (c: any, locale: string) => boolean> = {
  'laboral-co': (c, l) =>
    l === 'co' && /salario|nomina|prima|cesantia|liquidacion|laboral|pension|horas-extra|vacaciones|dotacion/.test(c.slug),
  'nomina-mx': (c, l) =>
    l === 'mx' && /nomina|salario|sueldo|imss|infonavit|aguinaldo|isr|finiquito|liquidacion|utilidades|ptu/.test(c.slug),
  'fiscal-ar': (c, l) =>
    l === 'es' &&
    (c.category === 'impuestos' ||
      /monotributo|ganancias|\biva\b|arca|afip|iibb|ingresos-brutos|bienes-personales|autonomo/.test(c.slug)),
  'construccion-ar': (c, l) =>
    l === 'es' &&
    /hormigon|cemento|ladrillo|pintura|contrapiso|revoque|mamposteria|hierro|construccion|obra|ceramica|piso|pared|techo|durlock|placa/.test(
      c.slug,
    ),
  millas: (c) => /milla|millas|aerolineas-plus|smiles|latam-pass|puntos-aereos/.test(c.slug),
  'conversores-obra': (c, l) =>
    l === 'es' &&
    /conversor|conversion|metros-cubicos|m3|litros-a|kg-a|toneladas|baldes|bolsas-de/.test(c.slug) &&
    /obra|cemento|hormigon|arena|piedra|cal|yeso|pintura|construccion|material/.test(
      c.slug + ' ' + (c.category || ''),
    ),
};

interface Row {
  url: string;
  locale: string;
  slug: string;
  category: string;
  tier: number;
  inbound: number;
  outbound: number;
  status: string;
  slices: string;
}

const rows: Row[] = [];
const summary: Record<string, any> = {};

for (const L of LOCALES) {
  const dirAbs = join(ROOT, L.dir);
  if (!existsSync(dirAbs)) continue;
  let map: Record<string, string[]> = {};
  try {
    map = JSON.parse(readFileSync(join(ROOT, L.map), 'utf8'));
  } catch {}

  const all: any[] = [];
  for (const f of readdirSync(dirAbs)) {
    if (!f.endsWith('.json')) continue;
    try {
      all.push(JSON.parse(readFileSync(join(dirAbs, f), 'utf8')));
    } catch {}
  }
  // Pool renderizable/indexable: mismo criterio que RelatedCalcs + sitemap
  // (sin alias canónicos: su URL no es un target indexable).
  const pool = all.filter((c) => c?.slug && canDistributeCalc(c) && !(c.canonicalSlug && c.canonicalSlug !== c.slug));
  const bySlug = new Map(pool.map((c) => [c.slug, c]));
  const byCat = new Map<string, any[]>();
  for (const c of pool) {
    const k = c.category || '';
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(c);
  }
  // Fallback de categoría pre-ordenado por score (como RelatedCalcs).
  const catSorted = new Map<string, any[]>();
  for (const [k, arr] of byCat) catSorted.set(k, [...arr].sort((a, b) => fallbackScore(b) - fallbackScore(a)));

  const inbound = new Map<string, number>();
  const outCount = new Map<string, number>();

  for (const src of pool) {
    const seen = new Set<string>([src.slug]);
    const rendered: string[] = [];
    const push = (s: string) => {
      if (!seen.has(s) && bySlug.has(s) && rendered.length < CAP) {
        seen.add(s);
        rendered.push(s);
      }
    };
    for (const s of src.relatedSlugs || []) push(s);
    for (const s of map[src.slug] || []) push(s);
    if (rendered.length < CAP) {
      for (const c of catSorted.get(src.category || '') || []) {
        push(c.slug);
        if (rendered.length >= CAP) break;
      }
    }
    outCount.set(src.slug, rendered.length);
    for (const t of rendered) inbound.set(t, (inbound.get(t) || 0) + 1);
  }

  // Enlaces calc ← salas de decisión (componentCalcs). AR = decisions/*.ts;
  // verticales = decisions/<cc>/*.ts.
  const decDirs =
    L.key === 'es'
      ? [join(ROOT, 'src/lib/decisions')]
      : ['co', 'mx', 'cl', 'pe'].includes(L.key)
        ? [join(ROOT, 'src/lib/decisions', L.key)]
        : [];
  for (const dd of decDirs) {
    if (!existsSync(dd)) continue;
    for (const f of readdirSync(dd)) {
      if (!f.endsWith('.ts')) continue;
      const src = readFileSync(join(dd, f), 'utf8');
      const m = src.match(/componentCalcs:\s*\[([\s\S]*?)\]/);
      if (!m) continue;
      for (const s of m[1].matchAll(/slug:\s*'([^']+)'/g)) {
        if (bySlug.has(s[1])) inbound.set(s[1], (inbound.get(s[1]) || 0) + 1);
      }
    }
  }

  let orphan = 0,
    weak = 0,
    t12weak = 0;
  for (const c of pool) {
    const inb = inbound.get(c.slug) || 0;
    const tier = tierOf(c, L.key);
    const status = inb === 0 ? 'ORPHAN' : inb < MIN_INLINKS ? 'WEAK' : 'OK';
    if (status === 'ORPHAN') orphan++;
    if (status !== 'OK') weak++;
    if (status !== 'OK' && tier <= 2) t12weak++;
    const slices = Object.entries(PRIORITY_SLICES)
      .filter(([, fn]) => fn(c, L.key))
      .map(([k]) => k)
      .join('|');
    rows.push({
      url: L.prefix + c.slug,
      locale: L.key,
      slug: c.slug,
      category: c.category || '',
      tier,
      inbound: inb,
      outbound: outCount.get(c.slug) || 0,
      status,
      slices,
    });
  }
  summary[L.key] = { indexable: pool.length, orphan, under3: weak, tier12_under3: t12weak };
}

// — Salidas —
const esc = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const csv =
  'url,locale,slug,category,tier,inbound_contextual,outbound_rendered,status,priority_slices\n' +
  rows
    .map((r) => [r.url, r.locale, r.slug, r.category, r.tier, r.inbound, r.outbound, r.status, r.slices].map(esc).join(','))
    .join('\n') +
  '\n';
writeFileSync(join(OUT_DIR, `inbound-${SUFFIX}.csv`), csv);

const sliceStats: Record<string, { total: number; orphan: number; under3: number }> = {};
for (const r of rows) {
  for (const s of r.slices ? r.slices.split('|') : []) {
    sliceStats[s] ||= { total: 0, orphan: 0, under3: 0 };
    sliceStats[s].total++;
    if (r.status === 'ORPHAN') sliceStats[s].orphan++;
    if (r.status !== 'OK') sliceStats[s].under3++;
  }
}
const totals = rows.length;
const totOrphan = rows.filter((r) => r.status === 'ORPHAN').length;
const totWeak = rows.filter((r) => r.status !== 'OK').length;
const t12 = rows.filter((r) => r.tier <= 2);
const t12Weak = t12.filter((r) => r.status !== 'OK').length;

const report = {
  generated: SUFFIX,
  renderCap: CAP,
  minInlinks: MIN_INLINKS,
  totals: { indexable: totals, orphan: totOrphan, under3: totWeak, tier12: t12.length, tier12_under3: t12Weak },
  byLocale: summary,
  prioritySlices: sliceStats,
};
writeFileSync(join(OUT_DIR, `inbound-${SUFFIX}.json`), JSON.stringify(report, null, 2));

console.log(`[inbound-audit] cap=${CAP} → ${totals} URLs indexables`);
console.log(`  ORPHAN (0 inlinks): ${totOrphan}`);
console.log(`  <${MIN_INLINKS} inlinks: ${totWeak}  (Tier1+2: ${t12Weak} de ${t12.length})`);
for (const [k, v] of Object.entries(summary))
  console.log(`  ${k.padEnd(6)} idx=${String(v.indexable).padStart(4)} orphan=${String(v.orphan).padStart(4)} under3=${String(v.under3).padStart(4)} t12under3=${v.tier12_under3}`);
console.log('  slices prioritarios:');
for (const [k, v] of Object.entries(sliceStats))
  console.log(`    ${k.padEnd(16)} total=${String(v.total).padStart(4)} orphan=${v.orphan} under3=${v.under3}`);
console.log(`→ reports/internal-linking/inbound-${SUFFIX}.{csv,json}`);
