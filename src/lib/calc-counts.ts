/**
 * Single source of truth para el conteo de calculadoras.
 * Se computa al build time vía Vite glob (compatible con CF Workers runtime,
 * que no soporta `node:fs`).
 *
 * Por qué existe: antes había hardcoded "3.700+" en index.astro, sobre-nosotros,
 * prensa y README mientras la home renderizaba calcs.length real (~2.700). El
 * mismatch era visible en schema/FAQ y dañaba confianza.
 *
 * Display redondea HACIA ABAJO al 100 más cercano para no over-promise:
 * 3607 → "3.600+", nunca "3.700+" hasta que realmente lo sea.
 */

import { canDistributeCalc } from './content-policy';
import { PRUNING_REDIRECTS } from './pruning-redirects.ts';

// Un único glob eager por colección sirve tanto para contar archivos como para
// calcular métricas distribuibles. Antes había además un glob lazy por cada
// colección: Vite veía cada JSON importado estática y dinámicamente, emitía
// miles de warnings y generaba chunks dinámicos que nunca se usaban.
const arGlob = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const enGlob = import.meta.glob<any>('../content/calcs-en/*.json', { eager: true });
const ptGlob = import.meta.glob<any>('../content/calcs-pt/*.json', { eager: true });
const ptPtGlob = import.meta.glob<any>('../content/calcs-pt-pt/*.json', { eager: true });
const mxGlob = import.meta.glob<any>('../content/calcs-mx/*.json', { eager: true });
const esGlob = import.meta.glob<any>('../content/calcs-es/*.json', { eager: true });
const coGlob = import.meta.glob<any>('../content/calcs-co/*.json', { eager: true });
const clGlob = import.meta.glob<any>('../content/calcs-cl/*.json', { eager: true });
const peGlob = import.meta.glob<any>('../content/calcs-pe/*.json', { eager: true });
const ecGlob = import.meta.glob<any>('../content/calcs-ec/*.json', { eager: true });
const veGlob = import.meta.glob<any>('../content/calcs-ve/*.json', { eager: true });
const pyGlob = import.meta.glob<any>('../content/calcs-py/*.json', { eager: true });
const uyGlob = import.meta.glob<any>('../content/calcs-uy/*.json', { eager: true });
const doGlob = import.meta.glob<any>('../content/calcs-do/*.json', { eager: true });

const AR = Object.keys(arGlob).length;
const EN = Object.keys(enGlob).length;
const PT = Object.keys(ptGlob).length;
const PT_PT = Object.keys(ptPtGlob).length;
const MX = Object.keys(mxGlob).length;
const ES = Object.keys(esGlob).length;
const CO = Object.keys(coGlob).length;
const CL = Object.keys(clGlob).length;
const PE = Object.keys(peGlob).length;
const EC = Object.keys(ecGlob).length;
const VE = Object.keys(veGlob).length;
const PY = Object.keys(pyGlob).length;
const UY = Object.keys(uyGlob).length;
const DO = Object.keys(doGlob).length;

export const CALC_COUNTS = {
  ar: AR,
  en: EN,
  pt: PT,
  ptPt: PT_PT,
  mx: MX,
  es: ES,
  co: CO,
  cl: CL,
  pe: PE,
  ec: EC,
  ve: VE,
  py: PY,
  uy: UY,
  do: DO,
  total: AR + EN + PT + PT_PT + MX + ES + CO + CL + PE + EC + VE + PY + UY + DO,
} as const;

function floorTo100(n: number): number {
  return Math.floor(n / 100) * 100;
}

function formatES(n: number): string {
  return n.toLocaleString('es-AR');
}

// Categorías reales del catálogo AR (ES-root), computadas de la data — la misma
// fuente que alimenta la home y /categoria/*. NUNCA hardcodear "N categorías" en
// páginas (sobre-nosotros decía 19 mientras la home mostraba 26).
export const CATEGORY_COUNT = new Set(
  Object.values(arGlob)
    .map((m: any) => (m.default || m).category)
    .filter(Boolean)
).size;

// YMYL (Fase 10): la cifra PÚBLICA ("calculadoras disponibles en buscadores")
// NO cuenta páginas restringidas, noindex ni podadas (301). Se computa con la
// MISMA regla que scripts/generate-sitemap.ts para que se cumpla el invariante
// del auditor: total público = URLs canónicas del sitemap. `CALC_COUNTS.total`
// sigue siendo el bruto del repositorio (para métricas internas).
//
// Antes PUBLIC_TOTAL = total_bruto − AR_restringidas: sólo descontaba las AR
// noindex y contaba en crudo los 13 locales, incluyendo cientos de URLs
// EN/PT/… que redirigen (301, en PRUNING_REDIRECTS con clave prefijada
// `/en/…`) o son noindex → sobre-conteo (3.100+ vs ~2.400 reales del sitemap).
// Espeja PRUNED_SLUGS de content-policy / generate-sitemap: claves de
// PRUNING_REDIRECTS sin la barra inicial (para locales vienen prefijadas: `en/…`).
const PRUNED_SLUGS: ReadonlySet<string> = new Set(
  Object.keys(PRUNING_REDIRECTS).map((p) => p.replace(/^\//, '')),
);

// Distribuibles por locale: canDistributeCalc (indexable + no restringida + no
// podada por slug pelado) y, para locales, además excluir las podadas con clave
// prefijada `${prefix}/${slug}` (el slug pelado colisiona con una redirección
// ES-root, por eso el sitemap pasa el prefijo). Idéntico a generate-sitemap.ts.
function countDistributable(glob: Record<string, any>, prefix: string): number {
  return Object.values(glob)
    .map((m: any) => m.default || m)
    .filter((c: any) => canDistributeCalc(c) && (prefix ? !PRUNED_SLUGS.has(`${prefix}/${c.slug}`) : true))
    .length;
}

const DIST = {
  ar: countDistributable(arGlob, ''),
  en: countDistributable(enGlob, 'en'),
  pt: countDistributable(ptGlob, 'pt'),
  ptPt: countDistributable(ptPtGlob, 'pt-pt'),
  mx: countDistributable(mxGlob, 'mx'),
  es: countDistributable(esGlob, 'es'),
  co: countDistributable(coGlob, 'co'),
  cl: countDistributable(clGlob, 'cl'),
  pe: countDistributable(peGlob, 'pe'),
  ec: countDistributable(ecGlob, 'ec'),
  ve: countDistributable(veGlob, 've'),
  py: countDistributable(pyGlob, 'py'),
  uy: countDistributable(uyGlob, 'uy'),
  do: countDistributable(doGlob, 'do'),
} as const;

const AR_INDEXABLE = DIST.ar;
const AR_RESTRICTED = CALC_COUNTS.ar - AR_INDEXABLE; // noindex + restringidas + podadas AR
// Público = suma de distribuibles de TODOS los locales = URLs canónicas del sitemap.
const PUBLIC_TOTAL = Object.values(DIST).reduce((a, b) => a + b, 0);

export const CALC_COUNTS_PUBLIC = {
  arIndexable: AR_INDEXABLE,
  arRestricted: AR_RESTRICTED,
  publicTotal: PUBLIC_TOTAL,
  repoTotal: CALC_COUNTS.total,
} as const;

// Métricas públicas explícitas: no mezclar herramientas del catálogo raíz con
// versiones localizadas ni con el total bruto del repositorio.
export const ROOT_CATALOG_COUNT = AR_INDEXABLE;
export const LOCALIZED_VERSION_COUNT = PUBLIC_TOTAL - AR_INDEXABLE;
export const PUBLIC_URL_COUNT = PUBLIC_TOTAL;
export const ROOT_CATALOG_EXACT = formatES(ROOT_CATALOG_COUNT);
export const LOCALIZED_VERSION_EXACT = formatES(LOCALIZED_VERSION_COUNT);
export const PUBLIC_URL_EXACT = formatES(PUBLIC_URL_COUNT);

// Display público del contador de "herramientas": usa el catálogo ESPAÑOL
// distribuible (= lo que muestra /calculadoras y la suma de categorías visibles),
// NO el total multi-idioma. Antes usaba PUBLIC_TOTAL (todas las locales, ~2.400):
// la home decía "2.400+" pero /calculadoras y las categorías suman ~1.400 →
// inconsistencia que el auditor marca (portada vs catálogo). El invariante del
// auditor es "total público = suma de categorías", y las categorías visibles son
// las del catálogo ES. PUBLIC_TOTAL queda para métricas internas / sitemap.
export const TOTAL_DISPLAY = `${formatES(floorTo100(AR_INDEXABLE))}+`;
export const AR_DISPLAY = `${formatES(floorTo100(AR_INDEXABLE))}+`;
export const PT_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.pt))}+`;
// Sin sufijo "+", para frases tipo "Más de {TOTAL_PLAIN} calculadoras".
export const TOTAL_PLAIN = formatES(floorTo100(AR_INDEXABLE));

// Total del catálogo en ESPAÑOL (excluye EN/PT-BR/PT-PT), indexable, formateado
// en-US — para textos en inglés que refieren al catálogo hispano
// ("Visit our full site in Spanish with N+ calculators").
const ES_PUBLIC_TOTAL = PUBLIC_TOTAL - DIST.en - DIST.pt - DIST.ptPt;
export const ES_TOTAL_DISPLAY_EN = `${floorTo100(ES_PUBLIC_TOTAL).toLocaleString('en-US')}+`;
