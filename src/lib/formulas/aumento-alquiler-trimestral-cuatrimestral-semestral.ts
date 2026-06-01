export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aumentoAlquilerTrimestralCuatrimestralSemestral(i: Inputs): Outputs {
  const a=Number(i.alquilerInicial)||0; const inf=(Number(i.inflacionMensual)||0)/100; const f=String(i.frecuencia||'trim');
  const pasosTotal=12; const mesesPeriodo: Record<string,number> = { trim:3, cuat:4, sem:6, anual:12 };
  const mp=mesesPeriodo[f]||3;
  let actual=a;
  for (let m=mp; m<=pasosTotal; m+=mp) actual=actual*Math.pow(1+inf,mp);
  const aum=(actual/a-1)*100;
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const freqLabel: Record<string,string> = { trim:'trimestral', cuat:'cuatrimestral', sem:'semestral', anual:'anual' };
  const _insight = {
    title: 'Tu alquiler en 12 meses',
    text: `Con ajuste **${freqLabel[f]||'trimestral'}** y una inflación de **${(inf*100).toFixed(1)}%/mes**, el alquiler trepa de ${fmt(a)} a **${fmt(actual)}** en un año: un **+${aum.toFixed(1)}%** acumulado.`,
    tone: aum>=80 ? 'warn' : (aum>=40 ? 'neutral' : 'good'),
    icon: '🏠',
  };
  return { alqFinal:fmt(actual), aumento:aum.toFixed(1)+'%', resumen:`$${a.toLocaleString('es-AR')} con ${f} @ ${(inf*100).toFixed(1)}%/mes: final $${actual.toFixed(0)} (+${aum.toFixed(1)}%).`, _insight };
}
