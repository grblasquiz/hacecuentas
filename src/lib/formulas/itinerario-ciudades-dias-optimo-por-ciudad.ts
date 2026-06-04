export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Optimal days per city in a multi-city itinerary
 *
 * Formula: days_city = (attractions_city / total_attractions) × total_days
 * Then apply transfer time correction:
 *   < 2 h  → +0 days
 *   2–4 h  → +0.5 days (half-day lost to transit)
 *   > 4 h  → +1 full day
 * Floor: minimum 1 night.
 *
 * Source: Rick Steves Itinerary Tips (ricksteves.com/travel-tips/trip-planning/itinerary-tips)
 *         Lonely Planet Trip Builder (lonelyplanet.com/articles/how-to-plan-a-trip)
 */
export function itinerarioCiudadesDiasOptimoPorCiudad(i: Inputs, __lang = 'es'): Outputs {
  const cityAttractions = Number(i.city_attractions) || 0;
  const totalAttractions = Number(i.total_attractions) || 1;
  const totalDays = Number(i.total_days) || 0;
  const transferHours = Number(i.transfer_hours) || 0;

  // Guard: avoid division by zero or nonsensical inputs
  const safeTotal = totalAttractions > 0 ? totalAttractions : 1;
  const safeCityAttr = Math.max(0, cityAttractions);
  const safeDays = Math.max(0, totalDays);

  // Weight of this city in the overall itinerary
  const weight = safeCityAttr / safeTotal;

  // Base days proportional to attractions weight
  const baseDays = weight * safeDays;

  // Transfer time correction
  let transferCorrection = 0;
  if (transferHours >= 4) {
    transferCorrection = 1;
  } else if (transferHours >= 2) {
    transferCorrection = 0.5;
  }

  // Adjusted days (minimum 1 if city has any attractions)
  const rawDays = baseDays + transferCorrection;
  const adjustedDays = safeCityAttr > 0 ? Math.max(1, rawDays) : 0;
  const roundedDays = Math.round(adjustedDays * 2) / 2; // round to nearest 0.5

  const weightPct = (weight * 100).toFixed(1);

  const isEs = __lang !== 'en' && __lang !== 'pt';
  const isEn = __lang === 'en';
  // pt falls through to Spanish-ish labels

  let correctionLabel = '';
  if (isEn) {
    correctionLabel =
      transferHours >= 4
        ? '+1 full day (transfer > 4 h)'
        : transferHours >= 2
        ? '+0.5 day (transfer 2–4 h)'
        : 'No transfer correction (< 2 h)';
  } else {
    correctionLabel =
      transferHours >= 4
        ? '+1 día completo (traslado > 4 h)'
        : transferHours >= 2
        ? '+0.5 día (traslado 2–4 h)'
        : 'Sin corrección de traslado (< 2 h)';
  }

  // Contextual tip for nights vs days
  const nights = roundedDays > 0 ? Math.max(1, Math.round(roundedDays)) : 0;
  const fullDays = nights > 0 ? nights - 1 : 0;

  let insightTitle: string;
  let insightText: string;
  let resumen: string;
  let resultado: string;

  if (isEn) {
    resultado = `${roundedDays} days (≈ ${nights} nights)`;
    resumen =
      `Weight: ${weightPct}% of itinerary (${safeCityAttr} of ${safeTotal} attractions). ` +
      `Base: ${baseDays.toFixed(2)} d + transfer: ${correctionLabel} = ${roundedDays} d. ` +
      `With ${nights} nights you get approx. ${fullDays} full sightseeing days.`;
    insightTitle = 'Recommended days';
    insightText =
      `This city represents **${weightPct}%** of your itinerary's attractions. ` +
      `With **${safeDays} total trip days**, the formula assigns **${baseDays.toFixed(1)} base days**, ` +
      (transferCorrection > 0
        ? `plus **${transferCorrection} day** for the long transfer, totalling `
        : 'totalling ') +
      `**${roundedDays} days (${nights} nights)**. ` +
      `Remember: ${nights} nights = ${fullDays} full tourist days + arrival/departure half-days.`;
  } else {
    resultado = `${roundedDays} días (≈ ${nights} noches)`;
    resumen =
      `Peso: ${weightPct}% del itinerario (${safeCityAttr} de ${safeTotal} atractivos). ` +
      `Base: ${baseDays.toFixed(2)} d + traslado: ${correctionLabel} = ${roundedDays} d. ` +
      `Con ${nights} noches tenés aprox. ${fullDays} días turísticos completos.`;
    insightTitle = 'Días recomendados';
    insightText =
      `Esta ciudad representa el **${weightPct}%** de los atractivos de tu itinerario. ` +
      `Con **${safeDays} días totales de viaje**, la fórmula asigna **${baseDays.toFixed(1)} días base**, ` +
      (transferCorrection > 0
        ? `más **${transferCorrection} día** por el traslado largo, dando `
        : 'resultando en ') +
      `**${roundedDays} días (${nights} noches)**. ` +
      `Recordá: ${nights} noches = ${fullDays} días turísticos plenos + media jornada de llegada/salida.`;
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: 'info',
    icon: '🗺️',
  };

  return { resultado, resumen, _insight };
}
