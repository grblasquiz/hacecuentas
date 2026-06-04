export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }

/**
 * Waist-to-Hip Ratio (WHR) — WHO formula.
 * WHR = waist circumference / hip circumference
 * Risk bands per WHO Expert Consultation (Geneva 2008):
 *   Men:   <0.90 = low, 0.90–0.95 = moderate, >0.95 = high
 *   Women: <0.80 = low, 0.80–0.85 = moderate, >0.85 = high
 */
export function indiceCinturaCaderaSaludCardiovascular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const sexo = String(i.sexo || 'masculino').toLowerCase();
  const cintura = Number(i.cintura) || 0;
  const cadera = Number(i.cadera) || 1;

  if (cadera <= 0 || cintura <= 0) {
    return {
      resultado: '',
      resumen: __lang === 'en' ? 'Enter valid measurements greater than zero.' : 'Ingresá medidas válidas mayores a cero.',
      _insight: {
        title: __lang === 'en' ? 'Missing data' : 'Datos faltantes',
        text: __lang === 'en' ? 'Enter your waist and hip circumference to calculate your WHR.' : 'Ingresá tu circunferencia de cintura y cadera para calcular tu ICC.',
        tone: 'neutral',
        icon: '📏',
      },
    };
  }

  const whr = cintura / cadera;
  const whrStr = whr.toFixed(2);

  // WHO risk bands
  const isMale = sexo === 'masculino' || sexo === 'hombre' || sexo === 'male' || sexo === 'm';

  let riskLevel: 'low' | 'moderate' | 'high';
  if (isMale) {
    riskLevel = whr < 0.90 ? 'low' : whr <= 0.95 ? 'moderate' : 'high';
  } else {
    riskLevel = whr < 0.80 ? 'low' : whr <= 0.85 ? 'moderate' : 'high';
  }

  const riskLabels = {
    es: { low: 'Riesgo bajo', moderate: 'Riesgo moderado', high: 'Riesgo alto' },
    en: { low: 'Low risk', moderate: 'Moderate risk', high: 'High risk' },
  };
  const tones = { low: 'positive', moderate: 'neutral', high: 'warning' } as const;
  const icons = { low: '✅', moderate: '⚠️', high: '🔴' };

  const lang = __lang as 'en' | 'es';
  const riskLabel = riskLabels[lang][riskLevel];
  const tone = tones[riskLevel];
  const icon = icons[riskLevel];

  const referenceHint = isMale
    ? (__lang === 'en' ? 'WHO reference for men: <0.90 low · 0.90–0.95 moderate · >0.95 high risk.' : 'Referencia OMS hombres: <0,90 bajo · 0,90–0,95 moderado · >0,95 alto riesgo.')
    : (__lang === 'en' ? 'WHO reference for women: <0.80 low · 0.80–0.85 moderate · >0.85 high risk.' : 'Referencia OMS mujeres: <0,80 bajo · 0,80–0,85 moderado · >0,85 alto riesgo.');

  const resumen = __lang === 'en'
    ? `WHR ${whrStr} — **${riskLabel}**. ${referenceHint}`
    : `ICC ${whrStr} — **${riskLabel}**. ${referenceHint}`;

  const insightText = __lang === 'en'
    ? `Your waist-to-hip ratio is **${whrStr}** — classified as **${riskLabel}** by WHO guidelines. ${referenceHint} This is a screening indicator only; consult a healthcare provider for a full assessment.`
    : `Tu índice cintura-cadera es **${whrStr}** — clasificado como **${riskLabel}** según la OMS. ${referenceHint} Este es un indicador de tamizaje; consultá con un profesional de salud para una evaluación completa.`;

  const insightTitle = __lang === 'en' ? riskLabel : riskLabel;

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone,
    icon,
    chart: {
      type: 'gauge' as const,
      value: whr,
      min: 0.5,
      max: 1.2,
      thresholds: isMale
        ? [{ value: 0.90, label: __lang === 'en' ? 'Moderate' : 'Moderado' }, { value: 0.95, label: __lang === 'en' ? 'High' : 'Alto' }]
        : [{ value: 0.80, label: __lang === 'en' ? 'Moderate' : 'Moderado' }, { value: 0.85, label: __lang === 'en' ? 'High' : 'Alto' }],
    },
  };

  return {
    resultado: whrStr,
    resumen,
    _insight,
  };
}
