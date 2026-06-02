export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function stockOptionsVestingTechStartup(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const total=r*p;
  const interes=total-m;
  const cuotaFmt=Math.round(r).toLocaleString(__lang==='en'?'en-US':'es-AR');
  const interesFmt=Math.round(interes).toLocaleString(__lang==='en'?'en-US':'es-AR');
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const _insight = {
    title: __lang === 'en' ? 'Your monthly payment' : 'Tu cuota mensual',
    text: __lang === 'en'
      ? `You'll pay **$${cuotaFmt}/mo** for ${p} months. Over the full term that's **$${interesFmt} in interest** on top of the $${m.toLocaleString('en-US')} principal.`
      : `Vas a pagar **$${cuotaFmt}/mes** durante ${p} meses. En todo el plazo eso suma **$${interesFmt} de interés** por encima del capital de $${m.toLocaleString('es-AR')}.`,
    tone: interes > m * 0.3 ? 'warn' : 'neutral',
    icon: '💳',
  };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight };
}
