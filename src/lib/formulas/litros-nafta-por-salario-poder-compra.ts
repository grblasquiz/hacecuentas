export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function litrosNaftaPorSalarioPoderCompra(i: Inputs): Outputs {
  const s=Number(i.sueldo)||0; const p=Number(i.precio)||1;
  const l=s/p;
  return { litros:`${l.toFixed(0)} L`, km:`${(l*10).toFixed(0)} km`, resumen:`$${s} / $${p} = ${l.toFixed(0)} litros.` };
}
