/** Puntaje ponderado de postulación PAES — Universidad de Chile (admisión 2026).
 *  Fuente: DEMRE (factores de selección) y ponderaciones oficiales U. de Chile por carrera.
 *  El puntaje ponderado es la suma de cada factor (NEM, Ranking, Competencia Lectora,
 *  Matemática M1, Matemática M2 y prueba electiva Ciencias/Historia) multiplicado por su
 *  ponderación (%). Todos los puntajes van en la escala 100–1000. Las ponderaciones las fija
 *  cada carrera y deben sumar 100%. */

// Rango válido de la escala PAES/NEM/Ranking desde el Proceso de Admisión 2023.
const PUNTAJE_MIN = 100;
const PUNTAJE_MAX = 1000;

export interface Inputs {
  nem: number;
  ranking: number;
  lectora: number;
  matematicaM1: number;
  matematicaM2?: number;
  electiva?: number; // Ciencias o Historia y Cs. Sociales, según la carrera
  pondNem: number;
  pondRanking: number;
  pondLectora: number;
  pondM1: number;
  pondM2?: number;
  pondElectiva?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function clampPuntaje(n: number): number {
  return Math.max(PUNTAJE_MIN, Math.min(PUNTAJE_MAX, n));
}

export function compute(i: Inputs): Outputs {
  const nem = Number(i.nem) || 0;
  const ranking = Number(i.ranking) || 0;
  const lectora = Number(i.lectora) || 0;
  const m1 = Number(i.matematicaM1) || 0;
  const m2 = Number(i.matematicaM2) || 0;
  const electiva = Number(i.electiva) || 0;

  const pNem = Number(i.pondNem) || 0;
  const pRanking = Number(i.pondRanking) || 0;
  const pLectora = Number(i.pondLectora) || 0;
  const pM1 = Number(i.pondM1) || 0;
  const pM2 = Number(i.pondM2) || 0;
  const pElectiva = Number(i.pondElectiva) || 0;

  // Validar los puntajes de las pruebas que efectivamente ponderan (ponderación > 0).
  const usados: Array<[number, number, string]> = [
    [nem, pNem, 'NEM'],
    [ranking, pRanking, 'Ranking'],
    [lectora, pLectora, 'Competencia Lectora'],
    [m1, pM1, 'Matemática M1'],
    [m2, pM2, 'Matemática M2'],
    [electiva, pElectiva, 'prueba electiva'],
  ];
  for (const [puntaje, pond, nombre] of usados) {
    if (pond > 0 && (puntaje < PUNTAJE_MIN || puntaje > PUNTAJE_MAX)) {
      throw new Error(`El puntaje de ${nombre} debe estar entre ${PUNTAJE_MIN} y ${PUNTAJE_MAX}`);
    }
  }

  const sumaPond = pNem + pRanking + pLectora + pM1 + pM2 + pElectiva;
  if (sumaPond <= 0) throw new Error('Ingresá las ponderaciones (%) de la carrera');
  if (Math.abs(sumaPond - 100) > 0.5) {
    throw new Error(`Las ponderaciones deben sumar 100% (ahora suman ${sumaPond}%)`);
  }

  const puntajePonderado =
    clampPuntaje(nem) * (pNem / 100) +
    clampPuntaje(ranking) * (pRanking / 100) +
    clampPuntaje(lectora) * (pLectora / 100) +
    clampPuntaje(m1) * (pM1 / 100) +
    clampPuntaje(m2) * (pM2 / 100) +
    clampPuntaje(electiva) * (pElectiva / 100);

  const ponderadoRedondeado = Math.round(puntajePonderado * 100) / 100;

  const aporte = (p: number, pond: number) => Math.round(clampPuntaje(p) * (pond / 100) * 100) / 100;

  const _insight = {
    title: 'Tu puntaje ponderado',
    text: `Con estas notas y ponderaciones, tu puntaje ponderado de postulación es **${ponderadoRedondeado.toLocaleString('es-CL')}** puntos (escala 100–1000). Recordá que cada carrera fija sus propias ponderaciones vía DEMRE.`,
    tone: 'neutral',
    icon: '🎓',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'NEM', value: aporte(nem, pNem) },
      { label: 'Ranking', value: aporte(ranking, pRanking) },
      { label: 'Lectora', value: aporte(lectora, pLectora) },
      { label: 'M1', value: aporte(m1, pM1) },
      { label: 'M2', value: aporte(m2, pM2) },
      { label: 'Electiva', value: aporte(electiva, pElectiva) },
    ].filter((s) => s.value > 0),
    ariaLabel: `Puntaje ponderado ${ponderadoRedondeado} puntos, desglosado por el aporte de cada factor.`,
  };

  return {
    puntajePonderado: ponderadoRedondeado.toLocaleString('es-CL'),
    detalle: `Ponderado = NEM ${nem}×${pNem}% + Ranking ${ranking}×${pRanking}% + Lectora ${lectora}×${pLectora}% + M1 ${m1}×${pM1}%` +
      (pM2 > 0 ? ` + M2 ${m2}×${pM2}%` : '') +
      (pElectiva > 0 ? ` + Electiva ${electiva}×${pElectiva}%` : '') +
      ` = ${ponderadoRedondeado.toLocaleString('es-CL')} puntos.`,
    _insight,
    _chart,
  };
}
