/** Calculadora de CPM CPC CPA */
export interface Inputs { presupuesto: number; impresiones: number; clicks: number; conversiones: number; }
export interface Outputs { cpm: number; cpc: number; cpa: number; ctr: number; _insight?: any; }

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

  const ctrTxt = ctr >= 2
    ? `un CTR de **${ctr.toFixed(2)}%**, sólido (arriba del 2%)`
    : `un CTR de **${ctr.toFixed(2)}%**, con margen para mejorar el aviso o la segmentación`;
  const convTxt = conv > 0
    ? ` Cada conversión te sale **$${cpa.toFixed(0)}**.`
    : ` Cargá las conversiones para ver tu costo por adquisición (CPA).`;
  const _insight = {
    title: 'Tu campaña en números',
    text: `Con **$${p}** comprás **${imp.toLocaleString('es-AR')}** impresiones a **$${cpm.toFixed(0)} el CPM** y pagás **$${cpc.toFixed(0)}** por clic, ${ctrTxt}.${convTxt}`,
    tone: ctr >= 2 ? 'good' : 'neutral',
    icon: '📊',
  };

  return {
    cpm: Number(cpm.toFixed(0)),
    cpc: Number(cpc.toFixed(0)),
    cpa: Number(cpa.toFixed(0)),
    ctr: Number(ctr.toFixed(2)),
    _insight,
  };
}
