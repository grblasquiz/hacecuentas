export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Egg size → grams of white, yolk and whole edible portion.
 *
 * Weight references (whole egg with shell):
 *   AR SENASA / CAA: P<48g, M 48–57g, G 57–67g, XG 67–73g, J>73g
 *   USDA: Small≈43g, Medium≈50g, Large≈57g, XL≈64g, Jumbo≈71g
 *
 * Composition ratios (source: USDA FoodData Central SR Legacy #01123):
 *   Shell ≈ 9% of whole weight
 *   Edible (white+yolk) ≈ 91% of whole weight
 *   White ≈ 58% of whole weight  (≈ 64% of edible)
 *   Yolk  ≈ 31% of whole weight  (≈ 34% of edible)
 *   (remaining ~2% = membranes/chalaza absorbed into yolk figure)
 *
 * Midpoint weights used for each named size:
 *   AR: P=44g, M=52g, G=62g, XG=70g, J=78g
 *   EN: Small=43g, Medium=50g, Large=57g, XL=64g, Jumbo=71g
 */

const SIZE_WEIGHT_AR: Record<string, number> = {
  P:  44,
  M:  52,
  G:  62,
  XG: 70,
  J:  78,
};

const SIZE_WEIGHT_EN: Record<string, number> = {
  S:  43,
  M:  50,
  L:  57,
  XL: 64,
  J:  71,
};

// Proportions of the whole (with shell) egg weight
const SHELL_RATIO   = 0.09;
const WHITE_RATIO   = 0.58;
const YOLK_RATIO    = 0.31;

export function equivalenciaHuevosTamanoGramosClaras(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const tamano   = String(i.tamano   || (i.__lang === 'en' ? 'L' : 'G'));
  const cantidad = Math.max(0.5, Math.min(100, Number(i.cantidad) || 1));

  const sizeMap  = __lang === 'en' ? SIZE_WEIGHT_EN : SIZE_WEIGHT_AR;
  const pesoUno  = sizeMap[tamano] ?? (__lang === 'en' ? 57 : 62); // fallback = L / G

  const pesoTotalBruto = pesoUno * cantidad;
  const pesoClara      = Math.round(WHITE_RATIO * pesoUno * cantidad);
  const pesoYema       = Math.round(YOLK_RATIO  * pesoUno * cantidad);
  const pesoComestible = Math.round((1 - SHELL_RATIO) * pesoUno * cantidad);

  // How many of this size to match a target of grams of white
  // (convenience figure shown in insight)
  const claraUnidad = Math.round(WHITE_RATIO * pesoUno);

  if (__lang === 'en') {
    const sizeLabel: Record<string, string> = { S: 'Small', M: 'Medium', L: 'Large', XL: 'Extra Large', J: 'Jumbo' };
    const label = sizeLabel[tamano] ?? tamano;
    const resumen =
      `${cantidad} ${label} egg${cantidad !== 1 ? 's' : ''} (${pesoUno}g each with shell): `
      + `${pesoClara}g white · ${pesoYema}g yolk · ${pesoComestible}g edible total.`;
    const _insight = {
      title: 'Reading the result',
      text:
        `**${pesoClara}g of egg white** from ${cantidad} ${label} egg${cantidad !== 1 ? 's' : ''}. `
        + `Each ${label} egg provides about **${claraUnidad}g white** and **${Math.round(YOLK_RATIO * pesoUno)}g yolk**. `
        + `Change the size or count to match your recipe exactly.`,
      tone: 'neutral',
      icon: '🥚',
    };
    return {
      clara:      pesoClara,
      yema:       pesoYema,
      comestible: pesoComestible,
      resumen,
      _insight,
    };
  }

  // ES
  const sizeLabel: Record<string, string> = {
    P: 'Pequeño (P)', M: 'Mediano (M)', G: 'Grande (G)', XG: 'Extra Grande (XG)', J: 'Jumbo (J)',
  };
  const label = sizeLabel[tamano] ?? tamano;
  const resumen =
    `${cantidad} huevo${cantidad !== 1 ? 's' : ''} ${label} (${pesoUno}g c/u con cáscara): `
    + `${pesoClara}g de clara · ${pesoYema}g de yema · ${pesoComestible}g comestibles en total.`;
  const _insight = {
    title: 'Cómo leer el resultado',
    text:
      `**${pesoClara}g de clara** de ${cantidad} huevo${cantidad !== 1 ? 's' : ''} ${label}. `
      + `Cada huevo ${label} aporta ~**${claraUnidad}g de clara** y ~**${Math.round(YOLK_RATIO * pesoUno)}g de yema**. `
      + `Cambiá el tamaño o la cantidad para ajustar a tu receta exactamente.`,
    tone: 'neutral',
    icon: '🥚',
  };
  return {
    clara:      pesoClara,
    yema:       pesoYema,
    comestible: pesoComestible,
    resumen,
    _insight,
  };
}
