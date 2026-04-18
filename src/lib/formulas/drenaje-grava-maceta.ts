export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function drenajeGravaMaceta(i: Inputs): Outputs {
  const V = Number(i.volumenMaceta) || 0;
  const min = V * 0.05; const max = V * 0.15;
  return { litrosGrava: `${min.toFixed(1)}-${max.toFixed(1)} L`, resumen: `Drenaje: ${min.toFixed(1)}-${max.toFixed(1)} L de grava para maceta de ${V} L.` };
}
