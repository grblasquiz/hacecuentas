export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function perimetroAbdominalRiesgoCardiovascular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  return {
    resultado:r.toFixed(2), resumen,
    _insight: {
      title: __lang === 'en' ? 'Reading your result' : 'Cómo leer tu resultado',
      text: __lang === 'en'
        ? `With the values entered (**${v1}** and **${v2}**) the result is **${r.toFixed(2)}**. Cardiovascular risk from waist circumference is judged against reference cut-offs (around 94 cm in men and 80 cm in women); check yours with a healthcare professional.`
        : `Con los valores cargados (**${v1}** y **${v2}**) el resultado es **${r.toFixed(2)}**. El riesgo cardiovascular por perímetro abdominal se interpreta contra valores de corte de referencia (cerca de 94 cm en hombres y 80 cm en mujeres); confirmá el tuyo con un profesional de salud.`,
      tone: 'neutral',
      icon: '🫀',
    },
  };
}
