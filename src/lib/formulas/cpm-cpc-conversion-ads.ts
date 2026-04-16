/** Calculadora de CPM CPC CPA */
export interface Inputs { presupuesto: number; impresiones: number; clicks: number; conversiones: number; }
export interface Outputs { cpm: number; cpc: number; cpa: number; ctr: number; }

export function cpmCpcConversionAds(i: Inputs): Outputs {
  const p = Number(i.presupuesto);
  const imp = Number(i.impresiones);
  const clicks = Number(i.clicks);
  const conv = Number(i.conversiones);
  if (!p || p <= 0) throw new Error('Ingresá el presupuesto');
  if (!imp || imp <= 0) throw new Error('Ingresá las impresiones');

  const cpm = (p / imp) * 1000;
  const cpc = clicks > 0 ? p / clicks : 0;
  const cpa = conv > 0 ? p / conv : 0;
  const ctr = (clicks / imp) * 100;

  return {
    cpm: Number(cpm.toFixed(0)),
    cpc: Number(cpc.toFixed(0)),
    cpa: Number(cpa.toFixed(0)),
    ctr: Number(ctr.toFixed(2)),
  };
}
