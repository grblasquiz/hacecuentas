export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function independenciaFinancieraFireMovimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const sep = __lang === 'en' ? ',' : '.';
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const rFmt = '$' + r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const total = r * p;
  const totalFmt = '$' + Math.round(total).toLocaleString(locale);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const insight = __lang === 'en'
    ? {
        title: 'Monthly amount',
        text: `To reach your goal you'd set aside **${rFmt}/month** over **${p} months**, adding up to **${totalFmt}**. Consistency month after month is what compounds toward financial independence.`,
        tone: 'neutral',
        icon: '🔥',
      }
    : {
        title: 'Cuota mensual',
        text: `Para alcanzar tu objetivo destinarías **${rFmt}/mes** durante **${p} meses**, que suman **${totalFmt}**. La constancia mes a mes es lo que capitaliza hacia la independencia financiera.`,
        tone: 'neutral',
        icon: '🔥',
      };
  return { resultado: rFmt, resumen, _insight: insight };
}
