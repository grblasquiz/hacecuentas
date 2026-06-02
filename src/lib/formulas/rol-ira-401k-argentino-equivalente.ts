export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function rolIra401kArgentinoEquivalente(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('es-AR')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const totalPagado = r * p;
  const interesTotal = Math.max(0, totalPagado - m);
  const cuotaFmt = '$' + r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const totalFmt = '$' + totalPagado.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const interesFmt = '$' + interesTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const insight = {
    title: __lang === 'en' ? 'Monthly contribution' : 'Aporte mensual',
    text: __lang === 'en'
      ? `Setting aside **${cuotaFmt}/mo** for ${p} months adds up to **${totalFmt}**${interesTotal > 0 ? `, of which **${interesFmt}** is growth on top of your $${m.toLocaleString('es-AR')} base.` : '.'}`
      : `Apartar **${cuotaFmt}/mes** durante ${p} meses suma **${totalFmt}**${interesTotal > 0 ? `, de los cuales **${interesFmt}** son rendimiento por encima de tu base de $${m.toLocaleString('es-AR')}.` : '.'}`,
    tone: 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '🏦',
  };
  return { resultado: cuotaFmt, resumen, _insight: insight };
}
