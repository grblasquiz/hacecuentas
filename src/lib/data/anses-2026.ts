/** Valores previsionales ANSES vigentes para agosto de 2026. */
export const ANSES_2026 = {
  periodo: 'agosto 2026',
  vigenteDesde: '2026-08-01',
  haberMinimo: 419_775.93,
  haberMaximo: 2_824_694.49,
  puam: 335_820.74,
  pbu: 192_028.32,
  baseImponibleMaxima: 4_594_798.23,
  fuente: 'Resolución ANSES 232/2026',
  fuenteUrl: 'https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-232-2026-428341',
  lastReviewed: '2026-08-31',
} as const;

export const HABER_MINIMO_ANSES = ANSES_2026.haberMinimo;
export const PUAM_ANSES = ANSES_2026.puam;
