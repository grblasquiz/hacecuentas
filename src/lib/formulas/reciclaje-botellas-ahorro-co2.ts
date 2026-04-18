export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function reciclajeBotellasAhorroCo2(i: Inputs): Outputs {
  const b = Number(i.botellas) || 0;
  const kgPet = (b * 40 * 52) / 1000;
  const co2 = kgPet * 2.3;
  return { kgCo2Año: co2.toFixed(1) + ' kg', resumen: `Reciclando ${b} botellas/sem ahorrás ${co2.toFixed(0)} kg CO₂/año.` };
}
