export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cuotaCreditoHipotecarioUvaBancoNacion(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazoAnios)||0; const tna=(Number(i.tnaReal)||0)/100;
  const n=p*12; const i_m=tna/12;
  const cuota=i_m===0?m/n:m*i_m*Math.pow(1+i_m,n)/(Math.pow(1+i_m,n)-1);
  const total=cuota*n;
  const intereses=Math.max(0, total-m);

  const fmt=(x:number)=>'$'+Math.round(x).toLocaleString('es-AR');
  const sobre = m>0 ? (intereses/m)*100 : 0;
  const _insight = {
    title: 'Costo del crédito',
    text: `La cuota inicial es **${fmt(cuota)}/mes** y a lo largo de ${p} años pagás **${fmt(total)}**, de los cuales **${fmt(intereses)}** son intereses (**${sobre.toFixed(0)}%** sobre el capital). En UVA, además, la cuota se ajusta por inflación.`,
    tone: 'warn',
    icon: '🏠',
  };

  const out: Outputs = {
    cuotaInicial:'$'+cuota.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    totalPagar:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen:`$${m.toLocaleString('es-AR')} × ${p} años @ ${(tna*100).toFixed(1)}%: cuota $${cuota.toFixed(0)}/mes.`,
    _insight,
  };

  // Donut: el total a pagar = capital + intereses
  if (intereses > 0 && m > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Capital', value: Math.round(m) },
        { label: 'Intereses', value: Math.round(intereses) },
      ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Total a pagar',
      ariaLabel: `El total a pagar de ${fmt(total)} se compone de ${fmt(m)} de capital y ${fmt(intereses)} de intereses`,
    };
  }

  return out;
}
