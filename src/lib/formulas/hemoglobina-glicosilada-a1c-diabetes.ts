export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function hemoglobinaGlicosiladaA1cDiabetes(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Combining **${v1}** and **${v2}** gives a result of **${r.toFixed(2)}**. This is a general estimate — for diabetes diagnosis or follow-up, always rely on a lab A1C test interpreted by your doctor.`
      : `Combinando **${v1}** y **${v2}** se obtiene un resultado de **${r.toFixed(2)}**. Es una estimación orientativa — para diagnóstico o seguimiento de diabetes, guiate siempre por un análisis de A1C de laboratorio interpretado por tu médico.`,
    tone: 'neutral',
    icon: '🩸',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
