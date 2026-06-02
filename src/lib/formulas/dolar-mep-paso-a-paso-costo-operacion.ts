export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function dolarMepPasoAPasoCostoOperacion(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazo)||12; const t=(Number(i.tasa)||0)/100/12;
  const r=t===0?m/p:m*t*Math.pow(1+t,p)/(Math.pow(1+t,p)-1);
  const total=r*p; const interes=total-m;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const _insight = {
    title: 'Tu cuota',
    text: interes > 0
      ? `Pagás **${fmt(r)}/mes** durante **${p} meses**. En total devolvés **${fmt(total)}**, o sea **${fmt(interes)}** de intereses sobre los ${fmt(m)} iniciales.`
      : `Sin interés, repartís los ${fmt(m)} en **${p} cuotas** de **${fmt(r)}** cada una.`,
    tone: interes > m * 0.5 ? 'warn' : 'neutral',
    icon: '💸',
  };
  return { resultado:'$'+r.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Monto $${m.toLocaleString('es-AR')} × ${p} meses: $${r.toFixed(0)}/mes.`, _insight };
}
