export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function deduccionFamiliaConyugeHijoGanancias(i: Inputs): Outputs {
  const c=String(i.conyuge||'no')==='si'; const hm=Number(i.hijosMenores)||0; const hi=Number(i.hijosInca)||0;
  const DEDUC_CONY=2800000; const DEDUC_HIJO=1400000; const DEDUC_INCA=2800000;
  const total=(c?DEDUC_CONY:0)+hm*DEDUC_HIJO+hi*DEDUC_INCA;
  return { totalAnual:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), mensual:'$'+(total/12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${c?'Cónyuge':''}${c&&(hm+hi>0)?' + ':''}${hm+hi>0?`${hm+hi} hijo(s)`:''}: deducción anual $${total.toFixed(0)}.` };
}
