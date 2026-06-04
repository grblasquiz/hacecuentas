export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Classic vanilla pound cake recipe scaler.
 *
 * Base recipe (per 1 serving, derived from traditional 1-lb-each ratio
 * scaled to an 8-serving standard loaf):
 *   butter  : 28 g  (226 g / 8)
 *   sugar   : 28 g  (226 g / 8)
 *   flour   : 28 g  (226 g / 8)
 *   eggs    : 0.5   (4 large eggs / 8)
 *   vanilla : 0.125 tsp (1 tsp / 8)
 *   baking powder: 0.0625 tsp (½ tsp / 8)
 *   salt    : 0.03125 tsp (¼ tsp / 8)
 *   milk    : 3.75 ml (30 ml / 8)
 *
 * v1 = original servings in the recipe the user has
 * v2 = desired servings they want to make
 * scaling factor = v2 / v1
 * Each ingredient = base_per_serving × v2
 */
export function ingredientesBudinVainillaCaseroAdaptar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const originalServings = Math.max(Number(i.v1) || 8, 1);
  const desiredServings  = Math.max(Number(i.v2) || 8, 1);

  // Base per serving (derived from classic 1-loaf / 8 servings recipe)
  const BASE_BUTTER_G   = 226 / 8;   // 28.25 g
  const BASE_SUGAR_G    = 226 / 8;   // 28.25 g
  const BASE_FLOUR_G    = 226 / 8;   // 28.25 g
  const BASE_EGGS       = 4   / 8;   // 0.5 eggs
  const BASE_VANILLA_TSP = 1  / 8;   // 0.125 tsp
  const BASE_BAKING_POW  = 0.5 / 8;  // 0.0625 tsp
  const BASE_SALT_TSP   = 0.25 / 8;  // 0.03125 tsp
  const BASE_MILK_ML    = 30   / 8;  // 3.75 ml

  // The user's original recipe is normalised to their original servings,
  // then multiplied up to desired servings.
  const factor = desiredServings / originalServings;

  // Scale each ingredient
  const butter  = BASE_BUTTER_G   * originalServings * factor;
  const sugar   = BASE_SUGAR_G    * originalServings * factor;
  const flour   = BASE_FLOUR_G    * originalServings * factor;
  const eggs    = BASE_EGGS       * originalServings * factor;
  const vanilla = BASE_VANILLA_TSP * originalServings * factor;
  const bakingP = BASE_BAKING_POW  * originalServings * factor;
  const salt    = BASE_SALT_TSP   * originalServings * factor;
  const milk    = BASE_MILK_ML    * originalServings * factor;

  // Baking time guide: base 60 min for 8 servings; adjust ±~2 min per serving delta
  const baseBakeMin = 60;
  const scaledBakeMin = Math.round(baseBakeMin + (desiredServings - 8) * 1.5);
  const bakeMin = Math.max(40, Math.min(90, scaledBakeMin));

  // Helper formatters
  const fmt1 = (n: number) => n.toFixed(1).replace(/\.0$/, '');
  const fmtEggs = (n: number) => {
    const whole = Math.floor(n);
    const frac  = n - whole;
    if (frac < 0.15)  return `${whole}`;
    if (frac < 0.4)   return whole === 0 ? '¼' : `${whole} ¼`;
    if (frac < 0.65)  return whole === 0 ? '½' : `${whole} ½`;
    if (frac < 0.9)   return whole === 0 ? '¾' : `${whole} ¾`;
    return `${whole + 1}`;
  };

  const scalingFactor = desiredServings / originalServings;

  if (__lang === 'en') {
    const resultado =
      `Butter: ${fmt1(butter)} g | Sugar: ${fmt1(sugar)} g | Flour: ${fmt1(flour)} g | ` +
      `Eggs: ${fmtEggs(eggs)} | Vanilla: ${fmt1(vanilla)} tsp | Baking powder: ${fmt1(bakingP)} tsp | ` +
      `Salt: ${fmt1(salt)} tsp | Milk: ${fmt1(milk)} ml`;

    const resumen =
      `Scaling factor: ×${scalingFactor.toFixed(2)}. ` +
      `For ${desiredServings} servings you need ${fmt1(butter)} g butter, ${fmt1(sugar)} g sugar, ` +
      `${fmt1(flour)} g flour, ${fmtEggs(eggs)} egg(s), ${fmt1(vanilla)} tsp vanilla, ` +
      `${fmt1(bakingP)} tsp baking powder, ${fmt1(salt)} tsp salt, ${fmt1(milk)} ml milk. ` +
      `Estimated bake time at 175 °C (350 °F): ${bakeMin} min.`;

    const _insight = {
      title: 'Scaled ingredient list',
      text:
        `Scaling factor **×${scalingFactor.toFixed(2)}** (${originalServings} → ${desiredServings} servings).\n\n` +
        `| Ingredient | Amount |\n|---|---|\n` +
        `| Unsalted butter | **${fmt1(butter)} g** |\n` +
        `| Granulated sugar | **${fmt1(sugar)} g** |\n` +
        `| All-purpose flour | **${fmt1(flour)} g** |\n` +
        `| Eggs (large) | **${fmtEggs(eggs)}** |\n` +
        `| Vanilla extract | **${fmt1(vanilla)} tsp** |\n` +
        `| Baking powder | **${fmt1(bakingP)} tsp** |\n` +
        `| Salt | **${fmt1(salt)} tsp** |\n` +
        `| Whole milk | **${fmt1(milk)} ml** |\n\n` +
        `Bake at **175 °C (350 °F)** for approx. **${bakeMin} minutes**, ` +
        `or until a skewer inserted in the centre comes out clean.`,
      tone: 'positive',
      icon: '🍰'
    };

    return { resultado, resumen, _insight };
  }

  // Spanish output
  const resultado =
    `Manteca: ${fmt1(butter)} g | Azúcar: ${fmt1(sugar)} g | Harina: ${fmt1(flour)} g | ` +
    `Huevos: ${fmtEggs(eggs)} | Vainilla: ${fmt1(vanilla)} cda. té | Polvo de hornear: ${fmt1(bakingP)} cda. té | ` +
    `Sal: ${fmt1(salt)} cda. té | Leche: ${fmt1(milk)} ml`;

  const resumen =
    `Factor de escala: ×${scalingFactor.toFixed(2)}. ` +
    `Para ${desiredServings} porciones necesitás ${fmt1(butter)} g de manteca, ${fmt1(sugar)} g de azúcar, ` +
    `${fmt1(flour)} g de harina, ${fmtEggs(eggs)} huevo(s), ${fmt1(vanilla)} cda. té de vainilla, ` +
    `${fmt1(bakingP)} cda. té de polvo de hornear, ${fmt1(salt)} cda. té de sal y ${fmt1(milk)} ml de leche. ` +
    `Tiempo estimado de cocción a 175 °C: ${bakeMin} min.`;

  const _insight = {
    title: 'Ingredientes ajustados',
    text:
      `Factor de escala **×${scalingFactor.toFixed(2)}** (${originalServings} → ${desiredServings} porciones).\n\n` +
      `| Ingrediente | Cantidad |\n|---|---|\n` +
      `| Manteca sin sal | **${fmt1(butter)} g** |\n` +
      `| Azúcar | **${fmt1(sugar)} g** |\n` +
      `| Harina | **${fmt1(flour)} g** |\n` +
      `| Huevos (grandes) | **${fmtEggs(eggs)}** |\n` +
      `| Esencia de vainilla | **${fmt1(vanilla)} cda. té** |\n` +
      `| Polvo de hornear | **${fmt1(bakingP)} cda. té** |\n` +
      `| Sal | **${fmt1(salt)} cda. té** |\n` +
      `| Leche entera | **${fmt1(milk)} ml** |\n\n` +
      `Horneá a **175 °C** unos **${bakeMin} minutos** o hasta que el palillo salga limpio.`,
    tone: 'positive',
    icon: '🍰'
  };

  return { resultado, resumen, _insight };
}
