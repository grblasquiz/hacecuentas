/**
 * Sodio máximo según presión.
 */

export interface SodioDiarioHipertensionInputs {
  presion: string;
}

export interface SodioDiarioHipertensionOutputs {
  sodioMaxMg: number;
  salEquivalenteG: number;
  recomendacion: string;
  resumen: string;
}

export function sodioDiarioHipertension(inputs: SodioDiarioHipertensionInputs): SodioDiarioHipertensionOutputs {
  const p = inputs.presion || 'normal';
  let max: number, rec: string;
  if (p === 'hta') { max = 1500; rec = 'HTA: reducción estricta AHA.'; }
  else if (p === 'pre') { max = 1800; rec = 'Prehipertensión: reducir progresivamente.'; }
  else { max = 2000; rec = 'Normal: límite OMS general.'; }
  const sal = max / 400;
  return {
    sodioMaxMg: max,
    salEquivalenteG: Number(sal.toFixed(1)),
    recomendacion: rec,
    resumen: `Tu límite: ${max} mg sodio = ${sal.toFixed(1)} g sal/día.`,
  };
}
