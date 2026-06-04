export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Recommended sleep hours for adults by age group.
 * Source: AASM/Sleep Research Society consensus (Watson et al., Sleep 2015)
 * and National Sleep Foundation panel (Hirshkowitz et al., Sleep Health 2015).
 *
 * Age groups:
 *   18–25 (young adult):  recommended 7–9 h, acceptable 6–11 h
 *   26–64 (adult):        recommended 7–9 h, acceptable 6–10 h
 *   65+  (older adult):   recommended 7–8 h, acceptable 5–9 h
 */
export function horasSuenoNecesariasEdadAdulto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const edad = Number(i.edad);
  const horasDormidas = i.horas_dormidas !== '' && i.horas_dormidas !== undefined && i.horas_dormidas !== null
    ? Number(i.horas_dormidas)
    : NaN;

  // --- Determine age group ---
  if (!Number.isFinite(edad) || edad < 18 || edad > 110) {
    const errMsg = __lang === 'en'
      ? 'Please enter a valid age between 18 and 110.'
      : 'Ingresá una edad válida entre 18 y 110.';
    return { resultado: '', resumen: errMsg };
  }

  let minRec: number, maxRec: number;
  let minAccept: number, maxAccept: number;
  let grupoES: string, grupoEN: string;

  if (edad <= 25) {
    minRec = 7; maxRec = 9;
    minAccept = 6; maxAccept = 11;
    grupoES = 'Adulto joven (18–25 años)';
    grupoEN = 'Young adult (18–25 years)';
  } else if (edad <= 64) {
    minRec = 7; maxRec = 9;
    minAccept = 6; maxAccept = 10;
    grupoES = 'Adulto (26–64 años)';
    grupoEN = 'Adult (26–64 years)';
  } else {
    minRec = 7; maxRec = 8;
    minAccept = 5; maxAccept = 9;
    grupoES = 'Adulto mayor (65+ años)';
    grupoEN = 'Older adult (65+ years)';
  }

  const resultado = __lang === 'en'
    ? `${minRec}–${maxRec} hours`
    : `${minRec}–${maxRec} horas`;

  // --- Evaluate current sleep if provided ---
  let evaluacionES = '';
  let evaluacionEN = '';
  if (Number.isFinite(horasDormidas) && horasDormidas > 0) {
    if (horasDormidas < minAccept) {
      evaluacionES = `Dormís **${horasDormidas} h**, que está por debajo del mínimo aceptable de ${minAccept} h. Déficit crónico asociado a mayor riesgo cardiovascular y metabólico.`;
      evaluacionEN = `You sleep **${horasDormidas} h**, below the acceptable minimum of ${minAccept} h. Chronic deficit is associated with elevated cardiovascular and metabolic risk.`;
    } else if (horasDormidas < minRec) {
      evaluacionES = `Dormís **${horasDormidas} h**, ligeramente por debajo del rango recomendado (${minRec}–${maxRec} h). Intentá incorporar 30–60 min más por noche.`;
      evaluacionEN = `You sleep **${horasDormidas} h**, slightly below the recommended range (${minRec}–${maxRec} h). Try adding 30–60 minutes per night.`;
    } else if (horasDormidas <= maxRec) {
      evaluacionES = `Dormís **${horasDormidas} h**, dentro del rango recomendado (${minRec}–${maxRec} h). Bien.`;
      evaluacionEN = `You sleep **${horasDormidas} h**, within the recommended range (${minRec}–${maxRec} h). On target.`;
    } else if (horasDormidas <= maxAccept) {
      evaluacionES = `Dormís **${horasDormidas} h**, ligeramente por encima del recomendado. La curva de riesgo es en U: dormir demasiado también se asocia a mayor mortalidad cardiovascular.`;
      evaluacionEN = `You sleep **${horasDormidas} h**, slightly above the recommended range. Sleep risk is U-shaped: too much sleep is also associated with higher cardiovascular mortality.`;
    } else {
      evaluacionES = `Dormís **${horasDormidas} h**, por encima del máximo aceptable de ${maxAccept} h. El exceso de sueño en adultos se asocia a condiciones subyacentes; consultá con un profesional.`;
      evaluacionEN = `You sleep **${horasDormidas} h**, above the acceptable maximum of ${maxAccept} h. Excess sleep in adults is associated with underlying conditions; consult a healthcare professional.`;
    }
  }

  const resumen = __lang === 'en'
    ? [
        `**${grupoEN}** → Recommended: ${minRec}–${maxRec} h/night · Acceptable: ${minAccept}–${maxAccept} h/night`,
        evaluacionEN,
      ].filter(Boolean).join('\n\n')
    : [
        `**${grupoES}** → Recomendado: ${minRec}–${maxRec} h/noche · Aceptable: ${minAccept}–${maxAccept} h/noche`,
        evaluacionES,
      ].filter(Boolean).join('\n\n');

  // --- Insight block ---
  const sleepDiffEN = Number.isFinite(horasDormidas) && horasDormidas > 0
    ? ` You report sleeping ${horasDormidas} h.`
    : '';
  const sleepDiffES = Number.isFinite(horasDormidas) && horasDormidas > 0
    ? ` Informaste que dormís ${horasDormidas} h.`
    : '';

  const _insight = {
    title: __lang === 'en' ? 'Sleep recommendation' : 'Recomendación de sueño',
    text: __lang === 'en'
      ? `As a **${grupoEN}**, the AASM/NSF consensus recommends **${minRec}–${maxRec} hours** of sleep per night (acceptable range: ${minAccept}–${maxAccept} h).${sleepDiffEN} The recommended range is the same for both 18–25 and 26–64 age groups; it narrows slightly to 7–8 h for adults 65+.`
      : `Como **${grupoES}**, el consenso AASM/NSF recomienda **${minRec}–${maxRec} horas** de sueño por noche (rango aceptable: ${minAccept}–${maxAccept} h).${sleepDiffES} El rango recomendado es igual para los grupos 18–25 y 26–64; se estrecha levemente a 7–8 h para mayores de 65.`,
    tone: 'neutral',
    icon: '😴',
  };

  return { resultado, resumen, _insight };
}
