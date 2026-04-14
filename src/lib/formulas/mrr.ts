/** MRR, ARR y crecimiento */
export interface Inputs {
  mrrInicial: number;
  mrrNuevo: number;
  mrrExpansion?: number;
  mrrContraccion?: number;
  mrrChurn?: number;
}
export interface Outputs {
  mrrFinal: number;
  mrrNeto: number;
  arr: number;
  crecimiento: number;
  netNewMrr: number;
  quickRatio: number;
}

export function mrr(i: Inputs): Outputs {
  const inicial = Number(i.mrrInicial) || 0;
  const nuevo = Number(i.mrrNuevo) || 0;
  const exp = Number(i.mrrExpansion) || 0;
  const contr = Number(i.mrrContraccion) || 0;
  const ch = Number(i.mrrChurn) || 0;

  const netNew = nuevo + exp - contr - ch;
  const final = inicial + netNew;
  const arr = final * 12;
  const crecimiento = inicial > 0 ? (netNew / inicial) * 100 : 0;

  // Quick Ratio = (New + Expansion) / (Contraction + Churn)
  const perdidas = contr + ch;
  const quick = perdidas > 0 ? (nuevo + exp) / perdidas : (nuevo + exp) > 0 ? 99 : 0;

  return {
    mrrFinal: Math.round(final),
    mrrNeto: Math.round(netNew),
    arr: Math.round(arr),
    crecimiento: Number(crecimiento.toFixed(2)),
    netNewMrr: Math.round(netNew),
    quickRatio: Number(quick.toFixed(2)),
  };
}
