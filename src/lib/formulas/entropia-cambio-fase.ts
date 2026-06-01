export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function entropiaCambioFase(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const q = Number(i.q); const t = Number(i.t);
  if (q === undefined || !t) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá');
  const dS = q / t;
  const resumen = __lang === 'en'
    ? `ΔS = ${dS.toFixed(1)} J/K (absorbing ${(q/1000).toFixed(1)}kJ at ${t}K).`
    : `ΔS = ${dS.toFixed(1)} J/K (absorbiendo ${(q/1000).toFixed(1)}kJ a ${t}K).`;
  return { deltaS: dS.toFixed(2) + ' J/K', resumen };
}
