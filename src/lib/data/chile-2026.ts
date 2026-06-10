/**
 * Datos fiscales y laborales de CHILE 2026 — tabla maestra única.
 * Patrón hermano de peru-2026.ts / ecuador-2026.ts / colombia-2026.ts / mexico-2026.ts.
 * Verificado 2026-06-10 vía fuentes oficiales:
 * - IMM 2026: Ley 21.751 (D.O. 2025) → $539.000 desde 01-ene-2026 (antes $529.000 desde may-2025).
 *   Próximo reajuste: proyecto de ley a más tardar abril 2026, para regir desde 01-may-2026.
 * - Topes imponibles 2026: Superintendencia de Pensiones (definitivos desde remuneraciones de feb-2026):
 *   AFP/salud/Ley de accidentes 90,0 UF; seguro de cesantía 135,2 UF.
 * - Cotizaciones legales: DL 3.500 (AFP 10%), Ley 18.469/18.933 (salud 7%), Ley 19.728 (AFC).
 * - Impuesto de segunda categoría: Art. 43 N°1 LIR (exento hasta 13,5 UTM/mes).
 * - Gratificación legal Art. 50 CT: 25% de lo devengado con tope 4,75 IMM al año.
 * UF/UTM/UTA viven en src/data/live/chile.json (mindicador.cl / Banco Central, refresco automático).
 * Moneda: Peso chileno (CLP, "$").
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-10';

export const CHILE_2026 = {
  anio: 2026,

  // ── Ingreso mínimo mensual — Ley 21.751, vigente desde 01-ene-2026 ──
  imm: 539_000,                 // trabajadores de 18 a 65 años
  immMenores18Mayores65: 402_082,
  immNoRemuneracional: 347_434, // para fines no remuneracionales

  // ── Topes imponibles 2026 — Superintendencia de Pensiones (desde feb-2026, en UF) ──
  topeImponibleAfpUf: 90.0,     // AFP, salud e ISL/mutual (era 87,8 UF en 2025)
  topeImponibleCesantiaUf: 135.2,

  // ── Cotizaciones del trabajador dependiente ──
  afpObligatorio: 0.10,         // DL 3.500 — aporte obligatorio al fondo
  // La comisión de la AFP se suma al 10% y varía por administradora (~0,49% a ~1,45%).
  saludFonasa: 0.07,            // 7% legal (Fonasa; en isapre el plan puede costar más)
  afcTrabajadorIndefinido: 0.006, // 0,6% seguro de cesantía contrato indefinido (Ley 19.728)

  // ── Cotizaciones del empleador (seguro de cesantía, Ley 19.728) ──
  afcEmpleadorIndefinido: 0.024, // 2,4% (contrato indefinido)
  afcEmpleadorPlazoFijo: 0.03,   // 3% (plazo fijo; el trabajador no cotiza)

  // ── Impuesto único de segunda categoría — Art. 43 N°1 LIR (tramos en UTM, mensual) ──
  segundaCategoriaExentoUtm: 13.5, // renta líquida imponible ≤ 13,5 UTM → exenta
  segundaCategoriaTasaMaxima: 0.40,

  // ── Gratificación legal — Art. 50 Código del Trabajo ──
  gratificacionArt50: {
    porcentaje: 0.25,           // 25% de lo devengado en el ejercicio…
    topeImmAnual: 4.75,         // …con tope de 4,75 ingresos mínimos mensuales al año
  },

  // ── IVA — DL 825 ──
  iva: 0.19,

  moneda: 'CLP',
  simbolo: '$',
} as const;

/** Formatea un monto en pesos chilenos (es-CL), sin decimales. */
export function fmtCLP(n: number): string {
  return '$' + new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(Math.round(n));
}
