export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function compensacionCo2ArbolesVuelo(i: Inputs): Outputs {
  const km = Number(i.km) || 0; const factor = i.clase === 'business' ? 0.45 : 0.15;
  const kg = km * factor; const arb = Math.ceil(kg / 22);
  return { kgCo2: kg.toFixed(0) + ' kg', arboles: arb.toString(), resumen: `Vuelo ${km}km ${i.clase}: ${kg.toFixed(0)}kg CO₂. Plantá ${arb} árboles para compensar.` };
}
