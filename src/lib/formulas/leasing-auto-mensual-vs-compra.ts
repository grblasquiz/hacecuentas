export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function leasingAutoMensualVsCompra(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const r=Number(i.residual)||0; const m=Number(i.meses)||36; const t=Number(i.tasa)||10;
  const vr=v*r/100;
  const i_m=t/100/12;
  const cuota=((v-vr)/m)+(v+vr)/2*i_m;
  const sumaCuotas=cuota*m;
  const totalPago=sumaCuotas+vr;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  return {
    cuota:`$${cuota.toFixed(2)}`,
    totalPago:`$${totalPago.toFixed(0)}`,
    resumen:`Leasing ${m} meses: $${cuota.toFixed(0)}/mes, residual $${vr.toFixed(0)}.`,
    _insight: {
      title: 'Cuánto pagás por el auto',
      text: `Pagás **${fmt(cuota)}/mes** durante **${m} meses** y, si lo querés comprar al final, abonás un valor residual de **${fmt(vr)}**. En total desembolsás **${fmt(totalPago)}** por el vehículo.`,
      tone: 'neutral',
      icon: '🚗',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: `Cuotas (${m} × ${fmt(cuota)})`, value: Math.round(sumaCuotas) },
        { label: 'Valor residual final', value: Math.round(vr) },
      ],
      prefix: '$',
      centerValue: fmt(totalPago),
      centerLabel: 'Total a pagar',
      ariaLabel: `Desembolso total de ${fmt(totalPago)}: ${fmt(sumaCuotas)} en cuotas más ${fmt(vr)} de valor residual.`,
    },
  };
}
