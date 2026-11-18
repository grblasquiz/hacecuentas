/** Salario Mínimo, Vital y Móvil (SMVM) de Argentina, por mes de vigencia. */
export const SMVM_NORMAS = {
  '9/2025': {
    nombre: 'Resolución 9/2025 CNEPySMVyM',
    url: 'https://www.argentina.gob.ar/normativa/nacional/norma-420868/texto',
    publicada: '2025-12-03',
  },
  '4/2026': {
    nombre: 'Resolución 4/2026 CNEPySMVyM',
    url: 'https://www.argentina.gob.ar/normativa/nacional/norma-429565/texto',
    publicada: '2026-09-02',
  },
} as const;

type Norma = keyof typeof SMVM_NORMAS;
type Tramo = { periodo: string; mensual: number; hora: number; norma: Norma };

export const SMVM_CRONOGRAMA: readonly Tramo[] = [
  { periodo: '2025-11', mensual: 328_400, hora: 1_642, norma: '9/2025' },
  { periodo: '2025-12', mensual: 334_800, hora: 1_674, norma: '9/2025' },
  { periodo: '2026-01', mensual: 341_000, hora: 1_705, norma: '9/2025' },
  { periodo: '2026-02', mensual: 346_800, hora: 1_734, norma: '9/2025' },
  { periodo: '2026-03', mensual: 352_400, hora: 1_762, norma: '9/2025' },
  { periodo: '2026-04', mensual: 357_800, hora: 1_789, norma: '9/2025' },
  { periodo: '2026-05', mensual: 363_000, hora: 1_815, norma: '9/2025' },
  { periodo: '2026-06', mensual: 367_800, hora: 1_839, norma: '9/2025' },
  { periodo: '2026-07', mensual: 372_400, hora: 1_862, norma: '9/2025' },
  { periodo: '2026-08', mensual: 376_600, hora: 1_883, norma: '9/2025' },
  { periodo: '2026-09', mensual: 383_800, hora: 1_919, norma: '4/2026' },
  { periodo: '2026-10', mensual: 391_200, hora: 1_956, norma: '4/2026' },
  { periodo: '2026-11', mensual: 398_800, hora: 1_994, norma: '4/2026' },
  { periodo: '2026-12', mensual: 406_400, hora: 2_032, norma: '4/2026' },
  { periodo: '2027-01', mensual: 414_200, hora: 2_071, norma: '4/2026' },
  { periodo: '2027-02', mensual: 422_000, hora: 2_110, norma: '4/2026' },
  { periodo: '2027-03', mensual: 429_600, hora: 2_148, norma: '4/2026' },
  { periodo: '2027-04', mensual: 437_000, hora: 2_185, norma: '4/2026' },
];

export const SMVM_ULTIMA_REVISION = '2026-11-18';
export const SMVM_COBERTURA = `${SMVM_CRONOGRAMA[0].periodo}/${SMVM_CRONOGRAMA.at(-1)!.periodo}`;

// Lo actualiza el fetcher diario. Mantiene el mismo período en HTML, descargas y calculadoras.
export const SMVM_PERIODO_PUBLICADO = '2026-11';

export function smvmMesLegible(periodo: string): string {
  return new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', month: 'long', year: 'numeric' })
    .format(new Date(`${periodo}-01T00:00:00Z`)).replace(' de ', ' ');
}

export const SMVM_VIGENTE = SMVM_CRONOGRAMA.find((tramo) => tramo.periodo === SMVM_PERIODO_PUBLICADO)!;
export const SMVM_MENSUAL = SMVM_VIGENTE.mensual;
export const SMVM_HORA = SMVM_VIGENTE.hora;
export const SMVM_FECHA = smvmMesLegible(SMVM_VIGENTE.periodo);
export const SMVM_RESOLUCION = SMVM_NORMAS[SMVM_VIGENTE.norma].nombre;
export const SMVM_FUENTE_URL = SMVM_NORMAS[SMVM_VIGENTE.norma].url;

// Prestación general (Ley 24.013). Ambas resoluciones fijan los topes en 50% y 100% del SMVM vigente.
export const DESEMPLEO_PISO = SMVM_MENSUAL * 0.5;
export const DESEMPLEO_TECHO = SMVM_MENSUAL;
export const DESEMPLEO_ANSES_URL = 'https://www.anses.gob.ar/trabajo/desempleo/desempleo-para-trabajadores-en-relacion-de-dependencia';
