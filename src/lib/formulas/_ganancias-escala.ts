/**
 * Escala de Ganancias — valores compartidos (2026).
 *
 * Este archivo es la fuente de verdad para la escala mensual del Impuesto a las
 * Ganancias sobre sueldos. Lo importan `sueldo-ar.ts` y `ganancias-sueldo.ts`
 * para garantizar consistencia entre la calc de sueldo en mano y la de detalle
 * de retención.
 *
 * Base legal: Ley 20.628 + Ley 27.743 (Ley Bases 2024) + RG ARCA.
 * ARCA actualiza semestralmente los valores por RIPTE. El fetcher auto-llm
 * `scripts/update-data/fetchers/ganancias-escala.ts` patchea este archivo.
 *
 * El prefijo `_` indica que es módulo interno: no es una calc con UI.
 */

/** Mínimo no imponible efectivo mensual (incluye deducción especial 4.8× prorrateada) */
export const MNI_MENSUAL_BASE = 2_280_000;

/** Incremento mensual del MNI por cada familiar a cargo (cónyuge o hijo) */
export const INCREMENTO_POR_FAMILIAR = 400_000;

export interface TramoEscala {
  /** Tope mensual del tramo; la última usa Infinity para el excedente */
  hasta: number;
  /** Alícuota marginal del tramo (0.05 = 5%) */
  tasa: number;
  /** Impuesto acumulado al inicio del tramo (ya liquidado por tramos anteriores) */
  acumulado: number;
}

/** Escala mensual simplificada 2026 — 6 tramos (5 + excedente) */
export const ESCALA: TramoEscala[] = [
  { hasta: 500_000, tasa: 0.05, acumulado: 0 },
  { hasta: 1_000_000, tasa: 0.09, acumulado: 25_000 },
  { hasta: 1_500_000, tasa: 0.12, acumulado: 70_000 },
  { hasta: 2_500_000, tasa: 0.15, acumulado: 130_000 },
  { hasta: 4_000_000, tasa: 0.19, acumulado: 280_000 },
  { hasta: Infinity, tasa: 0.27, acumulado: 565_000 },
];

/** Aplica la escala mensual y devuelve {impuesto liquidado, alícuota marginal}. */
export function aplicarEscalaMensual(base: number): { impuesto: number; marginal: number } {
  if (base <= 0) return { impuesto: 0, marginal: 0 };
  let anterior = 0;
  for (const tramo of ESCALA) {
    if (base <= tramo.hasta) {
      return {
        impuesto: tramo.acumulado + (base - anterior) * tramo.tasa,
        marginal: tramo.tasa,
      };
    }
    anterior = tramo.hasta;
  }
  const ult = ESCALA[ESCALA.length - 1];
  return { impuesto: ult.acumulado + (base - anterior) * ult.tasa, marginal: ult.tasa };
}
