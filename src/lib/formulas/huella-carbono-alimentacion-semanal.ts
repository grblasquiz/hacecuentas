export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoAlimentacionSemanal(i: Inputs): Outputs {
  const res = Number(i.carneRes) || 0; const pol = Number(i.polloPescado) || 0;
  const lac = Number(i.lacteos) || 0; const veg = Number(i.vegetales) || 0;
  const kgSem = res * 27 + pol * 6 + lac * 3 + veg * 2;
  const kgAño = kgSem * 52;
  return { kgCo2Semana: kgSem.toFixed(1) + ' kg', kgCo2Año: kgAño.toFixed(0) + ' kg', resumen: `CO2 semanal: ${kgSem.toFixed(1)} kg (anual ${(kgAño/1000).toFixed(1)} t).` };
}
