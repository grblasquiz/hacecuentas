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

export const TOTAL_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.total))}+`;
export const AR_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.ar))}+`;
export const PT_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.pt))}+`;
// Sin sufijo "+", para frases tipo "Más de {TOTAL_PLAIN} calculadoras".
export const TOTAL_PLAIN = formatES(floorTo100(CALC_COUNTS.total));
