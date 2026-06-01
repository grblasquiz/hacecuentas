export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function uptimeServidorNueveNuevesMinutos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const sla=Number(i.sla)||99;
  const dt=(1-sla/100)*525600;
  return {
    anual: __lang === 'en' ? `${dt.toFixed(1)} min/year` : `${dt.toFixed(1)} min/año`,
    mensual: __lang === 'en' ? `${(dt/12).toFixed(1)} min/month` : `${(dt/12).toFixed(1)} min/mes`,
    diario: __lang === 'en' ? `${(dt/365).toFixed(2)} min/day` : `${(dt/365).toFixed(2)} min/día`,
    resumen: __lang === 'en' ? `SLA ${sla}%: ${dt.toFixed(1)} min/year downtime allowed.` : `SLA ${sla}%: ${dt.toFixed(1)} min/año downtime permitido.`,
  };
}
