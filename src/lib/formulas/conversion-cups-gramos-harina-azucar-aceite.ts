export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Cup-to-grams conversion for common baking ingredients.
 *
 * Density factors (g per 1 US legal cup = 240 mL) are sourced from:
 *   - King Arthur Baking Ingredient Weight Chart (https://www.kingarthurbaking.com/learn/ingredient-weight-chart)
 *   - USDA FoodData Central (https://fdc.nal.usda.gov)
 *
 * Input fields:
 *   cups       — number of cups (decimal allowed, e.g. 2.25)
 *   ingredient — ingredient key (string, from select options)
 */

const DENSITIES: Record<string, { es: string; en: string; pt: string; gpercup: number }> = {
  harina_0000:       { es: 'Harina 0000 / Todo uso',        en: 'All-purpose flour',        pt: 'Farinha de trigo (peneirada)',   gpercup: 120 },
  harina_leudante:   { es: 'Harina leudante (self-rising)', en: 'Self-rising flour',         pt: 'Farinha com fermento',           gpercup: 120 },
  harina_integral:   { es: 'Harina integral',               en: 'Whole-wheat flour',         pt: 'Farinha integral',               gpercup: 130 },
  harina_almendras:  { es: 'Harina de almendras',           en: 'Almond flour',              pt: 'Farinha de amêndoas',            gpercup:  96 },
  azucar_blanca:     { es: 'Azúcar blanca granulada',       en: 'Granulated white sugar',    pt: 'Açúcar refinado',                gpercup: 200 },
  azucar_morena:     { es: 'Azúcar morena compactada',      en: 'Brown sugar (packed)',      pt: 'Açúcar mascavo (compactado)',    gpercup: 220 },
  azucar_impalpable: { es: 'Azúcar impalpable / glasé',     en: 'Powdered / icing sugar',   pt: 'Açúcar de confeiteiro',          gpercup: 120 },
  cacao_polvo:       { es: 'Cacao amargo en polvo',         en: 'Unsweetened cocoa powder',  pt: 'Cacau em pó (peneirado)',        gpercup:  85 },
  aceite_vegetal:    { es: 'Aceite vegetal (girasol/maíz)', en: 'Vegetable oil',             pt: 'Óleo vegetal (soja/milho)',      gpercup: 220 },
  aceite_oliva:      { es: 'Aceite de oliva extra virgen',  en: 'Extra-virgin olive oil',    pt: 'Azeite de oliva extra virgem',  gpercup: 216 },
  manteca_solida:    { es: 'Manteca sólida / Manteiga',     en: 'Butter (solid)',            pt: 'Manteiga (sólida)',              gpercup: 227 },
  leche_entera:      { es: 'Leche entera',                  en: 'Whole milk',                pt: 'Leite integral',                gpercup: 240 },
  miel:              { es: 'Miel',                          en: 'Honey',                     pt: 'Mel',                           gpercup: 340 },
  avena_fina:        { es: 'Avena en copos finos',          en: 'Rolled oats (quick-cook)',  pt: 'Aveia em flocos finos',         gpercup:  90 },
  avena_gruesa:      { es: 'Avena en copos gruesos',        en: 'Rolled oats (old-fashioned)', pt: 'Aveia em flocos grossos',     gpercup:  80 },
  chips_chocolate:   { es: 'Chips de chocolate',            en: 'Chocolate chips',           pt: 'Gotas de chocolate',            gpercup: 170 },
  coco_rallado:      { es: 'Coco rallado seco',             en: 'Shredded coconut (dry)',    pt: 'Coco ralado seco',              gpercup:  80 },
  arroz_crudo:       { es: 'Arroz crudo',                   en: 'Uncooked rice',             pt: 'Arroz cru',                     gpercup: 195 },
};

export function conversionCupsGramosHarinaAzucarAceite(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const cups = Math.max(0, Number(i.cups) || 0);
  const ingredientKey = (i.ingredient as string) || 'harina_0000';
  const entry = DENSITIES[ingredientKey] ?? DENSITIES['harina_0000'];

  const gramos = cups * entry.gpercup;
  const gramosFmt = gramos % 1 === 0 ? gramos.toFixed(0) : gramos.toFixed(1);
  const cupsLabel = cups % 1 === 0 ? cups.toFixed(0) : cups.toString();

  const ingredientLabel = entry[__lang];
  const gpercup = entry.gpercup;

  // Result label varies by language
  const resultLabel =
    __lang === 'en' ? `${gramosFmt} g` :
    __lang === 'pt' ? `${gramosFmt} g` :
    `${gramosFmt} g`;

  const resumen =
    __lang === 'en'
      ? `${cupsLabel} cup${cups !== 1 ? 's' : ''} of ${ingredientLabel} = **${gramosFmt} g** (density factor: ${gpercup} g/cup, based on King Arthur Baking weight chart, 1 US cup = 240 mL).`
      : __lang === 'pt'
      ? `${cupsLabel} xícara${cups !== 1 ? 's' : ''} de ${ingredientLabel} = **${gramosFmt} g** (fator: ${gpercup} g/xícara de 240 mL, baseado na tabela King Arthur Baking e USDA).`
      : `${cupsLabel} cup${cups !== 1 ? 's' : ''} de ${ingredientLabel} = **${gramosFmt} g** (factor de densidad: ${gpercup} g/cup, según King Arthur Baking y USDA FoodData Central, 1 cup USA = 240 mL).`;

  const _insight = {
    title:
      __lang === 'en' ? 'Why grams beat cups in baking'
      : __lang === 'pt' ? 'Por que gramas superam xícaras na confeitaria'
      : 'Por qué los gramos le ganan a las tazas en repostería',
    text:
      __lang === 'en'
        ? `Your result: **${gramosFmt} g** of ${ingredientLabel}. A "cup" is a volume unit (240 mL), not a weight — so its gram equivalent changes with every ingredient: all-purpose flour ≈ 120 g, sugar ≈ 200 g, oil ≈ 220 g. Even the same ingredient can vary 15–30% depending on whether it's sifted or scooped. A kitchen scale eliminates that variable entirely.`
        : __lang === 'pt'
        ? `Resultado: **${gramosFmt} g** de ${ingredientLabel}. Uma "xícara" é uma medida de volume (240 mL), não de massa — então o peso em gramas muda para cada ingrediente: farinha ≈ 120 g, açúcar ≈ 200 g, óleo ≈ 220 g. O mesmo ingrediente pode variar 15–30% dependendo de como você mede. Uma balança de cozinha elimina essa variação.`
        : `Resultado: **${gramosFmt} g** de ${ingredientLabel}. La "taza" es una medida de volumen (240 mL), no de peso: por eso el equivalente en gramos cambia con cada ingrediente. Harina ≈ 120 g, azúcar blanca ≈ 200 g, aceite ≈ 220 g. El mismo ingrediente puede variar un 15–30% según cómo llenes la taza. Una balanza digital elimina esa variabilidad.`,
    tone: 'neutral',
    icon: '🧁',
  };

  return { resultado: resultLabel, resumen, _insight };
}
