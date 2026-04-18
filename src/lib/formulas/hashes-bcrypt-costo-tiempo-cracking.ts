export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hashesBcryptCostoTiempoCracking(i: Inputs): Outputs {
  const c=Math.floor(Number(i.cost)||10);
  const base=2; const ms=base*Math.pow(2,c-10);
  const hs=1000/ms;
  let rec='OK'; if (c<10) rec='Subí a 10+'; else if (c>14) rec='Puede ser lento en servidor';
  return { hashPorSeg:`${hs.toFixed(1)}/s`, tiempo:`${ms.toFixed(1)} ms`, recomendacion:rec, resumen:`Cost ${c}: ${ms.toFixed(0)}ms/hash (${hs.toFixed(0)}/s).` };
}
