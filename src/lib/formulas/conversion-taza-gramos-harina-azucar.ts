export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionTazaGramosHarinaAzucar(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const u=String(i.unidad||'a');
  const factor=u==='a'?1.5:0.67;
  const r=v*factor;
  return { resultado:r.toFixed(3), resumen:`${v} → ${r.toFixed(2)}.` };
}
