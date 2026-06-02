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
  _insight?: any;
  _chart?: any;
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

  const tone = p === 'hta' ? 'warn' : (p === 'pre' ? 'neutral' : 'good');
  const _insight = {
    title: __lang === 'en' ? 'Your daily sodium limit' : 'Tu límite diario de sodio',
    text: __lang === 'en'
      ? `Your recommended ceiling is **${max} mg of sodium/day**, equal to **${sal.toFixed(1)} g of salt** (about ${(sal / 5).toFixed(1)} teaspoons). ${p === 'hta' ? 'With hypertension the AHA advises this **stricter** target to help lower blood pressure.' : (p === 'pre' ? 'With pre-hypertension, **trimming sodium gradually** helps keep numbers in check.' : 'This is the **general WHO limit** for healthy adults.')}`
      : `Tu tope recomendado es **${max} mg de sodio/día**, equivalente a **${sal.toFixed(1)} g de sal** (unas ${(sal / 5).toFixed(1)} cucharaditas). ${p === 'hta' ? 'Con hipertensión la AHA recomienda este objetivo **más estricto** para ayudar a bajar la presión.' : (p === 'pre' ? 'Con prehipertensión, **reducir el sodio de a poco** ayuda a mantener los valores bajo control.' : 'Es el **límite general de la OMS** para adultos sanos.')}`,
    tone,
    icon: '🧂',
  };

  const _chart = {
    type: 'scale',
    marker: max,
    markerLabel: __lang === 'en' ? `${max} mg (your limit)` : `${max} mg (tu límite)`,
    min: 1000,
    segments: __lang === 'en'
      ? [
          { nombre: 'Strict (HTA)', max: 1500, color: '#16a34a', colorDark: '#22c55e' },
          { nombre: 'WHO limit', max: 2000, color: '#eab308', colorDark: '#facc15' },
          { nombre: 'Excess', max: 2300, color: '#dc2626', colorDark: '#ef4444' },
        ]
      : [
          { nombre: 'Estricto (HTA)', max: 1500, color: '#16a34a', colorDark: '#22c55e' },
          { nombre: 'Límite OMS', max: 2000, color: '#eab308', colorDark: '#facc15' },
          { nombre: 'Exceso', max: 2300, color: '#dc2626', colorDark: '#ef4444' },
        ],
    ariaLabel: __lang === 'en'
      ? `Daily sodium limit of ${max} mg on a scale up to 2300 mg`
      : `Límite diario de sodio de ${max} mg en una escala hasta 2300 mg`,
  };

  return {
    sodioMaxMg: max,
    salEquivalenteG: Number(sal.toFixed(1)),
    recomendacion: rec,
    resumen: __lang === 'en'
      ? `Your limit: ${max} mg sodium = ${sal.toFixed(1)} g salt/day.`
      : `Tu límite: ${max} mg sodio = ${sal.toFixed(1)} g sal/día.`,
    _insight,
    _chart,
  };
}
