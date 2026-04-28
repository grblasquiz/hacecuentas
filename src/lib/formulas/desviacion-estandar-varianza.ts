export interface Inputs {
  values: string;
  population_type: string;
}

export interface Outputs {
  mean: number;
  variance: number;
  std_dev: number;
  cv: number;
  count: number;
  interval_1sigma: string;
  interval_2sigma: string;
  interval_3sigma: string;
  error_msg: string;
}

/**
 * Parsea una cadena de texto con números separados por coma, punto y coma o espacios.
 * Acepta decimales con punto o coma.
 */
function parseValues(raw: string): number[] {
  // Normalizar separadores decimales: primero detectar si hay comas ambiguas
  // Estrategia: reemplazar punto y coma por pipe, luego coma por pipe,
  // luego separar por pipe o espacio.
  const normalized = raw
    .replace(/;/g, '|')
    .replace(/,/g, '|')
    .replace(/\s+/g, '|');

  const tokens = normalized.split('|').map(t => t.trim()).filter(t => t.length > 0);

  const numbers: number[] = [];
  for (const token of tokens) {
    // Intentar parsear directamente
    const n = parseFloat(token);
    if (!isNaN(n)) {
      numbers.push(n);
    }
  }
  return numbers;
}

/**
 * Formatea un número con hasta 4 decimales significativos, eliminando ceros finales.
 */
function fmt(n: number): string {
  return parseFloat(n.toFixed(4)).toString();
}

export function compute(i: Inputs): Outputs {
  const DEFAULT_OUTPUT: Outputs = {
    mean: 0,
    variance: 0,
    std_dev: 0,
    cv: 0,
    count: 0,
    interval_1sigma: '—',
    interval_2sigma: '—',
    interval_3sigma: '—',
    error_msg: ''
  };

  const rawValues = typeof i.values === 'string' ? i.values : String(i.values ?? '');
  const populationType = typeof i.population_type === 'string' ? i.population_type : 'sample';

  const nums = parseValues(rawValues);
  const n = nums.length;

  if (n === 0) {
    return {
      ...DEFAULT_OUTPUT,
      error_msg: 'Ingresa al menos un valor numérico válido.'
    };
  }

  if (n === 1 && populationType === 'sample') {
    return {
      ...DEFAULT_OUTPUT,
      count: 1,
      mean: nums[0],
      error_msg: 'La desviación estándar muestral requiere al menos 2 valores (n−1 = 0 no está definido).'
    };
  }

  // --- Media aritmética ---
  const sum = nums.reduce((acc, x) => acc + x, 0);
  const mean = sum / n;

  // --- Suma de cuadrados de diferencias ---
  const sumSqDiff = nums.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);

  // --- Varianza ---
  // Muestral: divide entre (n-1) — corrección de Bessel
  // Poblacional: divide entre n
  const denominator = populationType === 'population' ? n : n - 1;
  const variance = sumSqDiff / denominator;

  // --- Desviación estándar ---
  const std_dev = Math.sqrt(variance);

  // --- Coeficiente de variación ---
  // CV = (σ / |μ|) * 100
  // Indefinido si la media es 0
  let cv = 0;
  if (Math.abs(mean) > 1e-12) {
    cv = (std_dev / Math.abs(mean)) * 100;
  }

  // --- Intervalos de la regla empírica (68-95-99.7) ---
  // Válidos solo bajo supuesto de normalidad aproximada
  const lo1 = mean - 1 * std_dev;
  const hi1 = mean + 1 * std_dev;
  const lo2 = mean - 2 * std_dev;
  const hi2 = mean + 2 * std_dev;
  const lo3 = mean - 3 * std_dev;
  const hi3 = mean + 3 * std_dev;

  const interval_1sigma = `[${fmt(lo1)}, ${fmt(hi1)}]`;
  const interval_2sigma = `[${fmt(lo2)}, ${fmt(hi2)}]`;
  const interval_3sigma = `[${fmt(lo3)}, ${fmt(hi3)}]`;

  // Aviso informativo si n es pequeño
  let error_msg = '';
  if (n < 5) {
    error_msg = `Nota: con solo ${n} valor(es), los resultados son orientativos. Se recomienda trabajar con al menos 5 datos.`;
  }

  return {
    mean,
    variance,
    std_dev,
    cv,
    count: n,
    interval_1sigma,
    interval_2sigma,
    interval_3sigma,
    error_msg
  };
}
