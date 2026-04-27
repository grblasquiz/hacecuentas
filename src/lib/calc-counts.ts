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
const mxGlob = import.meta.glob('../content/calcs-mx/*.json');
const esGlob = import.meta.glob('../content/calcs-es/*.json');
const coGlob = import.meta.glob('../content/calcs-co/*.json');
const clGlob = import.meta.glob('../content/calcs-cl/*.json');

const AR = Object.keys(arGlob).length;
const EN = Object.keys(enGlob).length;
const PT = Object.keys(ptGlob).length;
const MX = Object.keys(mxGlob).length;
const ES = Object.keys(esGlob).length;
const CO = Object.keys(coGlob).length;
const CL = Object.keys(clGlob).length;

export const CALC_COUNTS = {
  ar: AR,
  en: EN,
  pt: PT,
  mx: MX,
  es: ES,
  co: CO,
  cl: CL,
  total: AR + EN + PT + MX + ES + CO + CL,
} as const;

function floorTo100(n: number): number {
  return Math.floor(n / 100) * 100;
}

function formatES(n: number): string {
  return n.toLocaleString('es-AR');
}

export const TOTAL_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.total))}+`;
export const AR_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.ar))}+`;
export const PT_DISPLAY = `${formatES(floorTo100(CALC_COUNTS.pt))}+`;
