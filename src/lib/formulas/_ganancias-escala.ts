/**
 * Escala de Ganancias — valores compartidos (segundo semestre 2026).
 *
 * Fuente oficial: ARCA, RG 4003, Ley 27.743 (Ley Bases 2024).
 *   - Escala: https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-jul-a-dic-2026.pdf
 *   - Deducciones: https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-jul-dic-2026.pdf
 *
 * Los valores se derivan de `data/ganancias-2026.ts`, que conserva ambos
 * semestres y evita que la tabla informativa y las calculadoras diverjan.
 *
 * ARCA actualiza semestralmente por IPC INDEC. El fetcher
 * `scripts/update-data/fetchers/ganancias-escala.ts` patchea este archivo.
 * El prefijo `_` indica que es módulo interno: no es una calc con UI.
 */

import {
  GANANCIAS_2026,
  GANANCIAS_2026_CURRENT_PERIOD,
  GANANCIAS_2026_DEDUCCIONES,
} from '../data/ganancias-2026';

const DEDUCCIONES = GANANCIAS_2026_DEDUCCIONES[GANANCIAS_2026_CURRENT_PERIOD];

/**
 * Mínimo no imponible efectivo mensual para trabajador en relación de dependencia
 * soltero sin cargas. Combina GNI + Deducción Especial del art. 30 inc c) APARTADO 2
 * (la incrementada para rentas del trabajo en relación de dependencia y jubilaciones).
 * El apartado 1, menor, es el de autónomos — NO aplica a empleados.
 * Los importes salen de la tabla oficial del período activo; no se duplican acá.
 */
export const MNI_MENSUAL_BASE = Number(((DEDUCCIONES.gni + DEDUCCIONES.especialEmpleados) / 12).toFixed(2));

/**
 * Ganancia No Imponible (art. 30 inc a) anual del período activo.
 * Es el tope legal de la deducción del 40% del alquiler de vivienda (art. 85 inc h LIG):
 * lo deducible no puede superar la GNI del período. Fuente: ARCA, RG 4003.
 */
export const GNI_ANUAL = DEDUCCIONES.gni;

/**
 * Deducción especial del art. 30 inc c) APARTADO 1 — autónomos y profesionales
 * independientes. Importe anual del período activo.
 *
 * Es la contracara de `MNI_MENSUAL_BASE`, que usa el apartado 2 (la incrementada
 * para relación de dependencia y jubilaciones). Un monotributista
 * que pasa a régimen general deduce ESTA, no aquella: usar la de empleados le
 * bajaría el impuesto ~$558.000 anuales de más.
 *
 * La fuente única es `data/ganancias-2026.ts`.
 */
export const DEDUCCION_ESPECIAL_AUTONOMOS_ANUAL = DEDUCCIONES.especialAutonomos;

/** Deducción mensual por cónyuge a cargo. */
export const INCREMENTO_CONYUGE_MENSUAL = Number((DEDUCCIONES.conyuge / 12).toFixed(2));

/** Deducción mensual por hijo a cargo. */
export const INCREMENTO_HIJO_MENSUAL = Number((DEDUCCIONES.hijo / 12).toFixed(2));

/** Deducción mensual por hijo incapacitado. */
export const INCREMENTO_HIJO_INCAPACITADO_MENSUAL = Number((DEDUCCIONES.hijoIncapacitado / 12).toFixed(2));

/**
 * @deprecated Usar `INCREMENTO_CONYUGE_MENSUAL` e `INCREMENTO_HIJO_MENSUAL`
 * por separado. Este promedio existe sólo por compatibilidad con código legacy.
 * Semánticamente incorrecto: cónyuge vale ~2× que un hijo según ARCA.
 */
export const INCREMENTO_POR_FAMILIAR = Number(((INCREMENTO_CONYUGE_MENSUAL + INCREMENTO_HIJO_MENSUAL) / 2).toFixed(2));

export interface TramoEscala {
  /** Tope mensual del tramo; la última usa Infinity para el excedente */
  hasta: number;
  /** Alícuota marginal del tramo (0.05 = 5%) */
  tasa: number;
  /** Impuesto acumulado al inicio del tramo (ya liquidado por tramos anteriores) */
  acumulado: number;
}

/**
 * Escala mensual proyectada 2026 — 9 tramos (5% a 35%).
 * Derivada de la tabla anual vigente para julio-diciembre: cada tope y monto
 * fijo es 1/12 del acumulado anual. La retención real de nómina es acumulativa.
 */
export const ESCALA: TramoEscala[] = GANANCIAS_2026[GANANCIAS_2026_CURRENT_PERIOD].map(
  ([, hasta, acumulado, tasa]) => ({
    hasta: Number.isFinite(hasta) ? Number((hasta / 12).toFixed(2)) : Infinity,
    tasa,
    acumulado: Number((acumulado / 12).toFixed(2)),
  }),
);

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
