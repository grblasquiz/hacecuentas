export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hsaFsaCuentasGastosSaludAhorro(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const t=(Number(i.tasa)||0)/100; const p=Number(i.plazo)||1;
  const r=m*Math.pow(1+t,p);
  return { resultado:'$'+r.toFixed(2), resumen:`$${m.toLocaleString('es-AR')} × (1+${(t*100).toFixed(1)}%)^${p} = $${r.toFixed(2)}.` };
}
