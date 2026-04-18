export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function progresionGeometricaSumaTermino(i: Inputs): Outputs {
  const a1=Number(i.a1)||0; const r=Number(i.r)||1; const n=Number(i.n)||1;
  const an=a1*Math.pow(r,n-1);
  const sn=r===1?n*a1:a1*(Math.pow(r,n)-1)/(r-1);
  return { an:an.toFixed(3), sn:sn.toFixed(3), resumen:`a${n}=${an.toFixed(2)}, S${n}=${sn.toFixed(2)}.` };
}
