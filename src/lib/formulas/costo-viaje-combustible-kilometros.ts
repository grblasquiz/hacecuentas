export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoViajeCombustibleKilometros(i: Inputs): Outputs {
  const km=Number(i.km)||0; const r=Number(i.rend)||1; const p=Number(i.precio)||0;
  const l=km/r; const c=l*p;
  return { litros:`${l.toFixed(1)} L`, costo:`$${c.toFixed(2)}`, perKm:`$${(c/km).toFixed(2)}/km`, resumen:`${km}km = ${l.toFixed(1)}L × $${p} = $${c.toFixed(2)}.` };
}
