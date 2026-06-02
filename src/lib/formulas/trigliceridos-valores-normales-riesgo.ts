export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function trigliceridosValoresNormalesRiesgo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Reference values' : 'Valores de referencia',
    text: __lang === 'en'
      ? `Your result is **${r.toFixed(2)}**. As a guide, fasting triglycerides are **normal under 150 mg/dL**, borderline 150–199, high 200–499 and very high above 500.`
      : `Tu resultado es **${r.toFixed(2)}**. Como guía, los triglicéridos en ayunas son **normales por debajo de 150 mg/dL**, límite 150–199, altos 200–499 y muy altos por encima de 500.`,
    tone: 'neutral' as const,
    icon: '🩸',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
