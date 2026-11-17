/** Snapshot oficial de noviembre 2026. No sustituye snapshots de otros meses.
 * Res. ANSES 304/2026, arts. 1–5; bono: Decreto 1296/2026 / IMSS noviembre.
 * Importes en ARS; el bono no integra el haber ni una proyección futura.
 */
export const ANSES_NOVIEMBRE_2026 = {
  periodo: 'noviembre 2026',
  vigenteDesde: '2026-11-01',
  haberMinimo: 444_158.46,
  haberMaximo: 2_988_765.82,
  puam: 355_326.77,
  pbu: 203_182.22,
  baseImponibleMinima: 149_592.45,
  baseImponibleMaxima: 4_861_685.38,
  fuente: 'Resolución ANSES 304/2026',
  fuenteUrl: 'https://www.argentina.gob.ar/normativa/nacional/resolucion-304-2026-431696/texto',
  bonoMaximo: 70_000,
  bonoFuenteUrl: 'https://www.argentina.gob.ar/trabajo/seguridadsocial/imss',
  lastReviewed: '2026-11-17',
} as const;
