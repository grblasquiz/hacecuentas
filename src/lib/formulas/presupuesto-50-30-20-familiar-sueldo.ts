export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function presupuesto503020FamiliarSueldo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const resumen = __lang === 'en'
    ? `Amount $${m.toLocaleString('en-US')} × ${p} months: $${r.toFixed(0)}/mo.`
    : `Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`;
  const total=r*p; const interes=Math.max(0,total-m);
  const sobrecosto = m>0 ? (interes/m)*100 : 0;
  const loc = __lang === 'en' ? 'en-US' : 'es-AR';
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString(loc);
  const _insight = __lang === 'en'
    ? {
        title: 'Total cost of the loan',
        text: `The monthly payment is **${fmt(r)}** over ${p} months. You repay **${fmt(total)}** in total: **${fmt(interes)}** in interest, **${Math.round(sobrecosto)}%** on top of the ${fmt(m)} you borrow.`,
        tone: sobrecosto > 50 ? 'warn' : 'neutral',
        icon: '🏦',
      }
    : {
        title: 'Costo total del préstamo',
        text: `La cuota es de **${fmt(r)}** por ${p} meses. En total devolvés **${fmt(total)}**: pagás **${fmt(interes)}** de intereses, un **${Math.round(sobrecosto)}%** sobre los ${fmt(m)} que pedís.`,
        tone: sobrecosto > 50 ? 'warn' : 'neutral',
        icon: '🏦',
      };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: __lang === 'en' ? 'Principal' : 'Capital', value: Math.round(m) },
      { label: __lang === 'en' ? 'Interest' : 'Intereses', value: Math.round(interes) },
    ].filter((s)=>s.value>0),
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: __lang === 'en' ? 'Total to repay' : 'Total a pagar',
    ariaLabel: __lang === 'en' ? 'Breakdown of total repayment: principal and interest.' : 'Composición del total a pagar del préstamo: capital e intereses.',
  };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight, _chart };
}
