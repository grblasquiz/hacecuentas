export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function omega3DosisDiariaDhaEpa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const oilPerCapsule = Number(i.aceite_mg) || 0;      // mg total fish oil per capsule
  const concentration = Number(i.concentracion_pct) || 0; // % of EPA+DHA in the oil
  const capsulesPerDay = Number(i.capsulas_dia) || 1;  // capsules taken per day

  // Core formula: DHA+EPA per capsule = oil × concentration% / 100
  const dhaEpaPerCapsule = oilPerCapsule * concentration / 100;

  // Total daily DHA+EPA
  const totalDailyMg = dhaEpaPerCapsule * capsulesPerDay;

  // Capsules needed to reach the AHA minimum (250 mg/day) and recommended (500 mg/day)
  const capsulasParaMinimo = dhaEpaPerCapsule > 0
    ? Math.ceil(250 / dhaEpaPerCapsule)
    : 0;
  const capsulasParaOptimo = dhaEpaPerCapsule > 0
    ? Math.ceil(500 / dhaEpaPerCapsule)
    : 0;

  // Interpretation band
  let interpretacion: string;
  let interpretacionEn: string;

  if (totalDailyMg <= 0) {
    interpretacion = 'Ingresá los datos de tu suplemento para ver el resultado.';
    interpretacionEn = 'Enter your supplement data to see the result.';
  } else if (totalDailyMg < 250) {
    interpretacion = `${totalDailyMg.toFixed(0)} mg/día → por debajo del mínimo de 250 mg/día (AHA). Necesitás ${capsulasParaMinimo} cápsula${capsulasParaMinimo !== 1 ? 's' : ''} de esta marca para alcanzar el mínimo.`;
    interpretacionEn = `${totalDailyMg.toFixed(0)} mg/day → below the 250 mg/day AHA minimum. You need ${capsulasParaMinimo} capsule${capsulasParaMinimo !== 1 ? 's' : ''} of this brand to reach the minimum.`;
  } else if (totalDailyMg <= 500) {
    interpretacion = `${totalDailyMg.toFixed(0)} mg/día → dentro del rango recomendado por la AHA (250–500 mg/día) para adultos sanos. ✓`;
    interpretacionEn = `${totalDailyMg.toFixed(0)} mg/day → within the AHA recommended range (250–500 mg/day) for healthy adults. ✓`;
  } else if (totalDailyMg <= 1000) {
    interpretacion = `${totalDailyMg.toFixed(0)} mg/día → supera los 500 mg/día recomendados para adultos sanos. Las dosis hasta 1 g/día son comunes en cardiopatía bajo indicación médica.`;
    interpretacionEn = `${totalDailyMg.toFixed(0)} mg/day → above the 500 mg/day general recommendation. Up to 1 g/day is common for heart disease patients under medical supervision.`;
  } else if (totalDailyMg <= 3000) {
    interpretacion = `${totalDailyMg.toFixed(0)} mg/día → dosis alta. Por encima de 1 g/día se recomienda supervisión médica. Solo indicado en condiciones específicas como hipertrigliceridemia.`;
    interpretacionEn = `${totalDailyMg.toFixed(0)} mg/day → high dose. Above 1 g/day, medical supervision is recommended. Typically indicated for conditions like hypertriglyceridemia.`;
  } else {
    interpretacion = `${totalDailyMg.toFixed(0)} mg/día → dosis muy elevada (>${totalDailyMg.toFixed(0)} mg). Consultá a tu médico. La FDA establece que >3 g/día solo deben usarse bajo supervisión.`;
    interpretacionEn = `${totalDailyMg.toFixed(0)} mg/day → very high dose. Consult your doctor. The FDA recommends medical supervision for intakes above 3 g/day.`;
  }

  // Concentration quality label
  let calidadConcentracion: string;
  let calidadConcentracionEn: string;
  if (concentration < 18) {
    calidadConcentracion = `Concentración baja (${concentration}%) — muy por debajo del estándar de aceite de pescado (18–30%).`;
    calidadConcentracionEn = `Low concentration (${concentration}%) — well below standard fish oil (18–30%).`;
  } else if (concentration <= 30) {
    calidadConcentracion = `Aceite de pescado estándar (${concentration}%) — calidad habitual del mercado.`;
    calidadConcentracionEn = `Standard fish oil (${concentration}%) — typical market quality.`;
  } else if (concentration <= 60) {
    calidadConcentracion = `Concentrado intermedio (${concentration}%) — mayor rendimiento por cápsula.`;
    calidadConcentracionEn = `Intermediate concentrate (${concentration}%) — more yield per capsule.`;
  } else {
    calidadConcentracion = `Alta potencia / concentrado (${concentration}%) — aceite rTG o de alta pureza.`;
    calidadConcentracionEn = `High potency / concentrate (${concentration}%) — rTG or ultra-pure oil.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Your daily DHA+EPA dose' : 'Tu dosis diaria de DHA+EPA',
    text: __lang === 'en'
      ? `Taking **${capsulesPerDay} capsule${capsulesPerDay !== 1 ? 's' : ''}** of **${oilPerCapsule} mg** fish oil at **${concentration}% EPA+DHA concentration** gives you **${totalDailyMg.toFixed(0)} mg DHA+EPA per day**. ${interpretacionEn} — ${calidadConcentracionEn}`
      : `Tomando **${capsulesPerDay} cápsula${capsulesPerDay !== 1 ? 's' : ''}** de **${oilPerCapsule} mg** de aceite de pescado con **${concentration}% de concentración EPA+DHA** obtenés **${totalDailyMg.toFixed(0)} mg de DHA+EPA/día**. ${interpretacion} — ${calidadConcentracion}`,
    tone: totalDailyMg >= 250 && totalDailyMg <= 500 ? 'positive' : 'neutral',
    icon: '🐟',
  };

  const resultado = totalDailyMg.toFixed(0);
  const resumen = __lang === 'en' ? interpretacionEn : interpretacion;
  const por_capsula = dhaEpaPerCapsule.toFixed(0);
  const calidad = __lang === 'en' ? calidadConcentracionEn : calidadConcentracion;

  return { resultado, resumen, por_capsula, calidad, _insight };
}
