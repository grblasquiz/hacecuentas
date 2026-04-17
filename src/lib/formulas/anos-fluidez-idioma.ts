/** ¿Cuántos años para alcanzar fluidez? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  anos: number;
  horasTotal: number;
  horasSemana: number;
  comentario: string;
}

export function anosFluidezIdioma(i: Inputs): Outputs {
  const minutosDia = Number(i.minutosDia) || 60;
  const dificultad = String(i.dificultad || 'cat1');
  const meta = String(i.metaFluidez || 'b2');
  if (minutosDia <= 0) throw new Error('Minutos por día inválidos');

  const TABLA: Record<string, Record<string, number>> = {
    cat1: { b2: 550, c1: 700, c2: 1000 },
    cat2: { b2: 700, c1: 900, c2: 1200 },
    cat3: { b2: 950, c1: 1200, c2: 1500 },
    cat4: { b2: 1600, c1: 2200, c2: 3000 },
  };
  const horasTotal = TABLA[dificultad]?.[meta] ?? 700;
  const horasSemana = (minutosDia * 7) / 60;
  const anos = horasTotal / (horasSemana * 52);

  let comentario = '';
  if (anos < 1) comentario = 'Proyecto corto, sostenible sin fatiga.';
  else if (anos < 3) comentario = 'Proyecto medio. Sumá hitos cada 3 meses.';
  else if (anos < 5) comentario = 'Largo: considerá inmersión para acelerar.';
  else comentario = 'Muy largo: reconsiderá intensidad o meta.';

  return {
    anos: Math.round(anos * 10) / 10,
    horasTotal,
    horasSemana: Math.round(horasSemana * 10) / 10,
    comentario,
  };

}
