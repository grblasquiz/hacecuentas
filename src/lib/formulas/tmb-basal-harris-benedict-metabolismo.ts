export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }

/**
 * Basal Metabolic Rate — Harris-Benedict revised (Roza & Shizgal, 1984)
 * Men:   BMR = 88.362 + (13.397 × kg) + (4.799 × cm) − (5.677 × age)
 * Women: BMR = 447.593 + (9.247 × kg) + (3.098 × cm) − (4.330 × age)
 * Source: Roza AM, Shizgal HM. Am J Clin Nutr 1984;40(1):168-82 (PubMed 6741850)
 */
export function tmbBasalHarrisBenedictMetabolismo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const peso   = Number(i.peso)   || 0;   // kg
  const altura = Number(i.altura) || 0;   // cm
  const edad   = Number(i.edad)   || 0;   // years
  const sexo   = String(i.sexo || '').toLowerCase(); // 'masculino'/'femenino' or 'male'/'female'

  const esMale = sexo === 'masculino' || sexo === 'male' || sexo === 'm';

  let tmb = 0;
  if (esMale) {
    tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
  } else {
    tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
  }

  // Clamp to sensible range (sanity check)
  if (peso <= 0 || altura <= 0 || edad <= 0) tmb = 0;

  const tmbRounded = Math.round(tmb);

  // Activity multipliers for TDEE reference
  const factores = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muy_intenso: 1.9,
  };

  const tdeeLabels: Record<string, Record<string, string>> = {
    es: {
      sedentario: 'Sedentario',
      leve: 'Actividad leve (1-3 días/sem)',
      moderado: 'Actividad moderada (3-5 días/sem)',
      intenso: 'Actividad intensa (6-7 días/sem)',
      muy_intenso: 'Muy intenso / trabajo físico',
    },
    en: {
      sedentario: 'Sedentary',
      leve: 'Lightly active (1-3 days/wk)',
      moderado: 'Moderately active (3-5 days/wk)',
      intenso: 'Very active (6-7 days/wk)',
      muy_intenso: 'Extra active / physical job',
    },
  };

  const lang = __lang as 'es' | 'en';
  const labels = tdeeLabels[lang];

  const tdeeRows = Object.entries(factores)
    .map(([key, factor]) => `${labels[key]}: **${Math.round(tmbRounded * factor).toLocaleString(lang === 'en' ? 'en-US' : 'es-AR')} kcal/día**`)
    .join('\n');

  // Interpret BMR range
  let rango = '';
  if (tmbRounded === 0) {
    rango = __lang === 'en' ? 'Enter valid values to see your result.' : 'Ingresá valores válidos para ver tu resultado.';
  } else if (esMale) {
    if (tmbRounded < 1400) rango = __lang === 'en' ? 'Below the typical range for men (1,600–2,000 kcal/day). Verify your data.' : 'Por debajo del rango típico para varones (1.600–2.000 kcal/día). Verificá tus datos.';
    else if (tmbRounded > 2600) rango = __lang === 'en' ? 'Above the typical range for men. Consistent with tall, heavy, or young individuals.' : 'Por encima del rango típico. Consistente con personas de gran estatura, peso elevado o jóvenes.';
    else rango = __lang === 'en' ? 'Within the typical range for men (1,600–2,000 kcal/day).' : 'Dentro del rango típico para varones (1.600–2.000 kcal/día).';
  } else {
    if (tmbRounded < 1100) rango = __lang === 'en' ? 'Below the typical range for women (1,300–1,700 kcal/day). Verify your data.' : 'Por debajo del rango típico para mujeres (1.300–1.700 kcal/día). Verificá tus datos.';
    else if (tmbRounded > 2200) rango = __lang === 'en' ? 'Above the typical range for women. Consistent with tall, heavy, or young individuals.' : 'Por encima del rango típico. Consistente con personas de gran estatura, peso elevado o jóvenes.';
    else rango = __lang === 'en' ? 'Within the typical range for women (1,300–1,700 kcal/day).' : 'Dentro del rango típico para mujeres (1.300–1.700 kcal/día).';
  }

  const sexoLabel = esMale
    ? (__lang === 'en' ? 'male' : 'varón')
    : (__lang === 'en' ? 'female' : 'mujer');

  const resumen = tmbRounded === 0
    ? (__lang === 'en' ? 'Enter all fields to compute BMR.' : 'Completá todos los campos para calcular la TMB.')
    : (__lang === 'en'
      ? `${sexoLabel.charAt(0).toUpperCase() + sexoLabel.slice(1)}, ${edad} yr, ${peso} kg, ${altura} cm → Harris-Benedict revised BMR: ${tmbRounded.toLocaleString('en-US')} kcal/day. ${rango}`
      : `${sexoLabel.charAt(0).toUpperCase() + sexoLabel.slice(1)}, ${edad} años, ${peso} kg, ${altura} cm → TMB Harris-Benedict revisada: ${tmbRounded.toLocaleString('es-AR')} kcal/día. ${rango}`);

  const insightTitle = __lang === 'en' ? `Your BMR: ${tmbRounded.toLocaleString('en-US')} kcal/day` : `Tu TMB: ${tmbRounded.toLocaleString('es-AR')} kcal/día`;

  const insightText = tmbRounded === 0
    ? (__lang === 'en' ? 'Fill in all four fields to see your basal metabolic rate.' : 'Completá los cuatro campos para ver tu tasa metabólica basal.')
    : (__lang === 'en'
      ? `Your body burns roughly **${tmbRounded.toLocaleString('en-US')} calories per day at complete rest** (Harris-Benedict revised, 1984). Multiply by an activity factor to get your Total Daily Energy Expenditure (TDEE):\n\n${tdeeRows}\n\n*This is an estimate. Values can vary ±10–15% from measured BMR. Consult a registered dietitian for clinical decisions.*`
      : `Tu cuerpo quema aproximadamente **${tmbRounded.toLocaleString('es-AR')} kcal por día en reposo absoluto** (Harris-Benedict revisada, 1984). Multiplicá por el factor de actividad para obtener tu Gasto Energético Total (GET):\n\n${tdeeRows}\n\n*Estimación orientativa. El error típico de la ecuación es ±10–15% respecto a la TMB medida. Consultá con un/a nutricionista para decisiones clínicas.*`);

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: 'neutral',
    icon: '🔥',
  };

  const resultado = tmbRounded === 0
    ? (__lang === 'en' ? '— kcal/day' : '— kcal/día')
    : (__lang === 'en' ? `${tmbRounded.toLocaleString('en-US')} kcal/day` : `${tmbRounded.toLocaleString('es-AR')} kcal/día`);

  return {
    resultado,
    resumen,
    _insight,
  };
}
