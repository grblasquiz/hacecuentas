export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function semillasPorM2Huerta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const dens: Record<string, number> = { lechuga: 20, tomate: 4, zanahoria: 200, rabano: 100, espinaca: 30 };
  const especie = String(i.especie);
  const d = dens[especie] || 10;
  const total = m * d;
  const resumen = __lang === 'en'
    ? `${m} m² of ${i.especie}: ${total.toFixed(0)} seeds.`
    : `${m} m² de ${i.especie}: ${total.toFixed(0)} semillas.`;

  const insightText = __lang === 'en'
    ? `For **${m} m²** of ${especie} you need about **${total.toFixed(0)} seeds**, at a density of **${d} seeds/m²**. Sow 10–15% extra to cover seeds that don't germinate.`
    : `Para **${m} m²** de ${especie} necesitás unas **${total.toFixed(0)} semillas**, a una densidad de **${d} semillas/m²**. Sembrá un 10–15% de más para cubrir las que no germinen.`;
  const _insight = {
    title: __lang === 'en' ? 'How much to sow' : 'Cuánto sembrar',
    text: insightText,
    tone: 'neutral',
    icon: '🌱',
  };

  return { semillas: total.toFixed(0), resumen, _insight };
}
