export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function entropiaCambioFase(i: Inputs): Outputs {
  const q = Number(i.q); const t = Number(i.t);
  if (q === undefined || !t) throw new Error('Completá');
  const dS = q / t;
  return { deltaS: dS.toFixed(2) + ' J/K', resumen: `ΔS = ${dS.toFixed(1)} J/K (absorbiendo ${(q/1000).toFixed(1)}kJ a ${t}K).` };
}
