export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Bread rising time estimation using the Q10 temperature coefficient method.
 *
 * Core formula (Q10 ≈ 2 per 10 °C, established in baking science):
 *   T_rise = T_base × 2^((T_ref − T_actual) / 10) × (L_ref / L_real)
 *
 * Where:
 *   T_base   = reference rise time at T_ref with L_ref yeast dose
 *   T_ref    = 25 °C reference temperature
 *   T_actual = actual dough/ambient temperature in °C
 *   L_ref    = reference yeast dose (2% fresh, ~0.67% instant)
 *   L_real   = actual yeast dose in fresh-yeast-equivalent %
 *
 * Yeast type conversion to fresh-yeast-equivalent (Baker's yeast science):
 *   - fresh yeast:      1× (reference)
 *   - active dry yeast: 0.45× (i.e. 10g active dry ≈ 22g fresh)
 *   - instant yeast:    0.33× (i.e. 10g instant ≈ 30g fresh)
 *
 * Source: King Arthur Baking, Weekend Bakery, BeanAnimal dough calculator.
 */
export function leudadoPanLevaduraTiempoTemperatura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // --- Parse inputs ---
  const temperatura = Number(i.temperatura);   // °C actual
  const tiempo_base = Number(i.tiempo_base) || 60; // minutes at 25°C with 2% fresh
  const levadura_pct = Number(i.levadura_pct) || 2.0; // % baker's, in the selected yeast type

  // Yeast type: "fresca" | "seca_activa" | "instantanea"
  // (EN: "fresh" | "active_dry" | "instant")
  const tipo = String(i.levadura_tipo || 'fresca');

  // Convert any yeast type to fresh-yeast-equivalent %
  // 1 g instant = 3 g fresh → 1% instant = 3% fresh-equiv
  // 1 g active dry = 2.25 g fresh → 1% active dry = 2.25% fresh-equiv
  const freshEquivMultiplier: Record<string, number> = {
    fresca: 1,
    fresh: 1,
    seca_activa: 2.25,
    active_dry: 2.25,
    instantanea: 3,
    instant: 3,
  };
  const mult = freshEquivMultiplier[tipo] ?? 1;
  const levadura_fresh_equiv = levadura_pct * mult; // % in fresh-yeast terms

  // Reference dose: 2% fresh yeast equivalent at 25°C
  const T_REF_TEMP = 25;    // °C
  const L_REF = 2.0;        // % fresh-yeast-equiv (standard panadería)
  const Q10 = 10;           // °C per activity-doubling interval

  // Guard against extreme or invalid temperatures
  const temp = Math.max(-5, Math.min(55, isNaN(temperatura) ? 25 : temperatura));
  const yeastDose = Math.max(0.1, Math.min(20, levadura_fresh_equiv));
  const baseTime = Math.max(10, Math.min(600, tiempo_base));

  // Step 1 — Temperature adjustment (Q10 exponential)
  const tempFactor = Math.pow(2, (T_REF_TEMP - temp) / Q10);

  // Step 2 — Yeast quantity adjustment (inverse proportion)
  const yeastFactor = L_REF / yeastDose;

  // Step 3 — Final estimated time
  const tiempoEstimado = baseTime * tempFactor * yeastFactor;

  // Format output
  const horas = Math.floor(tiempoEstimado / 60);
  const minutos = Math.round(tiempoEstimado % 60);

  let tiempoTextoEs: string;
  let tiempoTextoEn: string;

  if (horas === 0) {
    tiempoTextoEs = `${minutos} min`;
    tiempoTextoEn = `${minutos} min`;
  } else if (minutos === 0) {
    tiempoTextoEs = `${horas} h`;
    tiempoTextoEn = `${horas} h`;
  } else {
    tiempoTextoEs = `${horas} h ${minutos} min`;
    tiempoTextoEn = `${horas} h ${minutos} min`;
  }

  // Contextual interpretation
  let interpretacionEs: string;
  let interpretacionEn: string;

  if (temp >= 50) {
    interpretacionEs = `⚠️ A ${temp} °C la levadura muere. La masa no leudrá.`;
    interpretacionEn = `⚠️ At ${temp} °C yeast dies — dough will not rise.`;
  } else if (temp >= 40) {
    interpretacionEs = `⚠️ A ${temp} °C la levadura está bajo estrés (rango límite). Tiempo estimado: ${tiempoTextoEs}, pero controlá cada 10 min.`;
    interpretacionEn = `⚠️ At ${temp} °C yeast is under heat stress. Estimated time: ${tiempoTextoEn} — check every 10 min.`;
  } else if (temp >= 30) {
    interpretacionEs = `Temperatura cálida (${temp} °C): el leudado es rápido. Tiempo estimado: ${tiempoTextoEs}. Vigilá para no pasarte.`;
    interpretacionEn = `Warm dough (${temp} °C): fast fermentation. Estimated: ${tiempoTextoEn}. Watch closely to avoid over-proofing.`;
  } else if (temp >= 22) {
    interpretacionEs = `Temperatura ideal (${temp} °C): condiciones óptimas para leudado activo. Tiempo estimado: ${tiempoTextoEs}.`;
    interpretacionEn = `Ideal temperature (${temp} °C): optimal yeast activity. Estimated rise time: ${tiempoTextoEn}.`;
  } else if (temp >= 10) {
    interpretacionEs = `Temperatura fría (${temp} °C): leudado lento con más sabor. Tiempo estimado: ${tiempoTextoEs}.`;
    interpretacionEn = `Cool dough (${temp} °C): slow fermentation with more flavor. Estimated: ${tiempoTextoEn}.`;
  } else if (temp >= 1) {
    interpretacionEs = `Fermentación en frío (${temp} °C): levadura casi inactiva. Tiempo estimado: ${tiempoTextoEs}. Ideal para leudado nocturno en heladera.`;
    interpretacionEn = `Cold fermentation (${temp} °C): yeast nearly dormant. Estimated: ${tiempoTextoEn}. Great for overnight fridge proof.`;
  } else {
    interpretacionEs = `A ${temp} °C la levadura está en latencia casi total. Resultado teórico: ${tiempoTextoEs} (no recomendado).`;
    interpretacionEn = `At ${temp} °C yeast is nearly dormant. Theoretical result: ${tiempoTextoEn} (not recommended).`;
  }

  // Yeast type name for output text
  const nombreTipoEs: Record<string, string> = {
    fresca: 'levadura fresca',
    fresh: 'levadura fresca',
    seca_activa: 'levadura seca activa',
    active_dry: 'levadura seca activa',
    instantanea: 'levadura instantánea',
    instant: 'levadura instantánea',
  };
  const nombreTipoEn: Record<string, string> = {
    fresca: 'fresh yeast',
    fresh: 'fresh yeast',
    seca_activa: 'active dry yeast',
    active_dry: 'active dry yeast',
    instantanea: 'instant yeast',
    instant: 'instant yeast',
  };

  const tipoNombreEs = nombreTipoEs[tipo] ?? 'levadura fresca';
  const tipoNombreEn = nombreTipoEn[tipo] ?? 'fresh yeast';

  // _insight object
  const insTextEs = `Con **${levadura_pct}% de ${tipoNombreEs}** a **${temp} °C**, tu masa necesita aproximadamente **${tiempoTextoEs}** para el primer leudado (×${tempFactor.toFixed(2)} por temperatura, ×${yeastFactor.toFixed(2)} por dosis). ${tiempoEstimado > 300 ? 'Un leudado largo. Considerá la heladera para mayor comodidad.' : ''}`;
  const insTextEn = `With **${levadura_pct}% ${tipoNombreEn}** at **${temp} °C**, your dough needs approximately **${tiempoTextoEn}** for first rise (×${tempFactor.toFixed(2)} temp factor, ×${yeastFactor.toFixed(2)} yeast factor). ${tiempoEstimado > 300 ? 'Long rise — consider the fridge for convenience.' : ''}`;

  const T = ({
    es: {
      resultado: tiempoTextoEs,
      resumen: interpretacionEs,
      insTitle: 'Tiempo estimado de leudado',
      insText: insTextEs,
    },
    en: {
      resultado: tiempoTextoEn,
      resumen: interpretacionEn,
      insTitle: 'Estimated Rise Time',
      insText: insTextEn,
    },
  } as const)[__lang];

  const _insight = {
    title: T.insTitle,
    text: T.insText,
    tone: temp >= 40 ? 'warning' : temp >= 22 ? 'positive' : 'neutral',
    icon: '🍞',
  };

  return {
    resultado: T.resultado,
    resumen: T.resumen,
    _insight,
  };
}
