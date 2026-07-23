/**
 * Curva de crecimiento canino compartida por las calcs de peso ideal por raza.
 *
 * Las calcs de peso-ideal-<raza> respondían el rango ADULTO incluso cuando el
 * usuario elegía "cachorro" — pero la demanda real de búsqueda es "cuánto debe
 * pesar un <raza> de 2 meses". Este helper convierte el rango adulto de la raza
 * en el peso esperado a una edad concreta, usando el patrón de crecimiento
 * estándar por tamaño de raza.
 *
 * Fuente del patrón: curvas de crecimiento canino WALTHAM / Salt et al.,
 * "Growth standard charts for monitoring bodyweight in dogs of different sizes"
 * (PLOS ONE, 2017). Son percentiles poblacionales: el ritmo real de un cachorro
 * varía por línea genética, castración y alimentación.
 */

export type TamanoRaza = 'toy' | 'pequena' | 'mediana' | 'grande' | 'gigante';

/** % del peso adulto alcanzado a cada edad, por tamaño de raza. */
const CURVAS: Record<TamanoRaza, Array<[number, number]>> = {
  // [meses, fracción del peso adulto]
  toy:      [[2, 0.28], [3, 0.42], [4, 0.56], [5, 0.68], [6, 0.80], [8, 0.92], [10, 0.98], [12, 1.00]],
  pequena:  [[2, 0.24], [3, 0.37], [4, 0.50], [5, 0.62], [6, 0.74], [8, 0.88], [10, 0.96], [12, 1.00]],
  mediana:  [[2, 0.22], [3, 0.33], [4, 0.45], [5, 0.57], [6, 0.68], [8, 0.80], [10, 0.90], [12, 0.96], [15, 1.00]],
  grande:   [[2, 0.17], [3, 0.27], [4, 0.37], [5, 0.46], [6, 0.55], [8, 0.70], [10, 0.80], [12, 0.88], [15, 0.95], [18, 1.00]],
  gigante:  [[2, 0.15], [3, 0.24], [4, 0.32], [5, 0.40], [6, 0.48], [8, 0.62], [10, 0.72], [12, 0.80], [15, 0.90], [18, 0.96], [24, 1.00]],
};

/** Edad a la que la raza cierra el crecimiento, por tamaño. */
const CIERRE: Record<TamanoRaza, number> = {
  toy: 12, pequena: 12, mediana: 15, grande: 18, gigante: 24,
};

/** Clasifica la raza por su peso adulto promedio (kg). */
export function tamanoPorPeso(pesoAdultoPromedio: number): TamanoRaza {
  if (pesoAdultoPromedio < 5) return 'toy';
  if (pesoAdultoPromedio < 11) return 'pequena';
  if (pesoAdultoPromedio < 26) return 'mediana';
  if (pesoAdultoPromedio < 45) return 'grande';
  return 'gigante';
}

/** Fracción del peso adulto a `meses`, interpolada linealmente entre hitos. */
export function fraccionAdulto(meses: number, tamano: TamanoRaza): number {
  const curva = CURVAS[tamano];
  if (meses <= curva[0][0]) {
    // Extrapolación hacia abajo: proporcional desde el nacimiento (~1% del adulto).
    const [m0, f0] = curva[0];
    return Math.max(0.02, (meses / m0) * f0);
  }
  for (let i = 1; i < curva.length; i++) {
    const [m1, f1] = curva[i];
    if (meses <= m1) {
      const [m0, f0] = curva[i - 1];
      return f0 + ((meses - m0) / (m1 - m0)) * (f1 - f0);
    }
  }
  return 1;
}

export interface PesoCachorro {
  min: number;
  max: number;
  promedio: number;
  /** % del peso adulto, redondeado */
  porcentaje: number;
  /** Meses hasta cerrar el crecimiento */
  cierreMeses: number;
}

/** Peso esperado a los `meses` indicados, a partir del rango adulto de la raza. */
export function pesoALosMeses(
  minAdulto: number,
  maxAdulto: number,
  meses: number,
  tamano: TamanoRaza
): PesoCachorro {
  const f = fraccionAdulto(meses, tamano);
  const min = minAdulto * f;
  const max = maxAdulto * f;
  return {
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1)),
    promedio: Number(((min + max) / 2).toFixed(1)),
    porcentaje: Math.round(f * 100),
    cierreMeses: CIERRE[tamano],
  };
}

/** Hitos de la curva para tablas y gráficos (misma fuente que el cálculo). */
export function hitosCurva(tamano: TamanoRaza): number[] {
  return CURVAS[tamano].map(([m]) => m);
}

/**
 * Serie completa para el gráfico de crecimiento: peso mínimo y máximo esperado
 * en cada hito de la curva. Garantiza que el gráfico y la tabla nunca se
 * desincronicen del número que devuelve la calculadora.
 */
export function serieCrecimiento(minAdulto: number, maxAdulto: number, tamano: TamanoRaza) {
  return hitosCurva(tamano).map((m) => {
    const p = pesoALosMeses(minAdulto, maxAdulto, m, tamano);
    return { meses: m, min: p.min, max: p.max, promedio: p.promedio, porcentaje: p.porcentaje };
  });
}

/** Opciones de edad para el select de las calcs de peso por raza. */
export function opcionesEdad(tamano: TamanoRaza) {
  const opts = hitosCurva(tamano).map((m) => ({
    value: `m${m}`,
    label: `${m} meses (cachorro)`,
  }));
  opts.push({ value: 'adulto', label: `Adulto (${Math.round(CIERRE[tamano] / 12) || 1}-7 años)` });
  opts.push({ value: 'senior', label: 'Senior (más de 7 años)' });
  return opts;
}

/** Kilos con coma decimal (es-AR) y sin decimal inútil: 4,3 · 24 · 0,6 */
export function fmtKg(n: number): string {
  const r = Number(n.toFixed(1));
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace('.', ',');
}

/** Parsea el value del select de edad. Devuelve meses o null si es adulto/senior. */
export function mesesDeEdad(edad: string): number | null {
  const m = /^m(\d+)$/.exec(String(edad || ''));
  if (m) return Number(m[1]);
  if (edad === 'cachorro') return 6; // compat: valor histórico del select viejo
  return null;
}
