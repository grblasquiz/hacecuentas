export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoMascotaAnual(i: Inputs): Outputs {
  const p = Number(i.peso) || 10;
  const factor = i.tipo === 'perro' ? 120 : 40;
  const kg = p * factor;
  return { kgCo2: kg.toFixed(0) + ' kg', resumen: `${i.tipo} de ${p}kg: ${kg.toFixed(0)} kg CO₂/año (${(kg/1000).toFixed(1)} t).` };
}
