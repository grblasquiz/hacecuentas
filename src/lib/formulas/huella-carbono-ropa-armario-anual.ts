export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoRopaArmarioAnual(i: Inputs): Outputs {
  const r = Number(i.remeras) || 0; const p = Number(i.pantalones) || 0;
  const z = Number(i.zapatos) || 0; const a = Number(i.abrigos) || 0;
  const co2 = r * 7 + p * 11 + z * 14 + a * 20;
  return { kgCo2: co2.toFixed(0) + ' kg', resumen: `${co2.toFixed(0)} kg CO₂/año en ropa. Regla: comprar menos + calidad = -60%.` };
}
