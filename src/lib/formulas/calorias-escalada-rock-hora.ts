export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function caloriasEscaladaRockHora(i: Inputs): Outputs {
  const p = Number(i.peso) || 70; const m = Number(i.minutos) || 60;
  const cal = 9 * p * (m / 60);
  return { kcal: cal.toFixed(0) + ' kcal', resumen: `${m} min escalada en roca: ${cal.toFixed(0)} kcal (${p}kg, MET 9).` };
}
