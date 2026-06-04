export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

/**
 * Calorie calculator for a complete Caesar salad.
 *
 * Reference calorie densities (kcal/100g) from USDA FoodData Central:
 *   Romaine lettuce      : 17 kcal/100g  (FDC #169247)
 *   Caesar dressing      : 350 kcal/100g (traditional mayo-anchovy base)
 *   Croutons (bread)     : 407 kcal/100g (FDC #172745)
 *   Parmesan cheese      : 431 kcal/100g (FDC #173413)
 *   Chicken breast grilled: 165 kcal/100g (FDC #171477)
 *
 * Formula: total_kcal = Σ (ingredient_g × kcal_per_100g / 100)
 */

const KCAL_PER_100G: Record<string, number> = {
  lechuga:  17,
  aderezo:  350,
  crutones: 407,
  parmesano: 431,
  pollo:    165,
};

export function caloriasEnsaladaCesarCompletaIngredientes(i: Inputs, __lang = 'es'): Outputs {
  const lechuga   = Math.max(0, Number(i.lechuga)   || 0);   // grams
  const aderezo   = Math.max(0, Number(i.aderezo)   || 0);   // grams
  const crutones  = Math.max(0, Number(i.crutones)  || 0);   // grams
  const parmesano = Math.max(0, Number(i.parmesano) || 0);   // grams
  const pollo     = Math.max(0, Number(i.pollo)     || 0);   // grams (0 = sin pollo)

  const kcalLechuga   = lechuga   * KCAL_PER_100G.lechuga   / 100;
  const kcalAderezo   = aderezo   * KCAL_PER_100G.aderezo   / 100;
  const kcalCrutones  = crutones  * KCAL_PER_100G.crutones  / 100;
  const kcalParmesano = parmesano * KCAL_PER_100G.parmesano / 100;
  const kcalPollo     = pollo     * KCAL_PER_100G.pollo     / 100;

  const total = kcalLechuga + kcalAderezo + kcalCrutones + kcalParmesano + kcalPollo;

  const fmt2 = (n: number) => n.toFixed(0);
  const fmt1 = (n: number) => n.toFixed(1);

  // Determine the biggest caloric contributor
  const contributors: Array<[string, number]> = [
    [__lang === 'es' ? 'Lechuga romana' : 'Romaine lettuce', kcalLechuga],
    [__lang === 'es' ? 'Aderezo César'  : 'Caesar dressing',  kcalAderezo],
    [__lang === 'es' ? 'Crutones'       : 'Croutons',          kcalCrutones],
    [__lang === 'es' ? 'Parmesano'      : 'Parmesan',          kcalParmesano],
    [__lang === 'es' ? 'Pollo'          : 'Chicken',           kcalPollo],
  ].filter(([, v]) => (v as number) > 0);

  contributors.sort((a, b) => (b[1] as number) - (a[1] as number));
  const topContrib = contributors.length > 0
    ? contributors[0]
    : [__lang === 'es' ? 'ingredientes' : 'ingredients', 0];

  const pctTop = total > 0
    ? Math.round(((topContrib[1] as number) / total) * 100)
    : 0;

  // Classification
  let clasificacion: string;
  let insightTone: 'positive' | 'neutral' | 'warning';
  if (total <= 300) {
    clasificacion = __lang === 'es' ? 'Liviana (< 300 kcal)' : 'Light (< 300 kcal)';
    insightTone = 'positive';
  } else if (total <= 500) {
    clasificacion = __lang === 'es' ? 'Moderada (300–500 kcal)' : 'Moderate (300–500 kcal)';
    insightTone = 'neutral';
  } else if (total <= 700) {
    clasificacion = __lang === 'es' ? 'Calórica (500–700 kcal)' : 'High-cal (500–700 kcal)';
    insightTone = 'warning';
  } else {
    clasificacion = __lang === 'es' ? 'Muy calórica (> 700 kcal)' : 'Very high-cal (> 700 kcal)';
    insightTone = 'warning';
  }

  // Breakdown line
  const breakdownLines = [
    `${__lang === 'es' ? 'Lechuga romana' : 'Romaine lettuce'}: ${fmt1(kcalLechuga)} kcal`,
    `${__lang === 'es' ? 'Aderezo César' : 'Caesar dressing'}: ${fmt1(kcalAderezo)} kcal`,
    `${__lang === 'es' ? 'Crutones' : 'Croutons'}: ${fmt1(kcalCrutones)} kcal`,
    `${__lang === 'es' ? 'Parmesano' : 'Parmesan'}: ${fmt1(kcalParmesano)} kcal`,
    ...(pollo > 0 ? [`${__lang === 'es' ? 'Pollo' : 'Chicken'}: ${fmt1(kcalPollo)} kcal`] : []),
  ];

  const resumen = __lang === 'es'
    ? `Tu ensalada César tiene **${fmt2(total)} kcal** — ${clasificacion}.\n${breakdownLines.join(' · ')}`
    : `Your Caesar salad has **${fmt2(total)} kcal** — ${clasificacion}.\n${breakdownLines.join(' · ')}`;

  const insightText = __lang === 'es'
    ? `El ingrediente más calórico es **${topContrib[0]}** (${pctTop}% del total). El aderezo y los crutones suelen ser los que más engordan una César.`
    : `The top calorie contributor is **${topContrib[0]}** (${pctTop}% of total). Dressing and croutons are typically what makes a Caesar calorie-dense.`;

  return {
    resultado: `${fmt2(total)} kcal`,
    resumen,
    _insight: {
      title: __lang === 'es' ? 'Mayor fuente de calorías' : 'Top calorie source',
      text: insightText,
      tone: insightTone,
      icon: '🥗',
    },
  };
}
