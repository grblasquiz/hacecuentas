export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Ración diaria de comida para gatos (en gramos)
 *
 * Método: RER/MER según WSAVA / AAHA Nutritional Guidelines
 *   RER (kcal/día) = 70 × (peso_kg)^0.75
 *   MER (kcal/día) = RER × factor_actividad
 *   Gramos_pienso_seco  = MER / (3.5 kcal/g) — promedio kibble doméstico
 *   Gramos_húmedo       = MER / (0.9 kcal/g) — promedio lata/sobre húmedo
 *
 * Factores MER por etapa/actividad (AAHA Nutritional Assessment Guidelines):
 *   1 = Gato adulto esterilizado, sedentario      → 1.2
 *   2 = Gato adulto entero o activo / exterior     → 1.4
 *   3 = Gatito en crecimiento (< 1 año)            → 2.5
 *   4 = Gato senior / menos activo (≥ 10 años)    → 1.1
 *   5 = Gata en lactancia / preñez                 → 3.0
 */
export function comidaGatoGramosPesoIdealRacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const pesoKg = Number(i.v1) || 0;
  const tipoRaw = String(i.v2 || '1').trim();

  // Factor MER según tipo
  const factorMap: Record<string, number> = {
    '1': 1.2,  // adulto esterilizado sedentario
    '2': 1.4,  // adulto entero / activo / exterior
    '3': 2.5,  // gatito < 1 año
    '4': 1.1,  // senior ≥ 10 años
    '5': 3.0,  // lactancia / preñez
  };
  const factor = factorMap[tipoRaw] ?? 1.2;

  // Validación
  if (pesoKg <= 0) {
    const msg = __lang === 'en'
      ? 'Enter a valid weight in kilograms to get a result.'
      : 'Ingresá un peso válido en kilogramos para obtener el resultado.';
    return { resultado: '', resumen: msg };
  }

  // RER = 70 × kg^0.75
  const rer = 70 * Math.pow(pesoKg, 0.75);
  // MER
  const mer = rer * factor;

  // Conversión a gramos
  // Pienso seco promedio: ~3.5 kcal/g (350 kcal/100g)
  const KCAL_G_SECO = 3.5;
  // Alimento húmedo promedio: ~0.9 kcal/g (90 kcal/100g)
  const KCAL_G_HUMEDO = 0.9;

  const gramosSeco  = Math.round(mer / KCAL_G_SECO);
  const gramosHumedo = Math.round(mer / KCAL_G_HUMEDO);

  const merRound = Math.round(mer);
  const rerRound = Math.round(rer);

  // Etiquetas por tipo
  const labelMap: Record<string, { es: string; en: string }> = {
    '1': { es: 'adulto esterilizado/sedentario', en: 'neutered/sedentary adult' },
    '2': { es: 'adulto activo/exterior',         en: 'active/outdoor adult' },
    '3': { es: 'gatito en crecimiento',           en: 'growing kitten' },
    '4': { es: 'senior (≥10 años)',               en: 'senior (≥10 years)' },
    '5': { es: 'en lactancia/preñez',             en: 'pregnant/lactating' },
  };
  const tipoLabel = (labelMap[tipoRaw] ?? labelMap['1'])[__lang];

  const resultado = `${gramosSeco} g pienso seco / ${gramosHumedo} g húmedo`;

  const resumen = __lang === 'en'
    ? `For a ${pesoKg} kg ${tipoLabel} cat: RER = ${rerRound} kcal/day, MER = ${merRound} kcal/day (factor ×${factor}). That equals ~${gramosSeco} g/day of dry kibble or ~${gramosHumedo} g/day of wet food.`
    : `Para un gato de ${pesoKg} kg, ${tipoLabel}: RER = ${rerRound} kcal/día, MER = ${merRound} kcal/día (factor ×${factor}). Equivale a ~${gramosSeco} g/día de pienso seco o ~${gramosHumedo} g/día de alimento húmedo.`;

  const insightText = __lang === 'en'
    ? `Your cat needs about **${merRound} kcal/day** (MER). Split into **${gramosSeco} g of dry food** or **${gramosHumedo} g of wet food** daily. These are averages based on typical food energy density (350 kcal/100g dry, 90 kcal/100g wet). Always check the specific kcal value on your food bag and adjust proportionally. Weigh portions with a kitchen scale for accuracy.`
    : `Tu gato necesita aproximadamente **${merRound} kcal/día** (requerimiento energético de mantenimiento). Eso se traduce en **${gramosSeco} g de pienso seco** o **${gramosHumedo} g de alimento húmedo** por día. Valores basados en densidades calóricas promedio (350 kcal/100g pienso seco, 90 kcal/100g húmedo). Verificá siempre las kcal reales del alimento en el envase y ajustá en proporción. Pesá las porciones con balanza de cocina para mayor precisión.`;

  return {
    resultado,
    resumen,
    _insight: {
      title: __lang === 'en' ? 'Daily ration breakdown' : 'Desglose de la ración diaria',
      text: insightText,
      tone: 'neutral',
      icon: '🐱',
      chart: {
        type: 'donut',
        labels: __lang === 'en'
          ? ['Dry food (g)', 'Wet food (g)']
          : ['Pienso seco (g)', 'Alimento húmedo (g)'],
        values: [gramosSeco, gramosHumedo],
        unit: 'g/día',
      },
    },
  };
}
