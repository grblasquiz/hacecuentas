export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function costoTransferenciaAuto0kmUsado(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const ara=85000;
  const alicSe: Record<string,number> = { caba:0.015, pba:0.02, cba:0.02 };
  const sellos=v*(alicSe[p]||0.02);
  const total=ara+sellos;
  const fmt=(x:number)=>x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pctTotal = v>0 ? ((total/v)*100).toFixed(1) : '0';
  const _insight = {
    title: 'Lo que cuesta poner el auto a tu nombre',
    text: `Transferir un auto de **$${v.toLocaleString('es-AR')}** en ${p.toUpperCase()} cuesta **$${fmt(total)}**: $${fmt(ara)} de aranceles fijos más **$${fmt(sellos)}** de impuesto de sellos. Es el **${pctTotal}%** del valor del vehículo.`,
    tone: 'neutral' as const,
    icon: '📋',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Aranceles (DNRPA)', value: ara },
      { label: 'Impuesto de sellos', value: Math.round(sellos) },
    ],
    prefix: '$',
    centerValue: '$'+fmt(total),
    centerLabel: 'Transferencia',
    ariaLabel: `Gráfico de torta del costo de transferencia del auto, total $${fmt(total)}`,
  };
  return { aranceles:'$'+ara.toLocaleString('es-AR'), impuestos:'$'+fmt(sellos), total:'$'+fmt(total), resumen:`Auto $${v.toLocaleString('es-AR')} en ${p.toUpperCase()}: transferencia ~$${total.toFixed(0)}.`, _insight, _chart };
}
