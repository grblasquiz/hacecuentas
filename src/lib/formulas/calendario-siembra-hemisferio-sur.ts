export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function calendarioSiembraHemisferioSur(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const plan: Record<string, { es: string; en: string }> = {
    marzo:      { es: 'Acelga, espinaca, lechuga, rabanito',            en: 'Swiss chard, spinach, lettuce, radish' },
    abril:      { es: 'Habas, arvejas, zanahoria',                      en: 'Broad beans, peas, carrot' },
    mayo:       { es: 'Ajo, cebolla, arveja',                           en: 'Garlic, onion, pea' },
    junio:      { es: 'Alcauciles, ajos',                               en: 'Artichokes, garlic' },
    julio:      { es: 'Lechuga, espinaca',                              en: 'Lettuce, spinach' },
    agosto:     { es: 'Tomate (plantín), pimiento (plantín)',           en: 'Tomato (seedling), pepper (seedling)' },
    septiembre: { es: 'Maíz, zapallito, choclo',                       en: 'Corn, zucchini, sweet corn' },
    octubre:    { es: 'Tomate, zapallito, pimiento, morrón, calabaza', en: 'Tomato, zucchini, pepper, bell pepper, pumpkin' },
    noviembre:  { es: 'Sandía, melón, pepino',                         en: 'Watermelon, melon, cucumber' },
    diciembre:  { es: 'Porotos, maíz tardío',                          en: 'Beans, late corn' },
    enero:      { es: 'Acelga otoño, lechuga cabeza',                  en: 'Autumn chard, head lettuce' },
    febrero:    { es: 'Hinojo, zanahoria otoño, rúcula',               en: 'Fennel, autumn carrot, arugula' },
  };
  const m = String(i.mes);
  const entry = plan[m];
  const recomendadas = entry
    ? entry[__lang]
    : (__lang === 'en' ? 'Variable' : 'Variable');
  const resumen = entry
    ? (__lang === 'en'
        ? `In ${m} in the southern hemisphere: sow ${entry.en}.`
        : `En ${m} en hemisferio sur: sembrar ${entry.es}.`)
    : (__lang === 'en'
        ? `In ${m} in the southern hemisphere: sow varied crops.`
        : `En ${m} en hemisferio sur: sembrar variado.`);
  return { recomendadas, resumen };
}
