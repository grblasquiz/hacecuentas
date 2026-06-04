export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

interface MethodSpec {
  ratio: number;        // water : coffee  (g water per g coffee)
  mlPerCup: number;     // mL of water per cup
  grindEs: string;
  grindEn: string;
  grindPt: string;
  nameEs: string;
  nameEn: string;
  namePt: string;
}

const METHODS: Record<string, MethodSpec> = {
  espresso: {
    ratio: 2,        // 1:2 (input dose : liquid yield); use dose directly
    mlPerCup: 30,    // 30 mL extraction yield per shot
    grindEs: 'muy fina', grindEn: 'extra fine', grindPt: 'muito fina',
    nameEs: 'Espresso', nameEn: 'Espresso', namePt: 'Espresso',
  },
  'espresso-doble': {
    ratio: 2,
    mlPerCup: 60,
    grindEs: 'muy fina', grindEn: 'extra fine', grindPt: 'muito fina',
    nameEs: 'Espresso doble', nameEn: 'Double espresso', namePt: 'Espresso duplo',
  },
  moka: {
    ratio: 10,       // 1:10 (g coffee : mL water)
    mlPerCup: 60,
    grindEs: 'media-fina', grindEn: 'fine-medium', grindPt: 'média-fina',
    nameEs: 'Moka (italiana)', nameEn: 'Moka pot', namePt: 'Moka (cafeteira italiana)',
  },
  aeropress: {
    ratio: 15,
    mlPerCup: 220,
    grindEs: 'media-fina', grindEn: 'medium-fine', grindPt: 'média-fina',
    nameEs: 'Aeropress', nameEn: 'AeroPress', namePt: 'AeroPress',
  },
  v60: {
    ratio: 16,
    mlPerCup: 250,
    grindEs: 'media', grindEn: 'medium', grindPt: 'média',
    nameEs: 'Pour-over / V60 / Chemex', nameEn: 'Pour-over / V60 / Chemex', namePt: 'Pour-over / V60 / Chemex',
  },
  'french-press': {
    ratio: 15,
    mlPerCup: 250,
    grindEs: 'gruesa', grindEn: 'coarse', grindPt: 'grossa',
    nameEs: 'French Press', nameEn: 'French Press', namePt: 'Prensa francesa',
  },
  drip: {
    ratio: 17,
    mlPerCup: 177,    // US 6 fl oz standard drip "cup"
    grindEs: 'media', grindEn: 'medium', grindPt: 'média',
    nameEs: 'Filtrado automático (drip)', nameEn: 'Auto-drip machine', namePt: 'Café coado automático',
  },
  'cold-brew': {
    ratio: 8,        // 1:8 concentrate (coffee:water)
    mlPerCup: 240,
    grindEs: 'muy gruesa', grindEn: 'extra coarse', grindPt: 'muito grossa',
    nameEs: 'Cold Brew (concentrado)', nameEn: 'Cold Brew (concentrate)', namePt: 'Cold Brew (concentrado)',
  },
};

export function cafeMolidoTazaMetodoPreparacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const metodo = String(i.metodo || 'v60');
  const tazas = Math.max(1, Math.round(Number(i.tazas) || 1));

  const spec = METHODS[metodo] || METHODS['v60'];

  // For espresso the ratio is input(g):output(mL), not water:coffee.
  // We use mlPerCup as liquid yield and ratio=2 means coffee = yield / 2.
  let cafeG: number;
  let aguaTotal: number;

  if (metodo === 'espresso' || metodo === 'espresso-doble') {
    // dose = yield_mL / ratio   (yield = 30 or 60 mL, ratio = 2 → dose = 15 or 30 g)
    cafeG = (spec.mlPerCup / spec.ratio) * tazas;
    aguaTotal = spec.mlPerCup * tazas; // water used (same as yield approx)
  } else {
    // standard: coffee_g = water_mL / ratio
    aguaTotal = spec.mlPerCup * tazas;
    cafeG = aguaTotal / spec.ratio;
  }

  // Tablespoons: 1 tbsp medium-ground ≈ 5.3 g (SCAA reference)
  const cucharadas = cafeG / 5.3;

  const methodName = __lang === 'en' ? spec.nameEn : __lang === 'pt' ? spec.namePt : spec.nameEs;
  const grindLabel = __lang === 'en' ? spec.grindEn : __lang === 'pt' ? spec.grindPt : spec.grindEs;

  const cafeStr = cafeG.toFixed(1);
  const cucharadasStr = cucharadas.toFixed(1);
  const aguaStr = aguaTotal.toFixed(0);

  let resultado: string;
  let resumen: string;
  let insightTitle: string;
  let insightText: string;

  if (__lang === 'en') {
    resultado = `${cafeStr} g of ground coffee`;
    resumen = `${tazas} cup${tazas !== 1 ? 's' : ''} of ${methodName}: ${cafeStr} g (≈ ${cucharadasStr} tbsp) of ${grindLabel}-ground coffee for ${aguaStr} mL of water.`;
    insightTitle = 'Your coffee dose';
    insightText = `For **${tazas} cup${tazas !== 1 ? 's' : ''}** of **${methodName}** you need **${cafeStr} g** (≈ ${cucharadasStr} tbsp) of **${grindLabel}**-ground coffee and ${aguaStr} mL of water. Ratio used: 1:${spec.ratio}.`;
  } else if (__lang === 'pt') {
    resultado = `${cafeStr} g de café moído`;
    resumen = `${tazas} xícara${tazas !== 1 ? 's' : ''} de ${methodName}: ${cafeStr} g (≈ ${cucharadasStr} colheres) de moagem ${grindLabel} para ${aguaStr} ml de água.`;
    insightTitle = 'Sua dose de café';
    insightText = `Para **${tazas} xícara${tazas !== 1 ? 's' : ''}** de **${methodName}** você precisa de **${cafeStr} g** (≈ ${cucharadasStr} colheres de sopa) de moagem **${grindLabel}** e ${aguaStr} ml de água. Proporção: 1:${spec.ratio}.`;
  } else {
    resultado = `${cafeStr} g de café molido`;
    resumen = `${tazas} taza${tazas !== 1 ? 's' : ''} de ${methodName}: ${cafeStr} g (≈ ${cucharadasStr} cucharadas) de molienda ${grindLabel} para ${aguaStr} ml de agua.`;
    insightTitle = 'Tu dosis de café';
    insightText = `Para **${tazas} taza${tazas !== 1 ? 's' : ''}** de **${methodName}** necesitás **${cafeStr} g** (≈ ${cucharadasStr} cucharadas) de molienda **${grindLabel}** y ${aguaStr} ml de agua. Ratio aplicado: 1:${spec.ratio}.`;
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: 'positive',
    icon: '☕',
  };

  return { resultado, resumen, _insight };
}
