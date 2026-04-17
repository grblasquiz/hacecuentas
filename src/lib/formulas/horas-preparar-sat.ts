/** Horas para preparar SAT */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  semanas: number;
  meses: number;
  factibilidad: string;
}

export function horasPrepararSat(i: Inputs): Outputs {
  const ac = Number(i.scoreActual) || 1200;
  const obj = Number(i.scoreObjetivo) || 1500;
  const hsem = Number(i.horasSemana) || 10;
  if (obj <= ac) throw new Error('Objetivo debe ser mayor que actual');
  if (ac < 400 || obj > 1600) throw new Error('Score entre 400-1600');

  const gap = obj - ac;
  // Curva: horas/punto crece con score alto
  let hxp = 0.4; // base
  if (obj > 1400) hxp = 0.6;
  if (obj > 1500) hxp = 0.8;
  if (obj > 1550) hxp = 1.0;

  let horas = gap * hxp;
  // Extra si parten muy bajo
  if (ac < 1000) horas *= 1.3;

  const sem = horas / hsem;
  const meses = Math.round(sem / 4.33 * 10) / 10;

  let fact = '';
  if (meses < 1) fact = 'Plazo agresivo — rindás full-time.';
  else if (meses < 3) fact = 'Plazo realista con disciplina.';
  else if (meses < 6) fact = 'Plan sostenible.';
  else fact = 'Plan largo — considerá reducir horas/sem o objetivo intermedio.';

  return {
    horasTotales: Math.round(horas),
    semanas: Math.round(sem),
    meses,
    factibilidad: fact,
  };

}
