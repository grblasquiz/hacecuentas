export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function autonomiaTanqueLlenoKilometros(i: Inputs): Outputs {
  const c=Number(i.cap)||0; const r=Number(i.rend)||0;
  const km=c*r;
  return { km:`${km.toFixed(0)} km`, resumen:`${c}L × ${r}km/L = ${km.toFixed(0)} km.` };
}
