export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function calendarioSiembraHemisferioSur(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const plan: Record<string, { es: string; en: string; pt: string }> = {
    marzo:      { es: 'Acelga, espinaca, lechuga, rabanito',            en: 'Swiss chard, spinach, lettuce, radish',                        pt: 'Acelga, espinafre, alface, rabanete' },
    abril:      { es: 'Habas, arvejas, zanahoria',                      en: 'Broad beans, peas, carrot',                                    pt: 'Favas, ervilhas, cenoura' },
    mayo:       { es: 'Ajo, cebolla, arveja',                           en: 'Garlic, onion, pea',                                           pt: 'Alho, cebola, ervilha' },
    junio:      { es: 'Alcauciles, ajos',                               en: 'Artichokes, garlic',                                           pt: 'Alcachofas, alhos' },
    julio:      { es: 'Lechuga, espinaca',                              en: 'Lettuce, spinach',                                             pt: 'Alface, espinafre' },
    agosto:     { es: 'Tomate (plantín), pimiento (plantín)',           en: 'Tomato (seedling), pepper (seedling)',                         pt: 'Tomate (muda), pimentão (muda)' },
    septiembre: { es: 'Maíz, zapallito, choclo',                       en: 'Corn, zucchini, sweet corn',                                   pt: 'Milho, abobrinha, milho-verde' },
    octubre:    { es: 'Tomate, zapallito, pimiento, morrón, calabaza', en: 'Tomato, zucchini, pepper, bell pepper, pumpkin',               pt: 'Tomate, abobrinha, pimenta, pimentão, abóbora' },
    noviembre:  { es: 'Sandía, melón, pepino',                         en: 'Watermelon, melon, cucumber',                                  pt: 'Melancia, melão, pepino' },
    diciembre:  { es: 'Porotos, maíz tardío',                          en: 'Beans, late corn',                                             pt: 'Feijão, milho tardio' },
    enero:      { es: 'Acelga otoño, lechuga cabeza',                  en: 'Autumn chard, head lettuce',                                   pt: 'Acelga de outono, alface repolhuda' },
    febrero:    { es: 'Hinojo, zanahoria otoño, rúcula',               en: 'Fennel, autumn carrot, arugula',                               pt: 'Funcho, cenoura de outono, rúcula' },
  };
  const m = String(i.mes);
  const entry = plan[m];
  const recomendadas = entry
    ? entry[__lang]
    : (__lang === 'en' ? 'Variable' : 'Variable');
  const resumen = entry
    ? (__lang === 'en'
        ? `In ${m} in the southern hemisphere: sow ${entry.en}.`
        : __lang === 'pt'
          ? `Em ${m} no hemisfério sul: plantar ${entry.pt}.`
          : `En ${m} en hemisferio sur: sembrar ${entry.es}.`)
    : (__lang === 'en'
        ? `In ${m} in the southern hemisphere: sow varied crops.`
        : __lang === 'pt'
          ? `Em ${m} no hemisfério sul: plantar culturas variadas.`
          : `En ${m} en hemisferio sur: sembrar variado.`);

  const insTitle = __lang === 'en' ? `What to sow in ${m}` : __lang === 'pt' ? `O que plantar em ${m}` : `Qué sembrar en ${m}`;
  const insText = entry
    ? (__lang === 'en'
        ? `In **${m}** (southern hemisphere) the season favors sowing **${entry.en}**. Match it to your local frost dates.`
        : __lang === 'pt'
          ? `Em **${m}** (hemisfério sul) a estação favorece plantar **${entry.pt}**. Ajuste às geadas da sua região.`
          : `En **${m}** (hemisferio sur) la temporada favorece sembrar **${entry.es}**. Ajustalo a las heladas de tu zona.`)
    : (__lang === 'en'
        ? `For **${m}** there's no single recommendation: pick crops that suit your local climate and frost window.`
        : __lang === 'pt'
          ? `Para **${m}** não há recomendação única: escolha culturas conforme o clima local e a janela de geadas.`
          : `Para **${m}** no hay una recomendación única: elegí cultivos según tu clima local y la ventana de heladas.`);

  return { recomendadas, resumen, _insight: { title: insTitle, text: insText, tone: 'neutral', icon: '🌱' } };
}
