/**
 * Conversor talle USA (US) → Europa (EU) para zapatillas.
 *
 * Fórmula base (Paris Point):
 *   EU = US + 33 (hombre)
 *   EU = US + 31 (mujer)
 *   EU = US + 32 (niños 1-6) / + 33 (niños 7-12)
 *
 * Tablas oficiales Nike/Adidas/Puma + ISO 9407 (Mondopoint).
 */

export interface Inputs {
  talleUsa: number;
  genero: string;
}

export interface Outputs {
  talleEu: string;
  talleUk: string;
  cmPie: string;
  consejo: string;
}

// Tablas oficiales redondeadas según fabricantes (Nike, Adidas)
// [US, EU, UK, pie_cm]
const TABLA_HOMBRE: Array<[number, number, number, number]> = [
  [6, 38.5, 5.5, 24.1],
  [6.5, 39, 6, 24.4],
  [7, 40, 6, 24.8],
  [7.5, 40.5, 6.5, 25.1],
  [8, 41, 7, 25.4],
  [8.5, 42, 7.5, 25.7],
  [9, 42.5, 8, 26.0],
  [9.5, 43, 8.5, 26.7],
  [10, 44, 9, 27.3],
  [10.5, 44.5, 9.5, 27.6],
  [11, 45, 10, 27.9],
  [11.5, 45.5, 10.5, 28.3],
  [12, 46, 11, 28.5],
  [12.5, 46.5, 11.5, 28.9],
  [13, 47, 12, 29.2],
  [14, 48, 13, 30.2],
];

const TABLA_MUJER: Array<[number, number, number, number]> = [
  [5, 35.5, 2.5, 22.0],
  [5.5, 36, 3, 22.5],
  [6, 36.5, 3.5, 23.0],
  [6.5, 37, 4, 23.5],
  [7, 37.5, 4.5, 24.0],
  [7.5, 38, 5, 24.5],
  [8, 39, 5.5, 25.0],
  [8.5, 39.5, 6, 25.5],
  [9, 40, 6.5, 26.0],
  [9.5, 40.5, 7, 26.5],
  [10, 41, 7.5, 27.0],
  [10.5, 41.5, 8, 27.5],
  [11, 42, 8.5, 28.0],
  [12, 43.5, 9.5, 29.0],
];

const TABLA_NINOS: Array<[number, number, number, number]> = [
  [1, 32, 0.5, 19.5],
  [2, 33, 1.5, 20.5],
  [3, 34, 2.5, 21.5],
  [4, 35, 3, 22.0],
  [5, 36, 4, 22.5],
  [6, 37, 5, 23.0],
  [7, 38, 6, 24.0],
];

function buscarEnTabla(us: number, tabla: Array<[number, number, number, number]>) {
  // Match exacto
  const exact = tabla.find(([u]) => u === us);
  if (exact) return exact;
  // Interpolación entre los dos más cercanos
  const lower = [...tabla].reverse().find(([u]) => u <= us);
  const upper = tabla.find(([u]) => u >= us);
  if (!lower || !upper) return null;
  if (lower[0] === upper[0]) return lower;
  const t = (us - lower[0]) / (upper[0] - lower[0]);
  return [
    us,
    Math.round((lower[1] + (upper[1] - lower[1]) * t) * 2) / 2, // round al 0.5
    Math.round((lower[2] + (upper[2] - lower[2]) * t) * 2) / 2,
    Math.round((lower[3] + (upper[3] - lower[3]) * t) * 10) / 10,
  ] as [number, number, number, number];
}

export function zapatillaUsaEuropaConversion(inputs: Inputs): Outputs {
  const us = Number(inputs.talleUsa);
  const genero = String(inputs.genero || 'hombre');

  if (!us || us < 1 || us > 18) {
    return {
      talleEu: '—',
      talleUk: '—',
      cmPie: '—',
      consejo: 'Ingresá un talle USA válido (entre 1 y 18).',
    };
  }

  let tabla: Array<[number, number, number, number]>;
  let sufijo = '';
  if (genero === 'mujer') {
    tabla = TABLA_MUJER;
    sufijo = ' (mujer)';
  } else if (genero === 'nino') {
    tabla = TABLA_NINOS;
    sufijo = ' (niño)';
  } else {
    tabla = TABLA_HOMBRE;
    sufijo = ' (hombre)';
  }

  const match = buscarEnTabla(us, tabla);
  if (!match) {
    // Estimación por fórmula fuera de tabla
    const offset = genero === 'mujer' ? 31 : genero === 'nino' ? 32 : 33;
    const euAprox = us + offset;
    const ukAprox = us - (genero === 'mujer' ? 1.5 : 1);
    const cmAprox = Math.round((18 + us * 0.85) * 10) / 10;
    return {
      talleEu: `EU ${euAprox.toFixed(1)}${sufijo}`,
      talleUk: `UK ${ukAprox.toFixed(1)}`,
      cmPie: `${cmAprox} cm`,
      consejo: 'Estimación por fórmula Paris Point (fuera de tabla estándar).',
    };
  }

  const [, eu, uk, cm] = match;

  // Tip contextual según el genero/talla
  let consejo = '';
  if (genero === 'hombre') {
    if (us <= 7) consejo = 'Talle chico para hombre — valorá si Youth te queda (más barato).';
    else if (us >= 12) consejo = 'Talle grande — verificá disponibilidad, a veces requieren wide fit.';
    else consejo = 'Ante duda, Nike suele correr 0.5 más chico, Adidas/Puma son fieles a la tabla.';
  } else if (genero === 'mujer') {
    if (us <= 6) consejo = 'Talle chico mujer — en algunas marcas podés probar Youth (equivalente US 6 mujer ≈ US 4.5 Youth).';
    else if (us >= 11) consejo = 'Talle grande mujer — algunas marcas no tienen stock. Considerar tallas hombre (restá 1.5).';
    else consejo = 'Ante duda, subí medio talle. Mejor que te quede flojo que apretado.';
  } else {
    consejo = 'Niños crecen rápido: considerá medio o un talle más para que duren el año.';
  }

  return {
    talleEu: `EU ${eu}${sufijo}`,
    talleUk: `UK ${uk}`,
    cmPie: `${cm} cm`,
    consejo,
  };
}
