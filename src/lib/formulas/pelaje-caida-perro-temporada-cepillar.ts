export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calcula la frecuencia de cepillado recomendada para un perro según:
 *   v1 = tipo de pelaje (1=corto-liso, 2=medio, 3=largo, 4=doble-manto, 5=rizado-ondulado, 6=alambre)
 *   v2 = temporada (1=normal, 2=muda-primavera-otoño)
 *
 * Fuente: AKC Grooming Guides, Texas A&M VMBS Pet Talk, lacasadeturron.es
 */
export function pelajeCaidaPerroTemporadaCepillar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const v1 = Number(i.v1) || 1; // tipo pelaje (1-6)
  const v2 = Number(i.v2) || 1; // temporada (1=normal, 2=muda)

  // Frecuencias base por tipo de pelaje (veces/semana) — temporada normal
  // Rangos validados por AKC y fuentes veterinarias
  const baseFreq: Record<number, { min: number; max: number; name_es: string; name_en: string; herramienta_es: string; herramienta_en: string }> = {
    1: { min: 1, max: 2, name_es: 'pelo corto y liso', name_en: 'short smooth coat', herramienta_es: 'manopla de goma o cepillo de cerdas', herramienta_en: 'rubber grooming glove or bristle brush' },
    2: { min: 2, max: 3, name_es: 'pelo medio', name_en: 'medium coat', herramienta_es: 'cepillo slicker y peine de púas', herramienta_en: 'slicker brush and pin comb' },
    3: { min: 4, max: 7, name_es: 'pelo largo', name_en: 'long coat', herramienta_es: 'cepillo slicker, peine y desenredador', herramienta_en: 'slicker brush, wide comb and detangler' },
    4: { min: 3, max: 4, name_es: 'doble manto (undercoat)', name_en: 'double coat (undercoat)', herramienta_es: 'rastrillo subpelo (undercoat rake) + slicker', herramienta_en: 'undercoat rake + slicker brush' },
    5: { min: 3, max: 5, name_es: 'rizado u ondulado', name_en: 'curly or wavy coat', herramienta_es: 'cepillo slicker de pines metálicos', herramienta_en: 'metal pin slicker brush' },
    6: { min: 1, max: 1, name_es: 'alambre / wire (schnauzer, terrier)', name_en: 'wire coat (schnauzer, terrier)', herramienta_es: 'cepillo slicker o stripping comb', herramienta_en: 'slicker brush or stripping comb' },
  };

  const coatKey = Math.min(6, Math.max(1, Math.round(v1)));
  const seasonKey = Math.min(2, Math.max(1, Math.round(v2)));

  const coat = baseFreq[coatKey];

  // Durante temporada de muda: +50-100% frecuencia, con techo de 7 veces/semana
  // Tipos 6 (wire coat) casi no mudan — se mantienen igual
  let minFreq = coat.min;
  let maxFreq = coat.max;

  if (seasonKey === 2 && coatKey !== 6) {
    minFreq = Math.min(7, Math.round(coat.min * 1.5));
    maxFreq = Math.min(7, coat.max === 7 ? 7 : Math.round(coat.max * 1.5));
  }

  const freqLabel = minFreq === maxFreq
    ? `${minFreq} vez${minFreq === 1 ? '' : 'es'}/semana`
    : `${minFreq}–${maxFreq} veces/semana`;

  const freqLabelEn = minFreq === maxFreq
    ? `${minFreq} time${minFreq === 1 ? '' : 's'}/week`
    : `${minFreq}–${maxFreq} times/week`;

  const seasonEs = seasonKey === 2 ? 'temporada de muda (primavera/otoño)' : 'temporada normal (sin muda intensa)';
  const seasonEn = seasonKey === 2 ? 'shedding season (spring/fall)' : 'normal season (no heavy shedding)';

  // Advertencia especial para doble manto en muda
  let extraEs = '';
  let extraEn = '';
  if (coatKey === 4 && seasonKey === 2) {
    extraEs = ' En la punta de la muda podés cepillar a diario o día por medio. Nunca rasurés el subpelo: es la capa termorreguladora (AKC).';
    extraEn = ' At peak shedding you can brush daily or every other day. Never shave the undercoat — it is the thermoregulating layer (AKC).';
  }
  if (coatKey === 6 && seasonKey === 2) {
    extraEs = ' Los wire coats no mudan de forma estacional intensa; el mantenimiento del coat duro requiere stripping manual, no rasurado.';
    extraEn = ' Wire coats do not shed heavily in season; maintaining the hard coat requires hand stripping, not shaving.';
  }

  const resultado = freqLabel;
  const resultado_en = freqLabelEn;

  const resumen = __lang === 'en'
    ? `${coat.name_en} · ${seasonEn}: brush **${resultado_en}**. Recommended tool: ${coat.herramienta_en}.${extraEn}`
    : `${coat.name_es} · ${seasonEs}: cepillá **${resultado}**. Herramienta recomendada: ${coat.herramienta_es}.${extraEs}`;

  const _insight = {
    title: __lang === 'en' ? 'Brushing frequency' : 'Frecuencia de cepillado',
    text: __lang === 'en'
      ? `For a dog with **${coat.name_en}** in **${seasonEn}**, the recommended brushing frequency is **${resultado_en}**. Use a ${coat.herramienta_en}. Regular brushing removes dead hair before it spreads around the house and helps detect skin problems early.${extraEn}`
      : `Para un perro con **${coat.name_es}** en **${seasonEs}**, la frecuencia de cepillado recomendada es **${resultado}**. Usá ${coat.herramienta_es}. El cepillado regular saca el pelo muerto antes de que se esparza por la casa y ayuda a detectar problemas de piel temprano.${extraEs}`,
    tone: 'info',
    icon: '🐕',
  };

  return { resultado, resumen, _insight };
}
