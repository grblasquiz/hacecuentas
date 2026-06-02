export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function reintegroIvaComprasTarjetaDebito(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const cb=Number(i.compraBruta)||0; const pr=Number(i.porcentajeReintegro)||0;
  const ivaContenido=cb-(cb/1.21); const reint=ivaContenido*(pr/100); const neto=cb-reint;
  const ahorroPct = cb > 0 ? (reint/cb*100) : 0;
  const interpretacion = __lang === 'en'
    ? `Estimated ${pr}% VAT refund on the included tax. You save ${ahorroPct.toFixed(1)}% of the total.`
    : `Reintegro estimado ${pr}% del IVA contenido. Ahorrás ${ahorroPct.toFixed(1)}% del total.`;
  const reintFmt = '$' + Math.round(reint).toLocaleString('es-AR');
  const cbFmt = '$' + Math.round(cb).toLocaleString('es-AR');
  const insight = __lang === 'en'
    ? { title: 'Your refund', text: `On a **${cbFmt}** purchase you get back **${reintFmt}**, which is **${ahorroPct.toFixed(1)}%** of the total. The included VAT is $${Math.round(ivaContenido).toLocaleString('es-AR')}; the refund returns ${pr}% of that.`, tone: 'good', icon: '💳' }
    : { title: 'Tu reintegro', text: `Sobre una compra de **${cbFmt}** recuperás **${reintFmt}**, que es el **${ahorroPct.toFixed(1)}%** del total. El IVA contenido es $${Math.round(ivaContenido).toLocaleString('es-AR')}; el reintegro devuelve el ${pr}% de eso.`, tone: 'good', icon: '💳' };
  const chart = cb > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: __lang === 'en' ? 'Net paid' : 'Pagás neto', value: Number(neto.toFixed(2)) },
      { label: __lang === 'en' ? 'VAT refund' : 'Reintegro IVA', value: Number(reint.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: cbFmt,
    centerLabel: __lang === 'en' ? 'Gross purchase' : 'Compra bruta',
    ariaLabel: __lang === 'en' ? 'Breakdown of the gross purchase into net paid and VAT refunded.' : 'Composición de la compra bruta entre lo que pagás neto y el reintegro de IVA.',
  } : undefined;
  return { reintegro:reintFmt, netoFinal:`$${Math.round(neto).toLocaleString('es-AR')}`, interpretacion, _insight: insight, _chart: chart };
}
