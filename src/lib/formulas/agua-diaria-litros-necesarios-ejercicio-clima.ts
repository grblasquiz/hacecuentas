export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Daily water intake calculator.
 *
 * METHODOLOGY:
 *   Base:      35 ml × kg body weight  (IOM/EFSA Adequate Intake for sedentary adults)
 *   Exercise:  500–750 ml per 30 min moderate; 750–1000 ml per 30 min intense (ACSM 2007)
 *   Climate:   coefficient 1.0–1.35 depending on ambient heat / humidity
 *
 * Sources:
 *  - IOM (NAM) Dietary Reference Intakes for Water ... (2004) — 35 ml/kg baseline
 *  - EFSA Scientific Opinion on DRVs for Water (2010) — 2.0/2.5 L/day AI
 *  - Sawka et al., ACSM Position Stand: Exercise and Fluid Replacement (2007)
 *  - OMS / PAHO hydration guidelines
 */
export function aguaDiariaLitrosNecesariosEjercicioClima(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const peso_kg = Math.max(0, Number(i.peso_kg) || 0);
  const sexo = String(i.sexo || 'male');                 // 'male' | 'female'
  const ejercicio_min = Math.max(0, Number(i.ejercicio_min) || 0);
  const intensidad = String(i.intensidad || 'moderate');  // 'light' | 'moderate' | 'intense'
  const clima = String(i.clima || 'temperate');           // 'cold' | 'temperate' | 'warm' | 'hot' | 'very_hot'

  if (peso_kg === 0) {
    const msg = __lang === 'en'
      ? 'Enter your body weight to calculate your hydration target.'
      : 'Ingresá tu peso corporal para calcular tu objetivo de hidratación.';
    return { resultado: '0.0', resumen: msg, _insight: { title: __lang === 'en' ? 'No data' : 'Sin datos', text: msg, tone: 'neutral', icon: '💧' } };
  }

  // ── 1. BASE  (IOM/EFSA: 35 ml/kg)
  // EFSA AI: women 2.0 L/day, men 2.5 L/day sedentary → roughly women 32 ml/kg, men 36 ml/kg
  const baseRate = sexo === 'female' ? 32 : 36; // ml per kg
  const baseLitros = (peso_kg * baseRate) / 1000;

  // ── 2. EXERCISE ADDITION  (ACSM 2007)
  //   light (walking, yoga, stretching)    ≈ 300 ml / 30 min
  //   moderate (jogging, cycling, swimming) ≈ 500 ml / 30 min
  //   intense (HIIT, marathon pace, weights) ≈ 750 ml / 30 min
  const mlPer30Min: Record<string, number> = { light: 300, moderate: 500, intense: 750 };
  const rate = mlPer30Min[intensidad] ?? 500;
  const exerciseLitros = (ejercicio_min / 30) * rate / 1000;

  // ── 3. CLIMATE MULTIPLIER
  //   cold (<10°C / <50°F):       0.90 (reduced sweat, still need baseline)
  //   temperate (10–25°C):        1.00
  //   warm (25–32°C):             1.15
  //   hot (32–38°C / >90°F):      1.25
  //   very hot/humid (>38°C):     1.35
  const climateMultiplier: Record<string, number> = {
    cold: 0.90,
    temperate: 1.00,
    warm: 1.15,
    hot: 1.25,
    very_hot: 1.35,
  };
  const mult = climateMultiplier[clima] ?? 1.00;

  // ── 4. TOTAL
  const totalLitros = (baseLitros + exerciseLitros) * mult;
  const totalOz = totalLitros * 33.814; // fl oz

  // ── 5. INSIGHT / INTERPRETATION
  let tone: string;
  let contextMsg: string;

  if (totalLitros < 1.5) {
    tone = 'warning';
    contextMsg = __lang === 'en'
      ? 'Your result seems low. Double-check your weight and activity entries.'
      : 'El resultado parece bajo. Verificá el peso y la actividad ingresados.';
  } else if (totalLitros < 2.0) {
    tone = 'info';
    contextMsg = __lang === 'en'
      ? 'This is the sedentary minimum. If you feel thirsty, drink more.'
      : 'Esto es el mínimo sedentario. Si sentís sed, tomá más.';
  } else if (totalLitros <= 4.0) {
    tone = 'success';
    contextMsg = __lang === 'en'
      ? 'This range is typical for an active adult. Spread intake across the day.'
      : 'Este rango es típico para un adulto activo. Distribuí la ingesta a lo largo del día.';
  } else {
    tone = 'info';
    contextMsg = __lang === 'en'
      ? 'High demand (intense training and/or heat). Prioritize electrolytes with plain water.'
      : 'Demanda alta (entrenamiento intenso y/o calor). Priorizá electrolitos junto al agua.';
  }

  const baseLabel = __lang === 'en' ? 'base' : 'base';
  const exerciseLabel = __lang === 'en' ? 'exercise' : 'ejercicio';
  const climateLabel = __lang === 'en' ? 'climate factor' : 'factor clima';

  const resumen = __lang === 'en'
    ? `Base (${baseLabel}): ${baseLitros.toFixed(2)} L | Exercise (${ejercicio_min} min ${intensidad}): +${exerciseLitros.toFixed(2)} L | Climate (${clima}): ×${mult} → ${totalLitros.toFixed(2)} L/day (≈ ${Math.round(totalOz)} fl oz). ${contextMsg}`
    : `Base (${baseLabel}): ${baseLitros.toFixed(2)} L | Ejercicio (${ejercicio_min} min ${intensidad === 'light' ? 'suave' : intensidad === 'moderate' ? 'moderado' : 'intenso'}): +${exerciseLitros.toFixed(2)} L | Factor clima (${clima === 'cold' ? 'frío' : clima === 'temperate' ? 'templado' : clima === 'warm' ? 'cálido' : clima === 'hot' ? 'caluroso' : 'muy caluroso/húmedo'}): ×${mult} → ${totalLitros.toFixed(2)} L/día. ${contextMsg}`;

  const insightTitle = __lang === 'en' ? 'Your daily hydration target' : 'Tu objetivo de hidratación diaria';
  const insightText = __lang === 'en'
    ? `You need approximately **${totalLitros.toFixed(1)} L** (${Math.round(totalOz)} fl oz) of fluids per day. Base ${baseRate} ml/kg × ${peso_kg} kg = ${baseLitros.toFixed(2)} L; exercise +${exerciseLitros.toFixed(2)} L; climate ×${mult}.`
    : `Necesitás aproximadamente **${totalLitros.toFixed(1)} L** de líquidos por día. Base ${baseRate} ml/kg × ${peso_kg} kg = ${baseLitros.toFixed(2)} L; ejercicio +${exerciseLitros.toFixed(2)} L; clima ×${mult}.`;

  const resultado = totalLitros.toFixed(2);

  return {
    resultado,
    resumen,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone,
      icon: '💧',
    },
  };
}
