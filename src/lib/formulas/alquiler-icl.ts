/** Actualización de alquiler por ICL (BCRA) — Ley 27.551 derogada, contratos viejos */
export interface Inputs { valorActual: number; coeficienteICL: number; }
export interface Outputs { valorActualizado: number; incremento: number; aumentoPorcentual: number; }

export function alquilerIcl(i: Inputs): Outputs {
  const valor = Number(i.valorActual);
  const coef = Number(i.coeficienteICL);
  if (!valor || valor <= 0) throw new Error('Ingresá el valor actual del alquiler');
  if (!coef || coef <= 0) throw new Error('Ingresá el coeficiente ICL');
  // Guard contra error típico: usuario confunde el coeficiente con una tasa
  // mensual (ej: 0.05 por "5%") o con el ICL bruto (ej: 85.234) en vez del
  // ratio. El coeficiente es el cociente ICL_fin / ICL_inicio, siempre > 1
  // en contextos inflacionarios. Valores extremos probablemente son error.
  if (coef < 0.5 || coef > 50) {
    throw new Error('El coeficiente ICL se ve fuera de rango. Recordá: es el ratio ICL_actualización / ICL_contrato (típicamente entre 1 y 5). No ingreses una tasa mensual ni el valor bruto del ICL.');
  }
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
