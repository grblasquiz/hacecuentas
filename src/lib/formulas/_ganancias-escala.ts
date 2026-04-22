/**
 * Escala de Ganancias — valores compartidos (primer semestre 2026).
 *
 * Fuente oficial: ARCA, RG 4003, Ley 27.743 (Ley Bases 2024).
 *   - Escala: https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-ene-a-jun-2026.pdf
 *   - Deducciones: https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-ene-a-jun-2026.pdf
 *
 * Valores ANUALES (diciembre 2026 acumulado):
 *   - Ganancia no imponible (art. 30 inc a):      $5.151.802,50
 *   - Cónyuge (art. 30 inc b.1):                  $4.851.964,66
 *   - Hijo (art. 30 inc b.2):                     $2.446.863,48
 *   - Hijo incapacitado (art. 30 inc b.2.1):      $4.893.726,96
 *   - Deducción especial empleados (inc c apt 1): $18.031.308,76
 *
 * ARCA actualiza semestralmente por IPC INDEC. El fetcher
 * `scripts/update-data/fetchers/ganancias-escala.ts` patchea este archivo.
 * El prefijo `_` indica que es módulo interno: no es una calc con UI.
 */

// --- Valores ANUALES oficiales (primer semestre 2026, referencia) ---
// GNI:                            $5.151.802,50
// Deducción especial apartado 1:  $18.031.308,76
// Cónyuge:                        $4.851.964,66
// Hijo:                           $2.446.863,48
// Hijo incapacitado:              $4.893.726,96

/**
 * Mínimo no imponible efectivo mensual para trabajador en relación de dependencia
 * soltero sin cargas. Combina GNI + Deducción Especial apartado 1.
 * Cálculo: (5.151.802,50 + 18.031.308,76) / 12 = 1.931.925,94 ≈ 1_931_926
 * El fetcher patchea este valor como literal.
 */
export const MNI_MENSUAL_BASE = 1_931_926;

/** Deducción mensual por cónyuge a cargo: 4.851.964,66 / 12 ≈ 404_330 */
export const INCREMENTO_CONYUGE_MENSUAL = 404_330;

/** Deducción mensual por hijo a cargo: 2.446.863,48 / 12 ≈ 203_905 */
export const INCREMENTO_HIJO_MENSUAL = 203_905;

/** Deducción mensual por hijo incapacitado: 4.893.726,96 / 12 ≈ 407_811 */
export const INCREMENTO_HIJO_INCAPACITADO_MENSUAL = 407_811;

/**
 * @deprecated Usar `INCREMENTO_CONYUGE_MENSUAL` e `INCREMENTO_HIJO_MENSUAL`
 * por separado. Este promedio existe sólo por compatibilidad con código legacy.
 * Semánticamente incorrecto: cónyuge vale ~2× que un hijo según ARCA.
 */
export const INCREMENTO_POR_FAMILIAR = 304_118;

export interface TramoEscala {
  /** Tope mensual del tramo; la última usa Infinity para el excedente */
  hasta: number;
  /** Alícuota marginal del tramo (0.05 = 5%) */
  tasa: number;
  /** Impuesto acumulado al inicio del tramo (ya liquidado por tramos anteriores) */
  acumulado: number;
}

/**
 * Escala mensual 2026 — 9 tramos (5% a 35%).
 * Derivada de la tabla ENERO del PDF oficial: cada `hasta` es 1/12 del anual.
 * Fuente: Art. 94 LIG · RG 4003 · actualización IPC primer semestre 2026.
 */
export const ESCALA: TramoEscala[] = [
  { hasta: 166_669, tasa: 0.05, acumulado: 0 },
  { hasta: 333_338, tasa: 0.09, acumulado: 8_333 },
  { hasta: 500_008, tasa: 0.12, acumulado: 23_334 },
  { hasta: 750_011, tasa: 0.15, acumulado: 43_334 },
  { hasta: 1_500_023, tasa: 0.19, acumulado: 80_835 },
  { hasta: 2_250_034, tasa: 0.23, acumulado: 223_337 },
  { hasta: 3_375_051, tasa: 0.27, acumulado: 395_839 },
  { hasta: 5_062_576, tasa: 0.31, acumulado: 699_594 },
  { hasta: Infinity, tasa: 0.35, acumulado: 1_222_727 },
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
