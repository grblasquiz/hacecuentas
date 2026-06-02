export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function huellaCarbonoMascotaAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p = Number(i.peso) || 10;
  const factor = i.tipo === 'perro' ? 120 : 40;
  const kg = p * factor;
  const t = (kg / 1000).toFixed(1);
  const arb = Math.ceil(kg / 22);
  const resumen = __lang === 'en'
    ? `${i.tipo} of ${p}kg: ${kg.toFixed(0)} kg CO₂/year (${t} t).`
    : `${i.tipo} de ${p}kg: ${kg.toFixed(0)} kg CO₂/año (${t} t).`;

  const especie = i.tipo === 'perro' ? (__lang === 'en' ? 'dog' : 'perro') : (__lang === 'en' ? 'cat' : 'gato');
  const _insight = __lang === 'en'
    ? { title: 'Pet footprint', text: `A **${p} kg ${especie}** emits about **${kg.toFixed(0)} kg CO₂/year** (**${t} t**), mostly from its meat-based diet. Offsetting it would take roughly **${arb} trees**.`, tone: 'neutral', icon: i.tipo === 'perro' ? '🐶' : '🐱' }
    : { title: 'Huella de tu mascota', text: `Un **${especie} de ${p} kg** emite unos **${kg.toFixed(0)} kg CO₂/año** (**${t} t**), sobre todo por su dieta a base de carne. Compensarlo requiere unos **${arb} árboles**.`, tone: 'neutral', icon: i.tipo === 'perro' ? '🐶' : '🐱' };

  return { kgCo2: kg.toFixed(0) + ' kg', resumen, _insight };
}
