/** LTV suscripcion SaaS */
export interface Inputs { arpu: number; grossMargin: number; churnMensual: number; cac: number; }
export interface Outputs { ltv: number; ltvCacRatio: number; mesesVida: number; paybackMeses: number; evaluacion: string; }
export function ltvLifetimeValueSuscripcion(i: Inputs): Outputs {
  const arpu = Number(i.arpu);
  const gm = Number(i.grossMargin) / 100;
  const churn = Number(i.churnMensual) / 100;
  const cac = Number(i.cac);
  if (arpu <= 0) throw new Error('ARPU inválido');
  if (churn <= 0) throw new Error('Churn debe ser >0');
  const ltv = (arpu * gm) / churn;
  const ratio = cac > 0 ? ltv / cac : 0;
  const vida = 1 / churn;
  const payback = (arpu * gm) > 0 ? cac / (arpu * gm) : 0;
  let evaluacion = 'bueno';
  if (ratio < 1) evaluacion = 'crítico - no rentable';
  else if (ratio < 3) evaluacion = 'bajo - revisar CAC o churn';
  else if (ratio > 5) evaluacion = 'excelente';
  return {
    ltv: Math.round(ltv),
    ltvCacRatio: Number(ratio.toFixed(2)),
    mesesVida: Number(vida.toFixed(1)),
    paybackMeses: Number(payback.toFixed(1)),
    evaluacion
  };
}
