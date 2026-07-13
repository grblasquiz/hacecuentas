/**
 * redesign-exclude.ts — Slugs que NO reciben el rollout genérico del mockup v3.
 *
 * Son las calculadoras "flagship" del top de tráfico (ranking GA4 28d, ver
 * src/lib/popular-curated.json a 2026-07-09). Cada una se va a rediseñar a mano
 * (bespoke) con su propia presentación de resultado — como ya se hizo con IMC,
 * IPC e ICL. Hasta entonces conservan el look v2 actual: el rollout genérico
 * (.calc-v3) las saltea.
 *
 * ⚠️ La lista se HARDCODEA a propósito (no se importa popular-curated.json): si
 * dependiera del refresh de popularidad, un calc que entra/sale del top cambiaría
 * de look solo — y un calc que entrara al top PERDERÍA el rediseño v3 y volvería
 * al v2 viejo (regresión visual). Editar acá cuando una flagship ya tenga su
 * rediseño bespoke y deba salir de la exclusión.
 *
 * El match es por `calc.slug` (slug canónico), así que excluye la calc en TODOS
 * los locales de forma consistente.
 */
export const BESPOKE_TOP_SLUGS: ReadonlySet<string> = new Set([
  'calculadora-imc',
  'calculadora-indemnizacion-despido',
  'calculadora-aguinaldo-sac',
  'calculadora-actualizacion-alquiler-icl',
  'calculadora-actualizacion-inflacion-ipc',
  'calculadora-impuesto-ganancias-sueldo',
  'dias-entre-dos-fechas',  'calculadora-edad-exacta',
  'calculadora-liquidacion-final-renuncia',
  'calculadora-art-indemnizacion-tabla-incapacidad-laboral-permanente',
  'calculadora-costo-impresion-3d-pieza',
]);

/** true si la calc es flagship-bespoke (queda FUERA del rediseño genérico v3). */
export function isBespokeTop(slug: string): boolean {
  return BESPOKE_TOP_SLUGS.has(slug);
}
