export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; }
export function fertilizanteNpkDosis(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0; const t = String(i.tipo);
  const dosis: Record<string, number> = { '10-10-10': 30, '15-5-20': 40, '5-10-15': 35 };
  const rate = dosis[t] || 30;
  const g = m * rate;
  const resumen = __lang === 'en'
    ? `Apply ${g.toFixed(0)} g of NPK ${t} to ${m} m².`
    : `Aplicar ${g.toFixed(0)} g de NPK ${t} en ${m} m².`;
  const kg = g / 1000;
  const insText = __lang === 'en'
    ? `For **${m} m²** with NPK **${t}**, apply **${g.toFixed(0)} g** (${kg.toFixed(2)} kg) — a rate of **${rate} g/m²**. Spread it evenly and water afterwards so it dissolves into the soil.`
    : `Para **${m} m²** con NPK **${t}**, aplicá **${g.toFixed(0)} g** (${kg.toFixed(2)} kg) — una dosis de **${rate} g/m²**. Esparcilo parejo y regá después para que se disuelva en el suelo.`;
  return { gramos: g.toFixed(0) + ' g', resumen, _insight: { title: __lang === 'en' ? 'How much to apply' : 'Cuánto aplicar', text: insText, tone: 'neutral', icon: '🌱' } };
}
