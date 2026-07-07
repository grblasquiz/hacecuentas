export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function compensacionCo2ArbolesVuelo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km = Number(i.km) || 0; const factor = i.clase === 'business' ? 0.45 : 0.15;
  const kg = km * factor; const arb = Math.ceil(kg / 22);
  const resumen = __lang === 'en'
    ? `Flight ${km}km ${i.clase}: ${kg.toFixed(0)}kg CO₂. Plant ${arb} trees to offset.`
    : `Vuelo ${km}km ${i.clase}: ${kg.toFixed(0)}kg CO₂. Plantá ${arb} árboles para compensar.`;
  const ton = kg / 1000;
  const _insight = __lang === 'en'
    ? {
        title: `${arb} trees to offset`,
        text: `This ${km} km ${i.clase} flight emits about **${kg.toFixed(0)} kg of CO₂** (~${ton.toFixed(2)} t). It takes **${arb} trees** absorbing 22 kg each over a year to neutralize that footprint.`,
        tone: kg >= 1000 ? 'warn' : kg >= 250 ? 'neutral' : 'good',
        icon: '🌳',
      }
    : {
        title: `${arb} árboles para compensar`,
        text: `Este vuelo de ${km} km en ${i.clase} emite cerca de **${kg.toFixed(0)} kg de CO₂** (~${ton.toFixed(2)} t). Hacen falta **${arb} árboles** que absorban 22 kg cada uno durante un año para neutralizar esa huella.`,
        tone: kg >= 1000 ? 'warn' : kg >= 250 ? 'neutral' : 'good',
        icon: '🌳',
      };
  return { kgCo2: kg.toFixed(0) + ' kg', arboles: arb.toString(), resumen, _insight };
}
