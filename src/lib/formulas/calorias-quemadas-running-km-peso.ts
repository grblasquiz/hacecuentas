export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function caloriasQuemadasRunningKmPeso(i: Inputs): Outputs {
  const km=Number(i.km)||0; const p=Number(i.pesoKg)||0; const r=String(i.ritmo||'moderado');
  const metR: Record<string,number> = { lento:8, moderado:10, rapido:11.5 };
  const minPorKm: Record<string,number> = { lento:6, moderado:5, rapido:4 };
  const min=km*minPorKm[r];
  const kcal=metR[r]*p*(min/60);
  return { kcalTotal:kcal.toFixed(0)+' kcal', porKm:(kcal/km).toFixed(0)+' kcal/km', resumen:`${km}km ${r} con ${p}kg: ${kcal.toFixed(0)} kcal (${(kcal/km).toFixed(0)}/km).` };
}
