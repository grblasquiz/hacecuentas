export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; [k: string]: string | number | any; }
export function plazoFijoGananciaNetaAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const totalPagado = r * p;
  const interesTotal = Math.max(0, totalPagado - m);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const _insight = {
    title: __lang === 'en' ? 'What this loan costs you' : 'Lo que te cuesta esta cuota',
    text: __lang === 'en'
      ? `Repaying **$${m.toLocaleString('en-US')}** over **${p} months** means **${p}** fixed payments of **$${r.toLocaleString('en-US', { maximumFractionDigits: 0 })}**, for a total of **$${totalPagado.toLocaleString('en-US', { maximumFractionDigits: 0 })}** — about **$${interesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}** in interest on top of the principal.`
      : `Devolver **$${m.toLocaleString('es-AR')}** en **${p} meses** significa **${p}** cuotas fijas de **$${r.toLocaleString('es-AR', { maximumFractionDigits: 0 })}**, que suman **$${totalPagado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}** en total: unos **$${interesTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}** de interés por encima del capital.`,
    tone: 'neutral',
    icon: '💳',
  };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight };
}
