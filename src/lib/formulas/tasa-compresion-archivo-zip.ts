export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tasaCompresionArchivoZip(i: Inputs): Outputs {
  const o=Number(i.original)||0; const c=Number(i.comprimido)||0;
  if (o===0) return { tasa:'—', ratio:'—', ahorro:'—', resumen:'Original no puede ser 0.' };
  const tasa=(1-c/o)*100; const ratio=o/c;
  return { tasa:`${tasa.toFixed(1)}%`, ratio:`${ratio.toFixed(2)}:1`, ahorro:`${(o-c).toFixed(2)} MB`, resumen:`Compresión ${tasa.toFixed(1)}%, ahorro ${(o-c).toFixed(1)} MB.` };
}
