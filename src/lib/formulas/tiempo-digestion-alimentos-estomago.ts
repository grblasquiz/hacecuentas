export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Gastric emptying time calculator
 *
 * Formula: T (min) = baseTime100g × portion_g / 100
 *
 * baseTime100g: reference gastric emptying time (minutes) for 100 g of the
 * selected food type, derived from clinical gastric emptying scintigraphy
 * literature (NIH/NCBI StatPearls, Healthline/Gastroenterology reviews).
 *
 * Linear proportional scaling is an accepted approximation for meal sizes
 * within normal ranges (50–500 g). It does NOT account for mixed-meal
 * interaction effects or individual variability.
 */
export function tiempoDigestionAlimentosEstomago(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // valor1: base digestion time for 100g of selected food type (minutes, from select)
  // valor2: portion size in grams
  const baseTime100g = Number(i.valor1) || 0;
  const portionG     = Number(i.valor2) || 0;

  if (baseTime100g <= 0 || portionG <= 0) {
    const err = __lang === 'en'
      ? 'Please enter a valid food type and portion size.'
      : 'Seleccioná el tipo de alimento e ingresá una porción válida.';
    return { resultado: '0', resumen: err };
  }

  // Core formula: proportional scaling from 100 g reference
  const totalMinutes = (baseTime100g * portionG) / 100;
  const hours        = Math.floor(totalMinutes / 60);
  const mins         = Math.round(totalMinutes % 60);

  // Human-readable time string
  let timeStr: string;
  if (__lang === 'en') {
    if (hours === 0)        timeStr = `${mins} min`;
    else if (mins === 0)    timeStr = `${hours} h`;
    else                    timeStr = `${hours} h ${mins} min`;
  } else {
    if (hours === 0)        timeStr = `${mins} min`;
    else if (mins === 0)    timeStr = `${hours} h`;
    else                    timeStr = `${hours} h ${mins} min`;
  }

  // Categorised feedback
  let tone: string;
  let feedbackText: string;
  if (__lang === 'en') {
    if (totalMinutes <= 30) {
      tone = 'positive';
      feedbackText = `This food empties your stomach in about **${timeStr}**. Liquids and soft fruits leave very quickly — fine to consume right before light activity.`;
    } else if (totalMinutes <= 90) {
      tone = 'positive';
      feedbackText = `Your portion will leave the stomach in roughly **${timeStr}**. A moderate wait before intense exercise is still advisable.`;
    } else if (totalMinutes <= 180) {
      tone = 'neutral';
      feedbackText = `Expect around **${timeStr}** of gastric processing. Plan meals at least 2–3 h before intense physical activity.`;
    } else if (totalMinutes <= 270) {
      tone = 'neutral';
      feedbackText = `This portion takes about **${timeStr}** to clear the stomach — typical for protein-rich or mixed meals. Allow 3–4 h before vigorous exercise.`;
    } else {
      tone = 'warning';
      feedbackText = `High-fat or large portions can take **${timeStr}** in the stomach. Eating this close to sleep or exercise may cause discomfort.`;
    }

    const resumen = `Estimated gastric emptying time: ${timeStr} (${Math.round(totalMinutes)} min). Based on proportional scaling of a ${portionG} g portion from a ${baseTime100g}-min/100 g reference value.`;
    const _insight = {
      title: 'Gastric Emptying Estimate',
      text: feedbackText,
      tone,
      icon: '⏱️'
    };
    return { resultado: Math.round(totalMinutes).toString(), resumen, _insight };

  } else {
    if (totalMinutes <= 30) {
      tone = 'positive';
      feedbackText = `Este alimento abandona el estómago en aproximadamente **${timeStr}**. Líquidos y frutas blandas salen muy rápido — es seguro consumirlos justo antes de actividad liviana.`;
    } else if (totalMinutes <= 90) {
      tone = 'positive';
      feedbackText = `Tu porción saldrá del estómago en unos **${timeStr}**. Aun así, esperá antes de hacer ejercicio intenso.`;
    } else if (totalMinutes <= 180) {
      tone = 'neutral';
      feedbackText = `El proceso gástrico tomará alrededor de **${timeStr}**. Planificá las comidas al menos 2–3 h antes de actividad intensa.`;
    } else if (totalMinutes <= 270) {
      tone = 'neutral';
      feedbackText = `Esta porción tarda cerca de **${timeStr}** en vaciarse del estómago — típico de comidas ricas en proteínas o mixtas. Dejá 3–4 h antes de ejercicio vigoroso.`;
    } else {
      tone = 'warning';
      feedbackText = `Las comidas grasas o de gran tamaño pueden tardar **${timeStr}** en el estómago. Consumirlas cerca del sueño o el ejercicio puede generar malestar.`;
    }

    const resumen = `Tiempo estimado de vaciamiento gástrico: ${timeStr} (${Math.round(totalMinutes)} min). Basado en el escalado proporcional de una porción de ${portionG} g a partir del valor de referencia de ${baseTime100g} min/100 g.`;
    const _insight = {
      title: 'Estimación de vaciamiento gástrico',
      text: feedbackText,
      tone,
      icon: '⏱️'
    };
    return { resultado: Math.round(totalMinutes).toString(), resumen, _insight };
  }
}
