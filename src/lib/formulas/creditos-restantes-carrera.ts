/** Calculadora Créditos Restantes */
export interface Inputs { creditosTotal: number; creditosAprobados: number; creditosPorCuatri: number; }
export interface Outputs { creditosFaltantes: number; porcentajeAvance: number; cuatrimestresFaltantes: number; fechaEstimada: string; }

export function creditosRestantesCarrera(i: Inputs): Outputs {
  const total = Number(i.creditosTotal);
  const aprobados = Number(i.creditosAprobados);
  const porCuatri = Number(i.creditosPorCuatri);
  if (total <= 0) throw new Error('Los créditos totales deben ser mayor a 0');
  if (aprobados < 0) throw new Error('Los créditos aprobados no pueden ser negativos');
  if (porCuatri <= 0) throw new Error('Los créditos por cuatrimestre deben ser mayor a 0');

  const faltantes = Math.max(0, total - aprobados);
  const avance = (aprobados / total) * 100;
  const cuatris = Math.ceil(faltantes / porCuatri);
  const anos = cuatris / 2;

  let tiempo: string;
  if (faltantes === 0) tiempo = '¡Ya completaste todos los créditos!';
  else if (cuatris === 1) tiempo = '1 cuatrimestre (~6 meses)';
  else tiempo = `${cuatris} cuatrimestres (~${anos.toFixed(1)} años)`;

  return {
    creditosFaltantes: faltantes,
    porcentajeAvance: Number(avance.toFixed(1)),
    cuatrimestresFaltantes: cuatris,
    fechaEstimada: tiempo,
  };
}
