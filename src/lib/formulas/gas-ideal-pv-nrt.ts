export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gasIdealPvNrt(i: Inputs): Outputs {
  const p = Number(i.p); const v = Number(i.v); const t = Number(i.t);
  if (!p || !v || !t) throw new Error('Completá P, V, T');
  const R = 8.314;
  const n = (p * v) / (R * t);
  return { n: n.toFixed(4) + ' mol', resumen: `n = ${n.toFixed(3)} mol para P=${(p/1000).toFixed(1)}kPa, V=${v}m³, T=${t}K.` };
}
