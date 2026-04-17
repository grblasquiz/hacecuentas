/** ¿Cuántas semanas de inmersión hasta C1? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  semanas: number;
  meses: number;
  horasTotales: number;
  observacion: string;
}

export function inmersionSemanasC1(i: Inputs): Outputs {
  const nivelActual = String(i.nivelActual || 'b1');
  const horasActivas = Number(i.horasActivas) || 8;
  const dif = String(i.dificultadFsi || 'cat2');
  if (horasActivas <= 0) throw new Error('Horas activas inválidas');

  const TOTAL_C1: Record<string, number> = { cat1: 700, cat2: 900, cat3: 1100, cat4: 2200 };
  const YA: Record<string, number> = { a0: 0, a2: 200, b1: 400, b2: 650 };

  const total = TOTAL_C1[dif] ?? 900;
  const ya = YA[nivelActual] ?? 0;
  let restante = total - ya;
  if (restante < 50) restante = 50;

  const horasEfectivas = restante * 0.55;
  const semanas = horasEfectivas / (horasActivas * 7);
  const meses = semanas / 4.33;

  let obs = '';
  if (semanas < 6) obs = 'Tramo corto: necesitás base sólida previa.';
  else if (semanas < 20) obs = 'Inmersión estándar, año de intercambio.';
  else if (semanas < 40) obs = 'Programa largo: 6-9 meses sostenibles.';
  else obs = 'Considerá fraccionarlo en dos estadías.';

  return {
    semanas: Math.round(semanas),
    meses: Math.round(meses * 10) / 10,
    horasTotales: Math.round(horasEfectivas),
    observacion: obs,
  };

}
