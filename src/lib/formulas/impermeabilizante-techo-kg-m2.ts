export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function impermeabilizanteTechoKgM2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const kg_m2 = i.tipo === 'membrana' ? 8 : 2.5;
  const total = m * kg_m2;
  const resumen = __lang === 'en'
    ? `${total.toFixed(0)} kg of ${i.tipo} for ${m} m² of roof.`
    : `${total.toFixed(0)} kg de ${i.tipo} para ${m} m² de techo.`;
  return { cantidad: total.toFixed(0) + ' kg', resumen };
}
