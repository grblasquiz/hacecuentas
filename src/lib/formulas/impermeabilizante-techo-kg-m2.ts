export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function impermeabilizanteTechoKgM2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const kg_m2 = i.tipo === 'membrana' ? 8 : 2.5;
  const total = m * kg_m2;
  const resumen = __lang === 'en'
    ? `${total.toFixed(0)} kg of ${i.tipo} for ${m} m² of roof.`
    : `${total.toFixed(0)} kg de ${i.tipo} para ${m} m² de techo.`;
  const _insight = __lang === 'en'
    ? {
        title: 'How much you need',
        text: `At **${kg_m2} kg/m²** for ${i.tipo}, ${m} m² of roof requires **${total.toFixed(0)} kg** of product. Add ~5–10% extra for overlaps, waste and a uniform finish.`,
        tone: 'neutral' as const,
        icon: '🪣',
      }
    : {
        title: 'Cuánto vas a necesitar',
        text: `A razón de **${kg_m2} kg/m²** para ${i.tipo}, ${m} m² de techo requieren **${total.toFixed(0)} kg** de producto. Sumá ~5–10% extra por solapes, desperdicio y terminación pareja.`,
        tone: 'neutral' as const,
        icon: '🪣',
      };
  return { cantidad: total.toFixed(0) + ' kg', resumen, _insight };
}
