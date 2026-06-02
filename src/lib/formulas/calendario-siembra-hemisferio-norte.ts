export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function calendarioSiembraHemisferioNorte(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const plan: Record<string, { es: string; en: string }> = {
    enero:      { es: 'Frutales bare root, ajos',       en: 'Bare-root fruit trees, garlic' },
    febrero:    { es: 'Habas, arvejas indoor',           en: 'Broad beans, indoor peas' },
    marzo:      { es: 'Lechuga, rabanito',               en: 'Lettuce, radish' },
    abril:      { es: 'Tomate, pimiento, maíz',          en: 'Tomato, pepper, corn' },
    mayo:       { es: 'Pepino, sandía, calabaza',        en: 'Cucumber, watermelon, squash' },
    junio:      { es: 'Porotos, maíz tardío',            en: 'Beans, late corn' },
    julio:      { es: 'Coliflor, repollo otoño',         en: 'Cauliflower, autumn cabbage' },
    agosto:     { es: 'Acelga, lechuga otoño',           en: 'Swiss chard, autumn lettuce' },
    septiembre: { es: 'Ajos, espinaca invierno',         en: 'Garlic, winter spinach' },
    octubre:    { es: 'Ajos, bulbos floración',          en: 'Garlic, flowering bulbs' },
    noviembre:  { es: 'Frutales desnudos',               en: 'Bare-root fruit trees' },
    diciembre:  { es: 'Descanso/planificación',          en: 'Rest/planning' },
  };
  const m = String(i.mes);
  const entry = plan[m];
  const recomendadas = entry
    ? entry[__lang]
    : __lang === 'en' ? 'Variable' : 'Variable';
  const resumen = entry
    ? __lang === 'en'
      ? `In ${m} in the northern hemisphere: sow ${entry.en}.`
      : `En ${m} en hemisferio norte: sembrar ${entry.es}.`
    : __lang === 'en'
      ? `In ${m} in the northern hemisphere: sow varied crops.`
      : `En ${m} en hemisferio norte: sembrar variado.`;

  const insTitle = __lang === 'en' ? `What to sow in ${m}` : `Qué sembrar en ${m}`;
  const insText = entry
    ? (__lang === 'en'
        ? `In **${m}** (northern hemisphere) the season favors sowing **${entry.en}**. Match it to your local frost dates.`
        : `En **${m}** (hemisferio norte) la temporada favorece sembrar **${entry.es}**. Ajustalo a las heladas de tu zona.`)
    : (__lang === 'en'
        ? `For **${m}** there's no single recommendation: pick crops that suit your local climate and frost window.`
        : `Para **${m}** no hay una recomendación única: elegí cultivos según tu clima local y la ventana de heladas.`);

  return { recomendadas, resumen, _insight: { title: insTitle, text: insText, tone: 'neutral', icon: '🌱' } };
}
