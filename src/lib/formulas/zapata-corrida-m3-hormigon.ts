export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function zapataCorridaM3Hormigon(i: Inputs): Outputs {
  const L = Number(i.L) || 0; const A = Number(i.A) || 0; const h = Number(i.h) || 0;
  const V = L * A * h;
  const bolsas = Math.ceil(V * 10);
  return { m3: V.toFixed(2), bolsasCemento: bolsas.toString(), resumen: `V = ${V.toFixed(2)} m³, ~${bolsas} bolsas cemento 50kg.` };
}
