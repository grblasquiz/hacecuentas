export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function bonosAl30Al35Al41RendimientoAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('es-AR')} × ${p} months: $${r.toFixed(0)}/month.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;

  // --- Insight + gráfico: capital vs intereses sobre el total pagado ---
  const totalPagado = r * p;
  const intereses = Math.max(0, totalPagado - m);
  const pctInteres = totalPagado > 0 ? (intereses / totalPagado) * 100 : 0;
  const fmtAR = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const _insight = {
    title: __lang === 'en' ? 'What the financing costs you' : 'Cuánto te cuesta financiarlo',
    text: __lang === 'en'
      ? `A monthly payment of **${fmtAR(r)}** over ${p} months means paying back **${fmtAR(totalPagado)}** total — **${fmtAR(intereses)}** of that is interest (**${pctInteres.toFixed(1)}%** of the total).`
      : `Una cuota de **${fmtAR(r)}** durante ${p} meses implica devolver **${fmtAR(totalPagado)}** en total: **${fmtAR(intereses)}** son intereses (**${pctInteres.toFixed(1)}%** del total).`,
    tone: pctInteres >= 30 ? 'warn' : 'neutral',
    icon: '💸'
  };
  const _chart = intereses > 0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Principal' : 'Capital', value: Math.round(m) },
      { label: __lang === 'en' ? 'Interest' : 'Intereses', value: Math.round(intereses) }
    ],
    prefix: '$',
    centerValue: fmtAR(totalPagado),
    centerLabel: __lang === 'en' ? 'Total' : 'Total',
    ariaLabel: __lang === 'en'
      ? `Breakdown of the ${fmtAR(totalPagado)} total paid: principal and interest.`
      : `Composición del total pagado de ${fmtAR(totalPagado)}: capital e intereses.`
  } : undefined;

  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight, _chart };
}
