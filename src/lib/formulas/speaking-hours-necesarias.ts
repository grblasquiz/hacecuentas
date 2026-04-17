/** Horas de Speaking Necesarias por Nivel */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasNecesarias: number;
  semanas: number;
  meses: number;
  clasesSemanales: number;
  tip: string;
}

export function speakingHoursNecesarias(i: Inputs): Outputs {
  const actual = String(i.nivelActual || 'b1');
  const meta = String(i.nivelMeta || 'b2');
  const hsem = Number(i.horasSemana) || 3;
  if (hsem <= 0) throw new Error('Horas por semana inválidas');

  const ACUM: Record<string, number> = { a1: 10, a2: 30, b1: 90, b2: 190, c1: 340 };
  const horasNec = Math.max(0, (ACUM[meta] || 190) - (ACUM[actual] || 90));
  if (horasNec === 0) throw new Error('Meta debe ser mayor al nivel actual');

  const sem = Math.round(horasNec / hsem);
  const meses = Math.round(sem / 4.33 * 10) / 10;
  const clases = Math.ceil(hsem);

  let tip = '';
  if (hsem < 2) tip = 'Muy poco para progreso real. Sumá monólogos grabados.';
  else if (hsem < 5) tip = 'Ritmo sostenible. Combiná 1:1 con intercambio gratis.';
  else tip = 'Muy intenso. Considerá un período de inmersión.';

  return {
    horasNecesarias: horasNec,
    semanas: sem,
    meses,
    clasesSemanales: clases,
    tip,
  };

}
