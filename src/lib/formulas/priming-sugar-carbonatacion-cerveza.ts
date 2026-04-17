/** Priming sugar */
export interface Inputs { volumenCerveza: number; volumenesCO2: number; temperaturaFermentacion: number; tipoAzucar: string; }
export interface Outputs { gramosAzucar: number; co2Residual: number; gramosOnzas: string; recomendacion: string; }

export function primingSugarCarbonatacionCerveza(i: Inputs): Outputs {
  const V = Number(i.volumenCerveza);
  const objCO2 = Number(i.volumenesCO2);
  const T = Number(i.temperaturaFermentacion);
  const tipo = String(i.tipoAzucar || 'dextrosa');
  if (!V || V <= 0) throw new Error('Ingresá volumen');
  if (!objCO2 || objCO2 <= 0) throw new Error('Ingresá volúmenes CO2');

  const residual = 3.0378 - 0.050062 * T + 0.00026555 * T * T;
  const delta = Math.max(0, objCO2 - residual);
  const factores: Record<string, number> = { dextrosa: 3.86, sacarosa: 3.51, dme: 4.50, miel: 4.26 };
  const f = factores[tipo] ?? 3.86;
  const gramos = delta * V * f;
  const onzas = gramos / 28.3495;

  let rec = '';
  if (objCO2 > 3.5) rec = 'ALTA carbonatación — usá botellas belgas gruesas, riesgo en botellas estándar.';
  else if (objCO2 < 1.8) rec = 'Baja carbonatación estilo British — servir fresca.';
  else rec = 'Carbonatación estándar — cualquier botella comercial sirve.';

  return {
    gramosAzucar: Number(gramos.toFixed(1)),
    co2Residual: Number(residual.toFixed(2)),
    gramosOnzas: `${gramos.toFixed(0)}g = ${onzas.toFixed(2)} oz`,
    recomendacion: rec,
  };
}
