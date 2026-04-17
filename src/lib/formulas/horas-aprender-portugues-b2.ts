/** ¿Cuántas horas para llegar a portugués B2? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  semanas: number;
  meses: number;
  anos: number;
  categoriaFsi: string;
}

export function horasAprenderPortuguesB2(i: Inputs): Outputs {
  const horasDiarias = Number(i.horasDiarias) || 2;
  const diasSemana = Number(i.diasSemana) || 5;
  const nivelActual = String(i.nivelActual || 'a0');
  const inmersion = String(i.inmersion || 'no');
  if (horasDiarias <= 0) throw new Error('Horas diarias inválidas');
  if (diasSemana <= 0 || diasSemana > 7) throw new Error('Días/semana entre 1 y 7');

  const totalBase = 500;
  const yaHechas: Record<string, number> = { a0: 0, a1: 80, a2: 200, b1: 400, b2: 650 };
  let restante = totalBase - (yaHechas[nivelActual] || 0);
  if (restante < 50) restante = 50;

  const factor: Record<string, number> = { no: 1, parcial: 0.8, si: 0.6 };
  restante = restante * (factor[inmersion] || 1);

  const horasSemana = horasDiarias * diasSemana;
  const semanas = restante / horasSemana;
  const meses = semanas / 4.33;
  const anos = meses / 12;

  return {
    horasTotales: Math.round(restante),
    semanas: Math.round(semanas),
    meses: Math.round(meses * 10) / 10,
    anos: Math.round(anos * 10) / 10,
    categoriaFsi: 'Cat I FSI (muy cercano)',
  };

}
