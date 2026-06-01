export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroCompuestoTiempoDuplicarRegla72(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const totalPagado = r * p;
  const interesTotal = totalPagado - m;
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const _insight = __lang === 'en'
    ? { title: 'What you end up paying', text: `Paying **$${r.toFixed(0)}/mo** over **${p} months** adds up to **$${totalPagado.toFixed(0)}**, that is **$${interesTotal.toFixed(0)} in interest** on top of the $${m.toFixed(0)} principal.`, tone: interesTotal > m * 0.5 ? 'warn' : 'neutral', icon: '📅' }
    : { title: 'Lo que terminás pagando', text: `Pagar **$${r.toFixed(0)}/mes** durante **${p} meses** suma **$${totalPagado.toFixed(0)}**, o sea **$${interesTotal.toFixed(0)} de interés** sobre los $${m.toFixed(0)} de capital.`, tone: interesTotal > m * 0.5 ? 'warn' : 'neutral', icon: '📅' };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight };
}
