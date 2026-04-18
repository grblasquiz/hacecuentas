export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionTorqueNmLbFtKgm(i: Inputs): Outputs {
  const v=Number(i.v)||0; const d=String(i.de||'nm');
  let nm:number;
  if (d==='nm') nm=v; else if (d==='lbft') nm=v*1.356; else nm=v*9.807;
  return { nm:`${nm.toFixed(2)} Nm`, lbft:`${(nm*0.738).toFixed(2)} lb·ft`, kgm:`${(nm*0.102).toFixed(2)} kg·m`, resumen:`${v} ${d} = ${nm.toFixed(1)} Nm.` };
}
