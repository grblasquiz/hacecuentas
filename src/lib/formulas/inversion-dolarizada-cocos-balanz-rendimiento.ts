export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object; _insight?: any; }
export function inversionDolarizadaCocosBalanzRendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('es-AR')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const totalPagado = r * p;
  const interesTotal = Math.max(totalPagado - m, 0);
  const cuotaFmt = '$' + Math.round(r).toLocaleString('es-AR');
  const interesFmt = '$' + Math.round(interesTotal).toLocaleString('es-AR');
  const totalFmt = '$' + Math.round(totalPagado).toLocaleString('es-AR');
  const hayInteres = interesTotal >= 1;
  const _insight = {
    title: __lang === 'en' ? 'What your plan really costs' : 'Lo que realmente cuesta tu plan',
    text: __lang === 'en'
      ? `Paying **${cuotaFmt}/month** over ${p} months means **${totalFmt}** in total${hayInteres ? `, of which **${interesFmt}** is interest on top of the $${m.toLocaleString('es-AR')} financed.` : ' (no interest at 0%).'}`
      : `Pagar **${cuotaFmt}/mes** durante ${p} meses suma **${totalFmt}** en total${hayInteres ? `, de los cuales **${interesFmt}** son intereses sobre los $${m.toLocaleString('es-AR')} financiados.` : ' (sin intereses al 0%).'}`,
    tone: hayInteres ? 'warn' : 'neutral',
    icon: '💵',
  };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight };
}
