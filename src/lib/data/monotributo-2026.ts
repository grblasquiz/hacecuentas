// ────────────────────────────────────────────────────────────────────────────
// MONOTRIBUTO 2026 — FUENTE ÚNICA DE VERDAD
// ────────────────────────────────────────────────────────────────────────────
// Fuente: ARCA oficial — https://www.afip.gob.ar/monotributo/categorias.asp
// Vigencia: desde 2026-08-01 (semestre ago-2026 / ene-2027, ajuste +16,8% por
//   IPC 1er semestre). Recategorización SEMESTRAL (enero y julio); la de
//   julio 2026 cierra el 5/8/2026 y el primer pago con valores nuevos es el 20/8.
// Validado (topes+cuotas): ARCA + Perfil + Infobae + calcularsueldo (2026-07-22).
//
// ⚠️ CAMBIO 2026 (reforma): "Locaciones y prestaciones de SERVICIOS" YA NO topea
//    en H — alcanza hasta K. Las categorías I, J y K aplican a servicios Y a venta
//    de bienes, con CUOTA DISTINTA (servicios paga más en las categorías altas).
//    Los TOPES de facturación son iguales para ambas actividades.
//
// Cualquier calc de monotributo debe importar de acá para no volver a desincronizarse.
// ────────────────────────────────────────────────────────────────────────────

/** Vigencia del dato (YYYY-MM-DD): escala vigente desde 2026-02-01 (recategorización semestral). Usada por src/lib/data-freshness.ts. */
export const DATA_AS_OF = '2026-08-01';

export type Cat = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
export type Actividad = 'servicios' | 'bienes';
export const CATEGORIAS: Cat[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

// Tope de ingresos brutos anuales (igual para servicios y bienes).
export const TOPES: Record<Cat, number> = {
  A: 12009410.45, B: 17595182.74, C: 24670494.31, D: 30628651.43,
  E: 36028231.33, F: 45151659.41, G: 53995798.87, H: 81924660.37,
  I: 91699761.90, J: 105012519.20, K: 126610838.75,
};

// Cuota mensual TOTAL (impuesto integrado + SIPA + obra social).
export const CUOTA_SERVICIOS: Record<Cat, number> = {
  A: 49527.18, B: 56379.00, C: 66020.00, D: 84614.00,
  E: 119811.00, F: 150784.00, G: 230612.00, H: 522706.00,
  I: 963747.00, J: 1167299.00, K: 1614446.02,
};

export const CUOTA_BIENES: Record<Cat, number> = {
  A: 49527.18, B: 56379.00, C: 64539.00, D: 82564.00,
  E: 108267.00, F: 129930.00, G: 158815.00, H: 317895.00,
  I: 474994.00, J: 580793.00, K: 702103.00,
};

// Proporción ilustrativa integrado / SIPA / obra social (para el donut).
// El dato exacto es el total; el desglose mantiene proporción aproximada.
export const PROP: Record<Cat, [number, number, number]> = {
  A: [7100, 20500, 15400], B: [13500, 22500, 15400], C: [23200, 24800, 15400],
  D: [38100, 27300, 15400], E: [72300, 30000, 19200], F: [99400, 33000, 23200],
  G: [126400, 36300, 27900], H: [286700, 39900, 33600], I: [467300, 43900, 40400],
  J: [544700, 48300, 48500], K: [632500, 53100, 58300],
};

// Parámetros físicos del régimen por categoría: superficie afectada (m²),
// energía eléctrica consumida (kWh/año) y alquileres devengados ($/año).
// ⚠️ Valores ORIENTATIVOS (superficie/energía son los históricos del régimen;
// alquileres sin verificación oficial 2026) — verificar contra ARCA en la
// próxima recategorización antes de confiar en ellos al límite.
export const PARAMS_FISICOS: Record<Cat, { superficie: number; energia: number; alquiler: number }> = {
  A: { superficie: 30, energia: 3330, alquiler: 219_014 },
  B: { superficie: 45, energia: 5000, alquiler: 219_014 },
  C: { superficie: 60, energia: 6700, alquiler: 438_028 },
  D: { superficie: 85, energia: 10000, alquiler: 438_028 },
  E: { superficie: 110, energia: 13000, alquiler: 657_042 },
  F: { superficie: 150, energia: 16500, alquiler: 657_042 },
  G: { superficie: 200, energia: 20000, alquiler: 876_057 },
  H: { superficie: 200, energia: 20000, alquiler: 1_095_071 },
  I: { superficie: 200, energia: 20000, alquiler: 1_095_071 },
  J: { superficie: 200, energia: 20000, alquiler: 1_314_085 },
  K: { superficie: 200, energia: 20000, alquiler: 1_314_085 },
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
  fuenteUrl: 'https://www.afip.gob.ar/monotributo/categorias.asp',
  recategorizacion: 'semestral (enero y julio)',
} as const;

export const fmtARS = (n: number): string =>
  '$' + Math.round(n).toLocaleString('es-AR');

export function cuota(cat: Cat, actividad: Actividad = 'servicios'): number {
  return (actividad === 'bienes' ? CUOTA_BIENES : CUOTA_SERVICIOS)[cat] ?? CUOTA_SERVICIOS.A;
}

export function tope(cat: Cat): number {
  return TOPES[cat] ?? TOPES.A;
}

// Componentes integrado / SIPA / obra social para una categoría y actividad.
export function componentes(cat: Cat, actividad: Actividad = 'servicios') {
  const t = cuota(cat, actividad);
  const [pi, ps, po] = PROP[cat] || PROP.A;
  const sum = pi + ps + po;
  const integrado = Math.round(t * pi / sum);
  const sipa = Math.round(t * ps / sum);
  const obraSocial = t - integrado - sipa;
  return { total: t, integrado, sipa, obraSocial };
}
