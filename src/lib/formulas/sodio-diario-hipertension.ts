/**
 * Sodio máximo según presión.
 */

export interface SodioDiarioHipertensionInputs {
  presion: string;
  __lang?: string;
}

export interface SodioDiarioHipertensionOutputs {
  sodioMaxMg: number;
  salEquivalenteG: number;
  recomendacion: string;
  resumen: string;
}

export function sodioDiarioHipertension(inputs: SodioDiarioHipertensionInputs): SodioDiarioHipertensionOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const p = inputs.presion || 'normal';
  let max: number, rec: string;
  if (p === 'hta') {
    max = 1500;
    rec = __lang === 'en' ? 'Hypertension: strict AHA sodium reduction.' : 'HTA: reducción estricta AHA.';
  } else if (p === 'pre') {
    max = 1800;
    rec = __lang === 'en' ? 'Pre-hypertension: gradually reduce sodium intake.' : 'Prehipertensión: reducir progresivamente.';
  } else {
    max = 2000;
    rec = __lang === 'en' ? 'Normal: general WHO sodium limit.' : 'Normal: límite OMS general.';
  }
  const sal = max / 400;
  return {
    sodioMaxMg: max,
    salEquivalenteG: Number(sal.toFixed(1)),
    recomendacion: rec,
    resumen: __lang === 'en'
      ? `Your limit: ${max} mg sodium = ${sal.toFixed(1)} g salt/day.`
      : `Tu límite: ${max} mg sodio = ${sal.toFixed(1)} g sal/día.`,
  };
}
