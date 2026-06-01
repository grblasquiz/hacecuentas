export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoBodaEvento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const i_ = Number(i.invitados) || 0;
  const co2 = i_ * 150;
  const arb = Math.ceil(co2 / 22);
  const resumen = __lang === 'en'
    ? `Wedding with ${i_} guests: ${(co2/1000).toFixed(1)} t CO₂. Plant ${arb} trees to offset.`
    : __lang === 'pt'
    ? `Casamento com ${i_} convidados: ${(co2/1000).toFixed(1)} t CO₂. Plante ${arb} árvores para compensar.`
    : `Boda con ${i_} invitados: ${(co2/1000).toFixed(1)} t CO₂. Plantar ${arb} árboles para compensar.`;
  return { kgCo2: (co2/1000).toFixed(1) + ' t', arbolesCompensar: arb.toString(), resumen };
}
