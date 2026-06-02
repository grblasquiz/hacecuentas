export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function tarjetaCreditoPagoMinimoIntereses(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const totalPagado = r * p;
  const intereses = Math.max(0, totalPagado - m);
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const cuotaPct = m > 0 ? (intereses / m) * 100 : 0;
  const tasaPct = Number(i.tasa) || 0;
  const insightTone: 'warn' | 'neutral' = cuotaPct >= 40 ? 'warn' : 'neutral';
  const insightText = tasaPct === 0
    ? `Sin interés, las **${p} cuotas** de **${fmt(r)}** suman exactamente el monto financiado (**${fmt(m)}**). Cuota fija ideal.`
    : `Financiar **${fmt(m)}** en **${p} cuotas** al ${tasaPct}% mensual da una cuota de **${fmt(r)}**. Pagás **${fmt(intereses)}** de intereses en total: un **${Math.round(cuotaPct)}%** sobre el monto.`;
  return {
    resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen:`Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`,
    _insight: { title: 'Qué significa este resultado', text: insightText, tone: insightTone, icon: '💳' },
  };
}
