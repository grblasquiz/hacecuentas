/** Costo por vista de video (CPV) */

export interface Inputs {
  presupuesto: number;
  vistas: number;
  clicks?: number;
  conversiones?: number;
}

export interface Outputs {
  cpv: number;
  vtr: number;
  costoPorClick: number;
  detalle: string;
  _insight?: any;
}

export function costoPorViewCpvVideo(i: Inputs): Outputs {
  const pres = Number(i.presupuesto);
  const vistas = Number(i.vistas);
  const clicks = Number(i.clicks) || 0;
  const conv = Number(i.conversiones) || 0;

  if (isNaN(pres) || pres < 0) throw new Error('Ingresá el presupuesto gastado');
  if (isNaN(vistas) || vistas <= 0) throw new Error('Ingresá las vistas totales');

  const cpv = pres / vistas;
  const vtr = clicks > 0 ? (clicks / vistas) * 100 : 0;
  const costoPorClick = clicks > 0 ? pres / clicks : 0;
  const cpa = conv > 0 ? pres / conv : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmtDec = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let extra = '';
  if (clicks > 0) {
    extra += ` Clicks: ${fmt.format(clicks)} (VTR: ${vtr.toFixed(2)}%). CPC: $${fmtDec.format(costoPorClick)}.`;
  }
  if (conv > 0) {
    extra += ` Conversiones: ${fmt.format(conv)}. CPA: $${fmt.format(cpa)}.`;
  }

  const detalle =
    `Presupuesto: $${fmt.format(pres)}. Vistas: ${fmt.format(vistas)}. ` +
    `CPV: $${fmtDec.format(cpv)} por vista.` + extra;

  const _insight = {
    title: 'Qué te dice el CPV',
    text: clicks > 0
      ? `Pagás **$${fmtDec.format(cpv)} por vista** y de cada 100 vistas el **${vtr.toFixed(1)}%** hizo click (VTR), a **$${fmtDec.format(costoPorClick)}** el click. El CPV mide cuán barato llegás a la audiencia; el VTR, cuán bien el creativo la engancha.`
      : `Cada vista te cuesta **$${fmtDec.format(cpv)}** (${fmt.format(vistas)} vistas por $${fmt.format(pres)}). Sumá los **clicks** para ver el VTR y el costo por click, y así saber si el video además de barato convierte.`,
    tone: 'neutral',
    icon: '📹',
  };

  return {
    cpv: Number(cpv.toFixed(2)),
    vtr: Number(vtr.toFixed(2)),
    costoPorClick: Number(costoPorClick.toFixed(2)),
    detalle,
    _insight,
  };
}
