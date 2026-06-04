export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// USDA FoodData Central reference values (per 100 g)
// White bread: 265 kcal, 2.7 g fiber, 1.66 g fat, 49.2 g carbs, 8.9 g protein (FDC #353577)
// Whole wheat bread: 247 kcal, 6.8 g fiber, 3.56 g fat, 43.1 g carbs, 13.4 g protein (FDC #325871)
const KCAL_BLANCO_PER_100G = 265;
const KCAL_INTEGRAL_PER_100G = 247;
const FIBRA_BLANCO_PER_100G = 2.7;
const FIBRA_INTEGRAL_PER_100G = 6.8;

export function caloriasPanBlancoIntegralPorcion(i: Inputs): Outputs {
  const __lang = String(i.__lang || 'es');
  const isEn = __lang === 'en';
  const isPt = __lang === 'pt';

  // Accept either grams_white/grams_whole (EN) or gramos_blanco/gramos_integral (ES/PT)
  const gramosBlanco = Math.max(0, Number(i.gramos_blanco ?? i.grams_white ?? 0) || 0);
  const gramosIntegral = Math.max(0, Number(i.gramos_integral ?? i.grams_whole ?? 0) || 0);

  // Core calculation: kcal = (grams / 100) * kcal_per_100g
  const kcalBlanco = (gramosBlanco / 100) * KCAL_BLANCO_PER_100G;
  const kcalIntegral = (gramosIntegral / 100) * KCAL_INTEGRAL_PER_100G;
  const fibraBlanco = (gramosBlanco / 100) * FIBRA_BLANCO_PER_100G;
  const fibraIntegral = (gramosIntegral / 100) * FIBRA_INTEGRAL_PER_100G;

  const kcalBlancoFmt = Math.round(kcalBlanco);
  const kcalIntegralFmt = Math.round(kcalIntegral);
  const diferencia = kcalBlancoFmt - kcalIntegralFmt;
  const diferenciaAbs = Math.abs(diferencia);
  const fibraBlancoFmt = fibraBlanco.toFixed(1);
  const fibraIntegralFmt = fibraIntegral.toFixed(1);

  // Build comparison text
  let comparacion: string;
  let comparacionEn: string;
  let comparacionPt: string;

  if (gramosBlanco === 0 && gramosIntegral === 0) {
    comparacion = 'Ingresá los gramos de cada tipo de pan para ver la comparación calórica.';
    comparacionEn = 'Enter the grams of each bread type to see the calorie comparison.';
    comparacionPt = 'Insira os gramas de cada tipo de pão para ver a comparação calórica.';
  } else if (gramosBlanco === 0) {
    comparacion = `Tu porción de pan integral (${gramosIntegral} g) aporta **${kcalIntegralFmt} kcal** y ${fibraIntegralFmt} g de fibra.`;
    comparacionEn = `Your whole wheat portion (${gramosIntegral} g) provides **${kcalIntegralFmt} kcal** and ${fibraIntegralFmt} g of fiber.`;
    comparacionPt = `Sua porção de pão integral (${gramosIntegral} g) fornece **${kcalIntegralFmt} kcal** e ${fibraIntegralFmt} g de fibra.`;
  } else if (gramosIntegral === 0) {
    comparacion = `Tu porción de pan blanco (${gramosBlanco} g) aporta **${kcalBlancoFmt} kcal** y ${fibraBlancoFmt} g de fibra.`;
    comparacionEn = `Your white bread portion (${gramosBlanco} g) provides **${kcalBlancoFmt} kcal** and ${fibraBlancoFmt} g of fiber.`;
    comparacionPt = `Sua porção de pão branco (${gramosBlanco} g) fornece **${kcalBlancoFmt} kcal** e ${fibraBlancoFmt} g de fibra.`;
  } else if (diferencia > 0) {
    comparacion = `Pan blanco: **${kcalBlancoFmt} kcal** (${fibraBlancoFmt} g fibra) · Pan integral: **${kcalIntegralFmt} kcal** (${fibraIntegralFmt} g fibra). El blanco aporta **${diferenciaAbs} kcal más** en esta porción, con menos fibra.`;
    comparacionEn = `White bread: **${kcalBlancoFmt} kcal** (${fibraBlancoFmt} g fiber) · Whole wheat: **${kcalIntegralFmt} kcal** (${fibraIntegralFmt} g fiber). White bread has **${diferenciaAbs} more kcal** in this portion, with less fiber.`;
    comparacionPt = `Pão branco: **${kcalBlancoFmt} kcal** (${fibraBlancoFmt} g fibra) · Pão integral: **${kcalIntegralFmt} kcal** (${fibraIntegralFmt} g fibra). O pão branco tem **${diferenciaAbs} kcal a mais** nesta porção, com menos fibra.`;
  } else if (diferencia < 0) {
    comparacion = `Pan blanco: **${kcalBlancoFmt} kcal** (${fibraBlancoFmt} g fibra) · Pan integral: **${kcalIntegralFmt} kcal** (${fibraIntegralFmt} g fibra). El integral aporta **${diferenciaAbs} kcal más** en esta porción pero con mayor fibra.`;
    comparacionEn = `White bread: **${kcalBlancoFmt} kcal** (${fibraBlancoFmt} g fiber) · Whole wheat: **${kcalIntegralFmt} kcal** (${fibraIntegralFmt} g fiber). Whole wheat has **${diferenciaAbs} more kcal** in this portion but with more fiber.`;
    comparacionPt = `Pão branco: **${kcalBlancoFmt} kcal** (${fibraBlancoFmt} g fibra) · Pão integral: **${kcalIntegralFmt} kcal** (${fibraIntegralFmt} g fibra). O pão integral tem **${diferenciaAbs} kcal a mais** nesta porção, mas com mais fibra.`;
  } else {
    comparacion = `Pan blanco: **${kcalBlancoFmt} kcal** · Pan integral: **${kcalIntegralFmt} kcal**. ¡Calorías iguales en estas porciones! El integral sigue siendo mejor opción por su fibra.`;
    comparacionEn = `White bread: **${kcalBlancoFmt} kcal** · Whole wheat: **${kcalIntegralFmt} kcal**. Same calories in these portions! Whole wheat is still better for its fiber content.`;
    comparacionPt = `Pão branco: **${kcalBlancoFmt} kcal** · Pão integral: **${kcalIntegralFmt} kcal**. Mesmas calorias nestas porções! O integral ainda é melhor por seu conteúdo de fibra.`;
  }

  // Insight tone and text based on comparison
  let insightText: string;
  if (gramosBlanco > 0 && gramosIntegral > 0 && diferencia > 5) {
    insightText = isEn
      ? `Switching from white to whole wheat saves you ${diferenciaAbs} kcal in this portion and gives you ${(fibraIntegral - fibraBlanco).toFixed(1)} g more fiber — helping you feel fuller longer.`
      : isPt
        ? `Trocar pão branco por integral economiza ${diferenciaAbs} kcal nesta porção e oferece ${(fibraIntegral - fibraBlanco).toFixed(1)} g a mais de fibra — ajudando a saciar por mais tempo.`
        : `Cambiar de blanco a integral te ahorra ${diferenciaAbs} kcal en esta porción y te da ${(fibraIntegral - fibraBlanco).toFixed(1)} g más de fibra — aumentando la saciedad.`;
  } else {
    insightText = isEn
      ? `Whole wheat bread provides ${FIBRA_INTEGRAL_PER_100G} g of fiber per 100 g vs ${FIBRA_BLANCO_PER_100G} g in white — 2.5x more fiber regardless of calorie difference.`
      : isPt
        ? `O pão integral fornece ${FIBRA_INTEGRAL_PER_100G} g de fibra por 100 g vs ${FIBRA_BLANCO_PER_100G} g do branco — 2,5x mais fibra independente da diferença calórica.`
        : `El pan integral aporta ${FIBRA_INTEGRAL_PER_100G} g de fibra cada 100 g versus ${FIBRA_BLANCO_PER_100G} g del blanco — 2,5x más fibra independientemente de las calorías.`;
  }

  const _insight = {
    title: isEn ? 'Calorie comparison' : isPt ? 'Comparação calórica' : 'Comparación calórica',
    text: insightText,
    tone: 'info',
    icon: '🍞',
  };

  const kcalBlancoOutput = kcalBlancoFmt.toString();
  const kcalIntegralOutput = kcalIntegralFmt.toString();
  const comparacionOutput = isEn ? comparacionEn : isPt ? comparacionPt : comparacion;

  return {
    kcal_blanco: kcalBlancoOutput,
    kcal_integral: kcalIntegralOutput,
    comparacion: comparacionOutput,
    _insight,
  };
}
