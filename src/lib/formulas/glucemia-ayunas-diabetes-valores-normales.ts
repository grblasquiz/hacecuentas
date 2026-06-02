export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function glucemiaAyunasDiabetesValoresNormales(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Result' : 'Resultado',
    text: __lang === 'en'
      ? `With **${v1}** and **${v2}** the result is **${r.toFixed(2)}**. For real fasting glucose values, blood-sugar interpretation should always be confirmed by a medical lab and your doctor.`
      : `Con **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}**. Para valores reales de glucemia en ayunas, la interpretación siempre debe confirmarla un laboratorio y tu médico.`,
    tone: 'neutral',
    icon: '🩸',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
