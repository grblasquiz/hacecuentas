export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function progresionAritmeticaSumaTermino(i: Inputs): Outputs {
  const a1=Number(i.a1)||0; const d=Number(i.d)||0; const n=Number(i.n)||1;
  const an=a1+(n-1)*d; const sn=n*(a1+an)/2;
  return { an:an.toFixed(3), sn:sn.toFixed(3), resumen:`a${n}=${an.toFixed(2)}, S${n}=${sn.toFixed(2)}.` };
}
