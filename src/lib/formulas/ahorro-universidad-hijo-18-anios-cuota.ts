export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroUniversidadHijo18AniosCuota(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const a=Number(i.anios)||1; const t=Number(i.tasa)||0;
  const im=t/100/12; const n=a*12;
  const c=im===0?m/n:m*im/(Math.pow(1+im,n)-1);
  const total=c*n;
  const fmt=(x:number)=>'$'+Math.round(x).toLocaleString('es-AR');
  const _insight={
    title:'Tu cuota mensual',
    text:`Para juntar **${fmt(m)}** en **${a} ${a===1?'año':'años'}** necesitás apartar **${fmt(c)} por mes** durante ${n} meses.`+(t>0?` Con una tasa del **${t}%** anual, el interés compuesto te ayuda a llegar a la meta aportando menos de tu bolsillo.`:` Sin rendimiento (tasa 0%), todo el monto sale de tu bolsillo: cuanto antes empieces, menor la cuota.`),
    tone:'neutral' as const,
    icon:'🎓',
  };
  return { cuota:`$${c.toFixed(2)}`, totalAhorro:`$${total.toFixed(0)}`, resumen:`Para $${m} en ${a} años: $${c.toFixed(0)}/mes.`, _insight };
}
