export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Grams per teaspoon (1 tsp = ~5 mL) for common dry ingredients.
// Values sourced from USDA FoodData Central density data and widely reproduced
// culinary references. All values correspond to a leveled (flat) teaspoon.
const DENSITY: Record<string, { es: string; en: string; pt: string; g: number }> = {
  sal_fina:         { es: 'Sal fina de mesa',          en: 'Fine table salt',          pt: 'Sal refinado',             g: 6.0 },
  sal_gruesa:       { es: 'Sal gruesa / marina',        en: 'Coarse / sea salt',         pt: 'Sal grosso / marinho',     g: 4.5 },
  sal_escamas:      { es: 'Sal en escamas (Maldon)',    en: 'Flake salt (Maldon)',       pt: 'Sal em flocos (Maldon)',   g: 2.8 },
  azucar_blanca:    { es: 'Azúcar blanca granulada',   en: 'White granulated sugar',    pt: 'Açúcar refinado',          g: 4.0 },
  azucar_impalpable:{ es: 'Azúcar impalpable',         en: 'Powdered / icing sugar',    pt: 'Açúcar de confeiteiro',    g: 3.0 },
  azucar_morena:    { es: 'Azúcar morena / negra',     en: 'Brown sugar',               pt: 'Açúcar mascavo',           g: 4.5 },
  harina_comun:     { es: 'Harina común (0000)',       en: 'All-purpose flour',         pt: 'Farinha de trigo',         g: 3.0 },
  bicarbonato:      { es: 'Bicarbonato de sodio',      en: 'Baking soda',               pt: 'Bicarbonato de sódio',     g: 4.8 },
  polvo_hornear:    { es: 'Polvo de hornear / levadura química', en: 'Baking powder',   pt: 'Fermento em pó químico',   g: 4.0 },
  levadura_seca:    { es: 'Levadura seca activa',      en: 'Active dry yeast',          pt: 'Fermento biológico seco',  g: 3.0 },
  pimienta:         { es: 'Pimienta negra molida',     en: 'Ground black pepper',       pt: 'Pimenta-do-reino moída',   g: 2.0 },
  canela:           { es: 'Canela molida',             en: 'Ground cinnamon',           pt: 'Canela em pó',             g: 2.6 },
  oregano:          { es: 'Orégano seco',              en: 'Dried oregano',             pt: 'Orégano seco',             g: 1.0 },
  cafe:             { es: 'Café molido',               en: 'Ground coffee',             pt: 'Café moído',               g: 2.0 },
  cacao:            { es: 'Cacao en polvo',            en: 'Cocoa powder',              pt: 'Cacau em pó',              g: 2.6 },
  almidon:          { es: 'Almidón de maíz (maicena)', en: 'Cornstarch',               pt: 'Amido de milho (maisena)', g: 2.5 },
  curcuma:          { es: 'Cúrcuma molida',            en: 'Ground turmeric',           pt: 'Cúrcuma em pó',            g: 3.0 },
  comino:           { es: 'Comino molido',             en: 'Ground cumin',              pt: 'Cominho moído',            g: 2.5 },
  pimenton:         { es: 'Pimentón / paprika',        en: 'Paprika / smoked paprika',  pt: 'Páprica / colorau',        g: 2.5 },
  aji_molido:       { es: 'Ají molido',                en: 'Chili flakes / hot pepper', pt: 'Pimenta vermelha moída',   g: 2.0 },
};

export function conversionCucharaditasGramosEspeciasSal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const cucharaditas = Number(i.cucharaditas) || 0;
  const ingredienteKey = String(i.ingrediente || 'sal_fina');

  const entry = DENSITY[ingredienteKey] ?? DENSITY['sal_fina'];
  const gramsPerTsp = entry.g;
  const totalGrams = cucharaditas * gramsPerTsp;

  // Localized ingredient name
  const ingName = __lang === 'en' ? entry.en : __lang === 'pt' ? entry.pt : entry.es;

  // Tablespoon equivalent (1 cda = 3 cdta)
  const cucharadasEq = cucharaditas / 3;

  let resultado: string;
  let resumen: string;

  if (cucharaditas <= 0) {
    resultado = __lang === 'en' ? '0 g' : '0 g';
    resumen = __lang === 'en'
      ? 'Enter the number of teaspoons to get the result.'
      : __lang === 'pt'
      ? 'Informe o número de colheres de chá para obter o resultado.'
      : 'Ingresá la cantidad de cucharaditas para ver el resultado.';
  } else {
    const gFmt = totalGrams % 1 === 0
      ? totalGrams.toFixed(0)
      : totalGrams.toFixed(1);

    resultado = `${gFmt} g`;

    if (__lang === 'en') {
      resumen = `${cucharaditas} tsp of ${ingName} = **${gFmt} g** (${gramsPerTsp} g/tsp × ${cucharaditas} tsp). ` +
        `Equivalent to ${cucharadasEq.toFixed(2).replace(/\.?0+$/, '')} tablespoon(s). ` +
        `Always use a flat, leveled teaspoon for this result to apply.`;
    } else if (__lang === 'pt') {
      resumen = `${cucharaditas} colher(es) de chá de ${ingName} = **${gFmt} g** (${gramsPerTsp} g/colher × ${cucharaditas}). ` +
        `Equivalente a ${cucharadasEq.toFixed(2).replace(/\.?0+$/, '')} colher(es) de sopa. ` +
        `Use sempre colher nivelada (rasa) para este resultado ser válido.`;
    } else {
      resumen = `${cucharaditas} cdta de ${ingName} = **${gFmt} g** (${gramsPerTsp} g/cdta × ${cucharaditas}). ` +
        `Equivale a ${cucharadasEq.toFixed(2).replace(/\.?0+$/, '')} cda sopera. ` +
        `Usá cucharadita rasa (nivelada) para que el dato sea válido.`;
    }
  }

  // Build insight tip based on ingredient
  let insightText: string;
  const tipTitleEs = 'Dato de densidad';
  const tipTitleEn = 'Density fact';
  const tipTitlePt = 'Dado de densidade';

  if (__lang === 'en') {
    insightText = `**${ingName}**: 1 flat teaspoon = **${gramsPerTsp} g**. ` +
      (ingredienteKey === 'sal_fina' || ingredienteKey === 'sal_gruesa' || ingredienteKey === 'sal_escamas'
        ? `The WHO recommends under 5 g of salt per day for adults — that's less than 1 teaspoon of fine table salt. Packing or heaping adds 50–100% more weight.`
        : ingredienteKey === 'bicarbonato' || ingredienteKey === 'polvo_hornear'
        ? `Baking soda is ~3× more potent than baking powder as a leavener — never swap them 1:1 in a recipe.`
        : `Dense ingredients (salt, sugar) weigh more per teaspoon than light spices (oregano, cinnamon). Always level the spoon for consistent results.`);
  } else if (__lang === 'pt') {
    insightText = `**${ingName}**: 1 colher de chá rasa = **${gramsPerTsp} g**. ` +
      (ingredienteKey === 'sal_fina' || ingredienteKey === 'sal_gruesa' || ingredienteKey === 'sal_escamas'
        ? `A OMS recomenda menos de 5 g de sal por dia para adultos — menos de 1 colher de chá cheia de sal fino. Colher compactada pode ter 50–100% a mais.`
        : ingredienteKey === 'bicarbonato' || ingredienteKey === 'polvo_hornear'
        ? `Bicarbonato de sódio tem poder fermentativo ~3× maior que fermento em pó químico — nunca os substitua na proporção 1:1.`
        : `Ingredientes densos (sal, açúcar) pesam mais por colher do que especiarias leves (orégano, canela). Nivele sempre a colher para resultados consistentes.`);
  } else {
    insightText = `**${ingName}**: 1 cdta rasa = **${gramsPerTsp} g**. ` +
      (ingredienteKey === 'sal_fina' || ingredienteKey === 'sal_gruesa' || ingredienteKey === 'sal_escamas'
        ? `La OMS recomienda menos de 5 g de sal/día para adultos: menos de 1 cdta rasa de sal fina. Una cucharadita colmada puede pesar hasta el doble.`
        : ingredienteKey === 'bicarbonato' || ingredienteKey === 'polvo_hornear'
        ? `El bicarbonato es ~3 veces más leudante que el polvo de hornear — nunca los intercambiés en partes iguales en una receta.`
        : `Los ingredientes densos (sal, azúcar) pesan más por cucharadita que las especias livianas (orégano, canela). Siempre nivelá bien la cuchara.`);
  }

  const _insight = {
    title: __lang === 'en' ? tipTitleEn : __lang === 'pt' ? tipTitlePt : tipTitleEs,
    text: insightText,
    tone: 'neutral',
    icon: '🥄',
  };

  return { resultado, resumen, _insight };
}
