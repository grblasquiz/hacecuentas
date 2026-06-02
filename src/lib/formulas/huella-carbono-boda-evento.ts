export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function huellaCarbonoBodaEvento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const i_ = Number(i.invitados) || 0;
  const co2 = i_ * 150;
  const arb = Math.ceil(co2 / 22);
  const t = (co2 / 1000).toFixed(1);
  const resumen = __lang === 'en'
    ? `Wedding with ${i_} guests: ${t} t CO₂. Plant ${arb} trees to offset.`
    : __lang === 'pt'
    ? `Casamento com ${i_} convidados: ${t} t CO₂. Plante ${arb} árvores para compensar.`
    : `Boda con ${i_} invitados: ${t} t CO₂. Plantar ${arb} árboles para compensar.`;

  const _insight = i_ <= 0
    ? (__lang === 'en'
        ? { title: 'No guests yet', text: 'Enter the number of guests to estimate your event\'s carbon footprint.', tone: 'neutral', icon: '💍' }
        : __lang === 'pt'
        ? { title: 'Sem convidados', text: 'Informe o número de convidados para estimar a pegada de carbono do evento.', tone: 'neutral', icon: '💍' }
        : { title: 'Sin invitados', text: 'Ingresá la cantidad de invitados para estimar la huella de carbono del evento.', tone: 'neutral', icon: '💍' })
    : (__lang === 'en'
        ? { title: 'Event footprint', text: `Your wedding of **${i_} guests** generates about **${t} t CO₂** — roughly **150 kg per guest**. Offsetting it would take around **${arb} trees** growing for a year.`, tone: 'warn', icon: '💍' }
        : __lang === 'pt'
        ? { title: 'Pegada do evento', text: `Seu casamento de **${i_} convidados** gera cerca de **${t} t CO₂** — aproximadamente **150 kg por convidado**. Compensá-lo exigiria cerca de **${arb} árvores** por um ano.`, tone: 'warn', icon: '💍' }
        : { title: 'Huella del evento', text: `Tu boda de **${i_} invitados** genera unas **${t} t CO₂**, alrededor de **150 kg por invitado**. Compensarla requiere plantar unos **${arb} árboles** durante un año.`, tone: 'warn', icon: '💍' });

  return { kgCo2: t + ' t', arbolesCompensar: arb.toString(), resumen, _insight };
}
