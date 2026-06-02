export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function criptomonedasGananciaImpuestoAfip(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const totalPagado = r * p;
  const interesTotal = Math.max(0, totalPagado - m);
  const ars = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const pctInteres = totalPagado > 0 ? (interesTotal / totalPagado) * 100 : 0;
  const tone = pctInteres >= 40 ? 'warn' : pctInteres >= 20 ? 'neutral' : 'good';
  const _insight = {
    title: 'Cuánto pagás de interés',
    text: `Vas a pagar **${ars(r)}/mes** durante ${p} meses, un total de **${ars(totalPagado)}**. De eso, **${ars(interesTotal)}** son intereses (${pctInteres.toFixed(0)}% de lo que devolvés) sobre los ${ars(m)} de capital.`,
    tone,
    icon: '💸',
  };
  const _chart = interesTotal > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Capital', value: Math.round(m) },
      { label: 'Intereses', value: Math.round(interesTotal) },
    ],
    prefix: '$',
    centerValue: ars(totalPagado),
    centerLabel: 'Total a pagar',
    ariaLabel: `De ${ars(totalPagado)} totales, ${ars(m)} son capital y ${ars(interesTotal)} intereses.`,
  } : undefined;
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`, _insight, _chart };
}
