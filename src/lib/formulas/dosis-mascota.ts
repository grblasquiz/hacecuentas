/** Dosis de medicamento por peso (referencia) */
export interface Inputs {
  pesoKg: number;
  dosisMgKg: number;
  concentracion?: number; // mg/ml de la presentación
  dosisPorDia?: number;
}
export interface Outputs {
  dosisMgTotal: number;
  dosisMlTotal: number;
  dosisMlPorToma: number;
  tomasDia: number;
}

export function dosisMascota(i: Inputs): Outputs {
  const peso = Number(i.pesoKg);
  const dosis = Number(i.dosisMgKg);
  const conc = Number(i.concentracion) || 0;
  const tomas = Number(i.dosisPorDia) || 1;
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');
  if (!dosis || dosis <= 0) throw new Error('Ingresá la dosis');

  const mgTotal = peso * dosis;
  const mlTotal = conc > 0 ? mgTotal / conc : 0;
  const mlPorToma = mlTotal / tomas;

  return {
    dosisMgTotal: Number(mgTotal.toFixed(2)),
    dosisMlTotal: Number(mlTotal.toFixed(2)),
    dosisMlPorToma: Number(mlPorToma.toFixed(2)),
    tomasDia: tomas,
  };
}
