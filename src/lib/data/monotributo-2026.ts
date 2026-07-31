// ────────────────────────────────────────────────────────────────────────────
// MONOTRIBUTO 2026 — FUENTE ÚNICA DE VERDAD
// ────────────────────────────────────────────────────────────────────────────
// Fuente: ARCA oficial — https://www.afip.gob.ar/monotributo/categorias.asp
// Vigencia: desde 2026-08-01 (semestre ago-2026 / ene-2027, ajuste +16,8% por
//   IPC 1er semestre). Recategorización SEMESTRAL (febrero y agosto); la del
//   segundo semestre 2026 cierra el 5/8 y el primer pago con valores nuevos es el 20/8.
// Validado (topes+cuotas): ARCA + Perfil + Infobae + calcularsueldo (2026-07-22).
//
// CAMBIO VIGENTE DESDE 2024: "Locaciones y prestaciones de SERVICIOS" ya no topea
//    en H — alcanza hasta K. Las categorías I, J y K aplican a servicios Y a venta
//    de bienes, con CUOTA DISTINTA (servicios paga más en las categorías altas).
//    Los TOPES de facturación son iguales para ambas actividades.
//
// Cualquier calc de monotributo debe importar de acá para no volver a desincronizarse.
// ────────────────────────────────────────────────────────────────────────────

/** Vigencia del dato (YYYY-MM-DD): escala aplicable desde agosto 2026. */
export const DATA_AS_OF = '2026-08-01';

export type Cat = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
export type Actividad = 'servicios' | 'bienes';
export const CATEGORIAS: Cat[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
export const PRECIO_UNITARIO_MAX_BIENES = 716_840.77;

// Tope de ingresos brutos anuales (igual para servicios y bienes).
export const TOPES: Record<Cat, number> = {
  A: 12009410.45, B: 17595182.74, C: 24670494.31, D: 30628651.43,
  E: 36028231.33, F: 45151659.41, G: 53995798.87, H: 81924660.37,
  I: 91699761.90, J: 105012519.20, K: 126610838.75,
};

// Cuota mensual TOTAL (impuesto integrado + SIPA + obra social).
export const CUOTA_SERVICIOS: Record<Cat, number> = {
  A: 49527.18, B: 56379.08, C: 66020.12, D: 84612.93,
  E: 119811.45, F: 150784.21, G: 230312.94, H: 522706.68,
  I: 963747.86, J: 1167299.76, K: 1614446.04,
};

export const CUOTA_BIENES: Record<Cat, number> = {
  A: 49527.18, B: 56379.08, C: 64530.58, D: 82564.81,
  E: 108267.51, F: 129930.65, G: 158815.05, H: 317895.01,
  I: 474992.78, J: 580793.69, K: 702103.24,
};

export const IMPUESTO_SERVICIOS: Record<Cat, number> = {
  A: 5585.77, B: 10612.98, C: 18246.86, D: 29790.79, E: 55857.73,
  F: 78573.20, G: 142995.76, H: 409623.31, I: 814591.79, J: 977510.14, K: 1368514.20,
};
export const IMPUESTO_BIENES: Record<Cat, number> = {
  A: 5585.77, B: 10612.98, C: 16757.32, D: 27742.67, E: 44313.79,
  F: 57719.64, G: 71497.87, H: 204811.64, I: 325836.71, J: 391004.07, K: 456171.40,
};
export const APORTE_SIPA: Record<Cat, number> = {
  A: 18246.86, B: 20071.55, C: 22078.71, D: 24286.58, E: 26715.24,
  F: 29386.76, G: 41141.46, H: 57598.04, I: 80637.26, J: 112892.16, K: 158049.02,
};
export const APORTE_OBRA_SOCIAL: Record<Cat, number> = {
  A: 25694.55, B: 25694.55, C: 25694.55, D: 30535.56, E: 37238.48,
  F: 42824.25, G: 46175.72, H: 55485.33, I: 68518.81, J: 76897.46, K: 87882.82,
};

// Parámetros físicos del régimen por categoría: superficie afectada (m²),
// energía eléctrica consumida (kWh/año) y alquileres devengados ($/año).
// Valores oficiales ARCA con aplicación desde 2026-08-01.
export const PARAMS_FISICOS: Record<Cat, { superficie: number; energia: number; alquiler: number }> = {
  A: { superficie: 30, energia: 3330, alquiler: 2_792_886.15 },
  B: { superficie: 45, energia: 5000, alquiler: 2_792_886.15 },
  C: { superficie: 60, energia: 6700, alquiler: 3_816_944.41 },
  D: { superficie: 85, energia: 10000, alquiler: 3_816_944.41 },
  E: { superficie: 110, energia: 13000, alquiler: 4_841_002.66 },
  F: { superficie: 150, energia: 16500, alquiler: 4_841_002.66 },
  G: { superficie: 200, energia: 20000, alquiler: 5_771_964.69 },
  H: { superficie: 200, energia: 20000, alquiler: 8_378_658.45 },
  I: { superficie: 200, energia: 20000, alquiler: 8_378_658.45 },
  J: { superficie: 200, energia: 20000, alquiler: 8_378_658.45 },
  K: { superficie: 200, energia: 20000, alquiler: 8_378_658.45 },
};

/** Categoría mínima cuyo tope de ingresos brutos anuales cubre `anual`,
 *  o null si excede el tope de K (excluido del régimen). */
export function categoriaPorIngresos(anual: number): Cat | null {
  for (const c of CATEGORIAS) {
    if (anual <= TOPES[c]) return c;
  }
  return null;
}

export const META = {
  vigencia: '2026-08-01',
  fuente: 'ARCA',
  fuenteUrl: 'https://ftp.afip.gob.ar/monotributo/categorias.asp',
  recategorizacion: 'semestral (febrero y agosto)',
} as const;

export const fmtARS = (n: number): string =>
  '$' + Math.round(n).toLocaleString('es-AR');

export function cuota(cat: Cat, actividad: Actividad = 'servicios'): number {
  return (actividad === 'bienes' ? CUOTA_BIENES : CUOTA_SERVICIOS)[cat] ?? CUOTA_SERVICIOS.A;
}

export function tope(cat: Cat): number {
  return TOPES[cat] ?? TOPES.A;
}

// Componentes oficiales: impuesto integrado + SIPA + obra social individual.
export function componentes(cat: Cat, actividad: Actividad = 'servicios') {
  const integrado = (actividad === 'bienes' ? IMPUESTO_BIENES : IMPUESTO_SERVICIOS)[cat];
  const sipa = APORTE_SIPA[cat];
  const obraSocial = APORTE_OBRA_SOCIAL[cat];
  const t = integrado + sipa + obraSocial;
  return { total: t, integrado, sipa, obraSocial };
}
