// ────────────────────────────────────────────────────────────────────────────
// MONOTRIBUTO 2026 — FUENTE ÚNICA DE VERDAD
// ────────────────────────────────────────────────────────────────────────────
// Fuente: ARCA oficial — https://www.afip.gob.ar/monotributo/categorias.asp
// Vigencia: desde 2026-02-01. Recategorización SEMESTRAL (enero y julio);
//   la de julio 2026 cierra el 5/8/2026.
// Validado x3 (topes): ARCA + c5n + Estudio Bertora Brown. Cuotas: ARCA + c5n.
//
// ⚠️ CAMBIO 2026 (reforma): "Locaciones y prestaciones de SERVICIOS" YA NO topea
//    en H — alcanza hasta K. Las categorías I, J y K aplican a servicios Y a venta
//    de bienes, con CUOTA DISTINTA (servicios paga más en las categorías altas).
//    Los TOPES de facturación son iguales para ambas actividades.
//
// Cualquier calc de monotributo debe importar de acá para no volver a desincronizarse.
// ────────────────────────────────────────────────────────────────────────────

/** Vigencia del dato (YYYY-MM-DD): escala vigente desde 2026-02-01 (recategorización semestral). Usada por src/lib/data-freshness.ts. */
export const DATA_AS_OF = '2026-02-01';

export type Cat = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
export type Actividad = 'servicios' | 'bienes';
export const CATEGORIAS: Cat[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

// Tope de ingresos brutos anuales (igual para servicios y bienes).
export const TOPES: Record<Cat, number> = {
  A: 10277988.13, B: 15058447.71, C: 21113696.52, D: 26212853.42,
  E: 30833964.37, F: 38642048.36, G: 46211109.37, H: 70113407.33,
  I: 78479211.62, J: 89872640.30, K: 108357084.05,
};

// Cuota mensual TOTAL (impuesto integrado + SIPA + obra social).
export const CUOTA_SERVICIOS: Record<Cat, number> = {
  A: 42386.74, B: 48250.78, C: 56501.85, D: 72414.10,
  E: 102537.97, F: 129045.32, G: 197108.23, H: 447346.93,
  I: 824802.26, J: 999007.65, K: 1381687.90,
};

export const CUOTA_BIENES: Record<Cat, number> = {
  A: 42386.74, B: 48250.78, C: 55227.06, D: 70661.26,
  E: 92658.35, F: 111198.27, G: 135918.34, H: 272063.40,
  I: 406512.05, J: 497059.41, K: 600879.51,
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
  vigencia: '2026-02-01',
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
