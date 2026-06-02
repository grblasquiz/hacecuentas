export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function copomTasaReferenciaBancoCentralImpacto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const totalPagado = r * p;
  const intereses = Math.max(0, totalPagado - m);
  const fmt = (n: number) => '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const tasaAnual = (Number(i.tasa) || 0).toFixed(2);
  const _insight = __lang === 'en'
    ? {
        title: 'Monthly payment',
        text: `At **${tasaAnual}%** annual over **${p}** months, each installment is **${fmt(r)}**. You'd repay **${fmt(totalPagado)}** total — **${fmt(intereses)}** of it pure interest.`,
        tone: 'neutral',
        icon: '🏛️',
      }
    : {
        title: 'Tu cuota mensual',
        text: `Con una tasa de **${tasaAnual}%** anual a **${p}** meses, cada cuota es **${fmt(r)}**. Vas a devolver **${fmt(totalPagado)}** en total, de los cuales **${fmt(intereses)}** son intereses.`,
        tone: 'neutral',
        icon: '🏛️',
      };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight };
}
