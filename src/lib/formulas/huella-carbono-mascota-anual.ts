export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoMascotaAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p = Number(i.peso) || 10;
  const factor = i.tipo === 'perro' ? 120 : 40;
  const kg = p * factor;
  const resumen = __lang === 'en'
    ? `${i.tipo} of ${p}kg: ${kg.toFixed(0)} kg CO₂/year (${(kg/1000).toFixed(1)} t).`
    : `${i.tipo} de ${p}kg: ${kg.toFixed(0)} kg CO₂/año (${(kg/1000).toFixed(1)} t).`;
  return { kgCo2: kg.toFixed(0) + ' kg', resumen };
}
