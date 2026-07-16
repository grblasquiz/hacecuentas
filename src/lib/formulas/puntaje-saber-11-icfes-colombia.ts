/**
 * Puntaje global Saber 11 (ICFES) — Colombia.
 * Fórmula OFICIAL de ponderación del ICFES: el puntaje global (0 a 500) se obtiene
 * ponderando las 5 pruebas con pesos 3-3-3-3-1 (Lectura Crítica, Matemáticas,
 * Sociales y Ciudadanas, Ciencias Naturales y, con peso 1, Inglés), sobre un divisor
 * de 13, escalado por 5. Cada prueba se reporta en la escala 0-100.
 * Utilidad pura (la fórmula no depende de ningún dato fiscal que rote): frequency "never".
 */

export interface Inputs {
  lecturaCritica: number;
  matematicas: number;
  socialesCiudadanas: number;
  cienciasNaturales: number;
  ingles: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: any): number {
  if (v === undefined || v === null || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function compute(i: Inputs): Outputs {
  const crudos: Array<[string, number]> = [
    ['Lectura Crítica', num(i.lecturaCritica)],
    ['Matemáticas', num(i.matematicas)],
    ['Sociales y Ciudadanas', num(i.socialesCiudadanas)],
    ['Ciencias Naturales', num(i.cienciasNaturales)],
    ['Inglés', num(i.ingles)],
  ];
  if (crudos.some(([, v]) => !Number.isFinite(v))) {
    throw new Error('Ingresá el puntaje (0 a 100) de las 5 pruebas del examen Saber 11');
  }

  const areas = crudos.map(([nombre, v]) => [nombre, clamp(v, 0, 100)] as [string, number]);
  const [LC, Mat, Soc, CN, Ing] = areas.map(([, v]) => v);

  // Fórmula oficial ICFES: pesos 3/3/3/3/1, divisor 13, escala ×5 → global 0..500.
  const ponderado = (3 * LC + 3 * Mat + 3 * Soc + 3 * CN + 1 * Ing) / 13; // 0..100
  const global = clamp(Math.round(ponderado * 5), 0, 500);
  const promedio = global / 5; // 0..100 (equivalente al ponderado, en la misma escala de cada prueba)

  let nivel: string;
  if (global <= 250) nivel = 'Bajo / medio-bajo';
  else if (global <= 350) nivel = 'Medio';
  else if (global <= 450) nivel = 'Alto';
  else nivel = 'Superior';

  const ordenadas = [...areas].sort((a, b) => b[1] - a[1]);
  const destacada = ordenadas[0];
  const aMejorar = ordenadas[ordenadas.length - 1];

  const fmt1 = (n: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(n);

  const _insight = {
    title: `Puntaje global: ${global} / 500`,
    text: `Con Lectura Crítica **${LC}**, Matemáticas **${Mat}**, Sociales **${Soc}**, Ciencias **${CN}** e Inglés **${Ing}**, tu puntaje global ponderado da **${global}** sobre 500 (nivel **${nivel.toLowerCase()}**). Tu prueba más fuerte es **${destacada[0]}** (${destacada[1]}) y la que más te conviene reforzar es **${aMejorar[0]}** (${aMejorar[1]}). Recordá que Inglés pesa 1 y las otras cuatro pruebas pesan 3 cada una.`,
    tone: global >= 351 ? 'good' : 'info',
    icon: '🎓',
  };

  const _chart = {
    type: 'bar',
    labels: ['Lect. Crítica', 'Matemáticas', 'Sociales', 'Ciencias', 'Inglés'],
    values: [LC, Mat, Soc, CN, Ing],
    ariaLabel: `Puntaje por prueba: Lectura Crítica ${LC}, Matemáticas ${Mat}, Sociales ${Soc}, Ciencias ${CN}, Inglés ${Ing}. Global ponderado ${global} sobre 500.`,
  };

  return {
    puntajeGlobal: `${global} / 500`,
    promedioPonderado: `${fmt1(promedio)} / 100`,
    nivelDesempeno: nivel,
    areaDestacada: `${destacada[0]} (${destacada[1]}/100)`,
    detalle: `(3×${LC} + 3×${Mat} + 3×${Soc} + 3×${CN} + 1×${Ing}) ÷ 13 × 5 = ${global} sobre 500. Prueba más fuerte: ${destacada[0]} (${destacada[1]}); a reforzar: ${aMejorar[0]} (${aMejorar[1]}).`,
    _insight,
    _chart,
  };
}
