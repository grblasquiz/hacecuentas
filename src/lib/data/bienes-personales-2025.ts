/** Bienes Personales, período fiscal 2025 (DDJJ presentada en 2026). Fuente: ARCA. */
export const BIENES_PERSONALES_2025 = {
  periodoFiscal: 2025,
  minimoNoImponible: 384_728_044.57,
  casaHabitacionExentaHasta: 1_346_548_155.99,
  escala: [
    { hasta: 52_664_283.73, tasa: 0.005, acumulado: 0 },
    { hasta: 114_105_948.16, tasa: 0.0075, acumulado: 263_321.42 },
    { hasta: Infinity, tasa: 0.01, acumulado: 724_133.89 },
  ],
  fuenteUrl: 'https://www.arca.gob.ar/gananciasYBienes/bienes-personales/conceptos-basicos/alicuotas.asp',
  lastReviewed: '2026-08-31',
} as const;
