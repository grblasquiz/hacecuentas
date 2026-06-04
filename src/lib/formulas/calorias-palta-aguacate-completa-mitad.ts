export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Nutritional values per 100 g of avocado pulp (USDA FoodData Central, NDB #09037)
const KCAL_PER_100G    = 160;
const FAT_PER_100G     = 14.66;  // g
const CARBS_PER_100G   = 8.53;   // g (total)
const FIBER_PER_100G   = 6.7;    // g
const PROTEIN_PER_100G = 2.0;    // g

// Typical pulp weights per portion (edible flesh, no skin/pit)
const PORTION_GRAMS: Record<string, number> = {
  entera:  150,  // whole medium avocado ~150 g pulp
  mitad:    75,  // half medium avocado ~75 g pulp
  cuarto:   38,  // quarter ~38 g pulp
  porcion:  50,  // official USDA serving (1/3 medium) ~50 g
  custom:    0,  // user enters grams directly
};

export function caloriasPaltaAguacateCompletaMitad(i: Inputs): Outputs {
  const porcion = String(i.porcion || 'entera');
  const gramos_custom = Number(i.gramos_pulpa) || 0;

  // Determine grams to compute
  const gramos = porcion === 'custom'
    ? gramos_custom
    : PORTION_GRAMS[porcion] ?? 150;

  if (gramos <= 0) {
    return {
      calorias:  'Ingresá los gramos o elegí una porción',
      grasas:    '—',
      carbos_netos: '—',
      proteinas: '—',
      fibra:     '—',
      resumen:   'Seleccioná una porción o ingresá los gramos de pulpa.',
      _insight: {
        title: 'Ingresá una porción',
        text:  'Elegí una porción (entera, mitad, etc.) o ingresá los gramos de pulpa para ver las calorías.',
        tone:  'neutral',
        icon:  '🥑',
      },
    };
  }

  const kcal    = Math.round((KCAL_PER_100G    * gramos) / 100);
  const grasas  = ((FAT_PER_100G     * gramos) / 100).toFixed(1);
  const carbs   = ((CARBS_PER_100G   * gramos) / 100).toFixed(1);
  const fibra   = ((FIBER_PER_100G   * gramos) / 100).toFixed(1);
  const netCarbs = Math.max(0, (CARBS_PER_100G - FIBER_PER_100G) * gramos / 100).toFixed(1);
  const proteinas = ((PROTEIN_PER_100G * gramos) / 100).toFixed(1);

  const porcionLabel: Record<string, string> = {
    entera:  'palta entera mediana',
    mitad:   'media palta mediana',
    cuarto:  'cuarto de palta',
    porcion: 'porción estándar (1/3)',
    custom:  `${gramos} g de pulpa`,
  };
  const label = porcionLabel[porcion] ?? `${gramos} g`;

  const lang = String(i.__lang || 'es');

  // Bilingual insight
  const insightTitle = lang === 'en' ? 'Avocado calories' : 'Calorías de la palta';
  const insightText  = lang === 'en'
    ? `**${label}** (${gramos} g pulp) provides **${kcal} kcal**, ${grasas} g fat, ${netCarbs} g net carbs and ${proteinas} g protein. Fat is mostly monounsaturated (oleic acid) — heart-healthy.`
    : `**${label}** (${gramos} g de pulpa) aporta **${kcal} kcal**, ${grasas} g de grasa, ${netCarbs} g de carbos netos y ${proteinas} g de proteína. La grasa es mayormente monoinsaturada (ácido oleico) — beneficiosa para el corazón.`;

  const resumen = lang === 'en'
    ? `${label} (${gramos} g): ${kcal} kcal | Fat: ${grasas} g | Net carbs: ${netCarbs} g | Fiber: ${fibra} g | Protein: ${proteinas} g`
    : `${label} (${gramos} g): ${kcal} kcal | Grasa: ${grasas} g | Carbos netos: ${netCarbs} g | Fibra: ${fibra} g | Proteína: ${proteinas} g`;

  const _insight = {
    title: insightTitle,
    text:  insightText,
    tone:  kcal > 300 ? 'warning' : 'positive',
    icon:  '🥑',
  };

  return {
    calorias:     `${kcal} kcal`,
    grasas:       `${grasas} g`,
    carbos_netos: `${netCarbs} g`,
    proteinas:    `${proteinas} g`,
    fibra:        `${fibra} g`,
    resumen,
    _insight,
  };
}
