export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aumentoAlquilerTrimestralCuatrimestralSemestral(i: Inputs): Outputs {
  const a=Number(i.alquilerInicial)||0; const inf=(Number(i.inflacionMensual)||0)/100; const f=String(i.frecuencia||'trim');
  const pasosTotal=12; const mesesPeriodo: Record<string,number> = { trim:3, cuat:4, sem:6, anual:12 };
  const mp=mesesPeriodo[f]||3;
  let actual=a;
  for (let m=mp; m<=pasosTotal; m+=mp) actual=actual*Math.pow(1+inf,mp);
  const aum=(actual/a-1)*100;
  return { alqFinal:'$'+actual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), aumento:aum.toFixed(1)+'%', resumen:`$${a.toLocaleString('es-AR')} con ${f} @ ${(inf*100).toFixed(1)}%/mes: final $${actual.toFixed(0)} (+${aum.toFixed(1)}%).` };
}
