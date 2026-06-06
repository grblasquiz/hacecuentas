export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; }
export function fertilizanteNpkDosis(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0; const t = String(i.tipo);
  // Dosis orientativas en g/m² según formulación NPK
  // Fuente: INTA Argentina — Fertilización en horticultura familiar
  const dosis: Record<string, number> = {
    '10-10-10': 30,  // Balanceado general — hortalizas y jardines
    '12-12-12': 30,  // Balanceado más concentrado — hortalizas
    '15-15-15': 25,  // Alta concentración balanceada — dosis menor
    '20-5-5': 20,    // Alto nitrógeno — césped y cultivos en crecimiento
    '15-5-20': 25,   // Alto potasio — frutales y pre-cosecha
    '5-10-15': 25,   // Alto fósforo y potasio — floración y raíces
    '5-20-20': 20,   // Floración/frutales — alto P y K
    '8-24-24': 20,   // Floración concentrada
    '13-40-13': 15,  // Soluble alta concentración P — arranque
  };
  const rate = dosis[t] || 30;
  const g = m * rate;
  const kg = g / 1000;
  const bolsas500 = Math.ceil(g / 500);
  const bolsas1kg = Math.ceil(g / 1000);
  const resumen = __lang === 'en'
    ? `Apply ${g.toFixed(0)} g of NPK ${t} to ${m} m² (rate: ${rate} g/m²).`
    : `Aplicar ${g.toFixed(0)} g de NPK ${t} en ${m} m² (dosis: ${rate} g/m²).`;
  const insText = __lang === 'en'
    ? `For **${m} m²** with NPK **${t}**, apply **${g.toFixed(0)} g** (${kg.toFixed(2)} kg) at a rate of **${rate} g/m²**. That's about ${bolsas500} bag(s) of 500 g or ${bolsas1kg} bag(s) of 1 kg. Spread evenly and water afterwards so it dissolves into the soil.`
    : `Para **${m} m²** con NPK **${t}**, aplicá **${g.toFixed(0)} g** (${kg.toFixed(2)} kg) a razón de **${rate} g/m²**. Necesitás aprox. ${bolsas500} bolsa(s) de 500 g o ${bolsas1kg} bolsa(s) de 1 kg. Esparcilo parejo y regá después para que se disuelva en el suelo.`;
  return {
    gramos: g.toFixed(0) + ' g',
    resumen,
    _insight: {
      title: __lang === 'en' ? 'How much to apply' : 'Cuánto aplicar',
      text: insText,
      tone: 'neutral',
      icon: '🌱'
    }
  };
}
