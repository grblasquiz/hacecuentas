export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function caloriasSurfKitesurfHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70; const m = Number(i.minutos) || 60;
  const cal = 6 * p * (m / 60);
  return { kcal: cal.toFixed(0) + ' kcal', resumen: `${m} min ${h1}: ${cal.toFixed(0)} kcal (${p}kg, MET 6).` };
}
