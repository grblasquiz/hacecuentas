export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function uptimeServidorNueveNuevesMinutos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const sla=Number(i.sla)||99;
  const dt=(1-sla/100)*525600;
  const dtMes=dt/12; const dtDia=dt/365;
  // tono según qué tan exigente es el SLA
  const tone = sla>=99.99 ? 'good' : sla>=99.9 ? 'neutral' : 'warn';
  const insight = __lang === 'en'
    ? {
        title: `SLA ${sla}% ≈ ${dt.toFixed(1)} min/year down`,
        text: `A **${sla}%** SLA allows only **${dt.toFixed(1)} min/year** of downtime — about **${dtMes.toFixed(1)} min/month** (**${dtDia.toFixed(2)} min/day**). ${sla>=99.99 ? 'That is "four nines": every extra nine cuts the margin ~10×, so monitoring and redundancy are non-negotiable.' : sla>=99.9 ? 'At "three nines" a single bad deploy can blow the whole monthly budget — alerting must be fast.' : 'Below three nines the margin is generous, but customers still notice repeated short outages.'}`,
        tone,
        icon: sla>=99.99 ? '🟢' : sla>=99.9 ? '⏱️' : '⚠️',
      }
    : {
        title: `SLA ${sla}% ≈ ${dt.toFixed(1)} min/año caído`,
        text: `Un SLA de **${sla}%** sólo tolera **${dt.toFixed(1)} min/año** de caída — unos **${dtMes.toFixed(1)} min/mes** (**${dtDia.toFixed(2)} min/día**). ${sla>=99.99 ? 'Eso es "cuatro nueves": cada nueve extra achica el margen ~10×, así que monitoreo y redundancia son obligatorios.' : sla>=99.9 ? 'Con "tres nueves" un solo deploy fallido se come el presupuesto mensual entero — el alerting tiene que ser rápido.' : 'Por debajo de tres nueves el margen es holgado, pero los usuarios igual notan cortes cortos repetidos.'}`,
        tone,
        icon: sla>=99.99 ? '🟢' : sla>=99.9 ? '⏱️' : '⚠️',
      };
  return {
    anual: __lang === 'en' ? `${dt.toFixed(1)} min/year` : `${dt.toFixed(1)} min/año`,
    mensual: __lang === 'en' ? `${(dt/12).toFixed(1)} min/month` : `${(dt/12).toFixed(1)} min/mes`,
    diario: __lang === 'en' ? `${(dt/365).toFixed(2)} min/day` : `${(dt/365).toFixed(2)} min/día`,
    resumen: __lang === 'en' ? `SLA ${sla}%: ${dt.toFixed(1)} min/year downtime allowed.` : `SLA ${sla}%: ${dt.toFixed(1)} min/año downtime permitido.`,
    _insight: insight,
  };
}
