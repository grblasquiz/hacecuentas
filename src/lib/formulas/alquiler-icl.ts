/** Actualización de alquiler por ICL (BCRA) — Ley 27.551 derogada, contratos viejos */
export interface Inputs { valorActual: number; coeficienteICL: number; }
export interface Outputs { valorActualizado: number; incremento: number; aumentoPorcentual: number; }

export function alquilerIcl(i: Inputs): Outputs {
  const valor = Number(i.valorActual);
  const coef = Number(i.coeficienteICL);
  if (!valor || valor <= 0) throw new Error('Ingresá el valor actual del alquiler');
  if (!coef || coef <= 0) throw new Error('Ingresá el coeficiente ICL');
  // ICL se expresa como multiplicador: si es 1.75, el alquiler se multiplica por 1.75
  const actualizado = valor * coef;
  const incremento = actualizado - valor;
  const porcentaje = (coef - 1) * 100;
  return {
    valorActualizado: Math.round(actualizado),
    incremento: Math.round(incremento),
    aumentoPorcentual: Number(porcentaje.toFixed(2)),
  };
}
