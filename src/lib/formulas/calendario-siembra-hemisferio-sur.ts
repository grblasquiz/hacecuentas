export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
  return { recomendadas, resumen };
}
