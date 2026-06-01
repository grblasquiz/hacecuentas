export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function compensacionCo2ArbolesVuelo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km = Number(i.km) || 0; const factor = i.clase === 'business' ? 0.45 : 0.15;
  const kg = km * factor; const arb = Math.ceil(kg / 22);
  const resumen = __lang === 'en'
    ? `Flight ${km}km ${i.clase}: ${kg.toFixed(0)}kg CO₂. Plant ${arb} trees to offset.`
    : `Vuelo ${km}km ${i.clase}: ${kg.toFixed(0)}kg CO₂. Plantá ${arb} árboles para compensar.`;
  return { kgCo2: kg.toFixed(0) + ' kg', arboles: arb.toString(), resumen };
}
