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

const arGlob = import.meta.glob('../content/calcs/*.json');
const enGlob = import.meta.glob('../content/calcs-en/*.json');
const ptGlob = import.meta.glob('../content/calcs-pt/*.json');
const ptPtGlob = import.meta.glob('../content/calcs-pt-pt/*.json');
const mxGlob = import.meta.glob('../content/calcs-mx/*.json');
const esGlob = import.meta.glob('../content/calcs-es/*.json');
const coGlob = import.meta.glob('../content/calcs-co/*.json');
const clGlob = import.meta.glob('../content/calcs-cl/*.json');
const peGlob = import.meta.glob('../content/calcs-pe/*.json');
const ecGlob = import.meta.glob('../content/calcs-ec/*.json');
const veGlob = import.meta.glob('../content/calcs-ve/*.json');
const pyGlob = import.meta.glob('../content/calcs-py/*.json');
const uyGlob = import.meta.glob('../content/calcs-uy/*.json');
const doGlob = import.meta.glob('../content/calcs-do/*.json');

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
const arEager = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
export const CATEGORY_COUNT = new Set(
  Object.values(arEager)
    .map((m: any) => (m.default || m).category)
    .filter(Boolean)
).size;

// YMYL (Fase 10): la cifra PÚBLICA ("calculadoras disponibles en buscadores")
// NO cuenta páginas restringidas ni noindex. `canDistributeCalc` = indexable +
// distribuible. `CALC_COUNTS.total` sigue siendo el bruto del repositorio (para
// métricas internas), pero el display público usa el indexable.
const AR_INDEXABLE = Object.values(arEager)
  .map((m: any) => m.default || m)
  .filter((c: any) => canDistributeCalc(c)).length;
const AR_RESTRICTED = CALC_COUNTS.ar - AR_INDEXABLE; // noindex + restringidas
// Las restringidas viven sólo en AR por ahora; el público total resta esas.
const PUBLIC_TOTAL = CALC_COUNTS.total - AR_RESTRICTED;

export const CALC_COUNTS_PUBLIC = {
  arIndexable: AR_INDEXABLE,
  arRestricted: AR_RESTRICTED,
  publicTotal: PUBLIC_TOTAL,
  repoTotal: CALC_COUNTS.total,
} as const;

// Displays públicos: usan el conteo indexable (excluye restringidas/noindex).
export const TOTAL_DISPLAY = `${formatES(floorTo100(PUBLIC_TOTAL))}+`;
export const AR_DISPLAY = `${formatES(floorTo100(AR_INDEXABLE))}+`;
export const PT_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.pt))}+`;
// Sin sufijo "+", para frases tipo "Más de {TOTAL_PLAIN} calculadoras".
export const TOTAL_PLAIN = formatES(floorTo100(PUBLIC_TOTAL));

// Total del catálogo en ESPAÑOL (excluye EN/PT-BR/PT-PT), indexable, formateado
// en-US — para textos en inglés que refieren al catálogo hispano
// ("Visit our full site in Spanish with N+ calculators").
const ES_PUBLIC_TOTAL = PUBLIC_TOTAL - CALC_COUNTS.en - CALC_COUNTS.pt - CALC_COUNTS.ptPt;
export const ES_TOTAL_DISPLAY_EN = `${floorTo100(ES_PUBLIC_TOTAL).toLocaleString('en-US')}+`;
