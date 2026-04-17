/** ¿Cuántos Meses para preparar IELTS? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  mesesRequeridos: number;
  horasTotales: number;
  intensidad: string;
  alerta: string;
}

export function mesesPrepararIelts(i: Inputs): Outputs {
  const actual = Number(i.bandActual) || 5.5;
  const obj = Number(i.bandObjetivo) || 7;
  const hsem = Number(i.horasSemana) || 5;
  if (obj <= actual) throw new Error('Objetivo debe ser mayor que actual');

  const gap = obj - actual;
  // Horas por band con curva no-lineal
  const HP = gap <= 0.5 ? 75 : gap <= 1 ? 180 : gap <= 1.5 ? 280 : gap <= 2 ? 400 : 600;
  // Multiplicador extra si parten de nivel bajo
  const multiplicador = actual < 5 ? 1.2 : 1;
  const horasTot = HP * multiplicador;
  const semanas = horasTot / hsem;
  const meses = Math.round(semanas / 4.33 * 10) / 10;

  let intensidad = '';
  if (hsem < 3) intensidad = 'Mantenimiento (no hay progreso real)';
  else if (hsem < 6) intensidad = 'Normal';
  else if (hsem < 11) intensidad = 'Intensivo';
  else if (hsem < 21) intensidad = 'Curso inmersivo';
  else intensidad = 'Full-time';

  let alerta = '';
  if (gap >= 2) alerta = 'Salto grande: considerá rendir un intermedio (ej. 6 → 6.5 → 7).';
  else if (hsem < 3) alerta = 'Con menos de 3 h/sem no hay progreso real. Subí horas o bajá meta.';
  else alerta = 'Plan viable si sostenés el ritmo.';

  return {
    mesesRequeridos: meses,
    horasTotales: Math.round(horasTot),
    intensidad,
    alerta,
  };

}
