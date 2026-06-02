export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function reciclajeBotellasAhorroCo2(i: Inputs): Outputs {
  const b = Number(i.botellas) || 0;
  const kgPet = (b * 40 * 52) / 1000;
  const co2 = kgPet * 2.3;
  const _insight: any = b > 0 ? {
    title: 'Tu huella reciclando botellas',
    text: `Reciclando **${b} botellas/semana** evitás unos **${co2.toFixed(0)} kg de CO₂ al año** y recuperás **${kgPet.toFixed(1)} kg de PET**. Cada botella reciclada ahorra energía frente a producir plástico virgen.`,
    tone: 'good',
    icon: '♻️',
  } : undefined;
  return { kgCo2Año: co2.toFixed(1) + ' kg', resumen: `Reciclando ${b} botellas/sem ahorrás ${co2.toFixed(0)} kg CO₂/año.`, _insight };
}
