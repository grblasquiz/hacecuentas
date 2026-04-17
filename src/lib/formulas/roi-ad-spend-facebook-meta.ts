/** ROI Meta ads */
export interface Inputs { adSpend: number; impresiones: number; clicks: number; conversiones: number; ingresoTotal: number; }
export interface Outputs { roas: number; cpa: number; cpm: number; ctr: number; conversionRate: number; }
export function roiAdSpendFacebookMeta(i: Inputs): Outputs {
  const spend = Number(i.adSpend);
  const imp = Number(i.impresiones);
  const cl = Number(i.clicks);
  const conv = Number(i.conversiones);
  const ing = Number(i.ingresoTotal);
  if (spend < 0) throw new Error('Spend inválido');
  return {
    roas: spend > 0 ? Number((ing / spend).toFixed(2)) : 0,
    cpa: conv > 0 ? Number((spend / conv).toFixed(2)) : 0,
    cpm: imp > 0 ? Number(((spend / imp) * 1000).toFixed(2)) : 0,
    ctr: imp > 0 ? Number(((cl / imp) * 100).toFixed(2)) : 0,
    conversionRate: cl > 0 ? Number(((conv / cl) * 100).toFixed(2)) : 0
  };
}
