export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function portfolioEtfDiversificadoBogleheads(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const rFmt = '$' + r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const _insight = {
    title: __lang === 'en' ? 'Monthly contribution' : 'Aporte mensual',
    text: __lang === 'en'
      ? `Spreading **$${m.toLocaleString('en-US')}** over **${p} months** works out to **${rFmt}/mo**. A Bogleheads portfolio rewards consistency: automate the contribution and keep low-cost index ETFs over the long run.`
      : `Repartir **$${m.toLocaleString('es-AR')}** en **${p} meses** da **${rFmt}/mes**. Una cartera Bogleheads premia la constancia: automatizá el aporte y sostené ETFs índice de bajo costo en el largo plazo.`,
    tone: 'good',
    icon: '📈',
  };
  return { resultado:rFmt, resumen, _insight };
}
