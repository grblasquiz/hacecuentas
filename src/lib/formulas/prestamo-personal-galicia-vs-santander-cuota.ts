export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function prestamoPersonalGaliciaVsSantanderCuota(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const total=r*p; const interes=Math.max(0,total-m);
  const sobrecosto = m>0 ? (interes/m)*100 : 0;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const _insight = {
    title: 'Costo total del préstamo',
    text: `La cuota es de **${fmt(r)}** por ${p} meses. En total devolvés **${fmt(total)}**: pagás **${fmt(interes)}** de intereses, un **${Math.round(sobrecosto)}%** sobre los ${fmt(m)} que pedís. Compará la misma cuota en Galicia y Santander cambiando la tasa.`,
    tone: sobrecosto > 50 ? 'warn' : 'neutral',
    icon: '🏦',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(m) },
      { label: 'Intereses', value: Math.round(interes) },
    ].filter((s)=>s.value>0),
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total a pagar del préstamo: capital e intereses.',
  };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`, _insight, _chart };
}
