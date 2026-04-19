export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function interesesResarcitoriosPunitoriosAfip(i: Inputs): Outputs {
  const d=Number(i.deuda)||0; const dias=Number(i.dias)||0;
  const res=d*0.06*(dias/30);
  const pun=d*0.08*(dias/30);
  const total=d+res;
  return { resarcitorios:'$'+res.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), punitorios:'$'+pun.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), totalAdeudar:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Deuda $${d.toLocaleString('es-AR')} × ${dias} días: total a regularizar $${total.toFixed(0)}.` };
}
