export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function colesterolTotalLdlHdlValoresDeseables(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Reference figures only' : 'Solo valores de referencia',
    text: __lang === 'en'
      ? `The result is **${r.toFixed(2)}**, derived from the values you entered (**${v1}** and **${v2}**). Desirable cholesterol ranges (total <200, LDL <100, HDL >40-60 mg/dL) are general guidelines — only a lab test and your doctor can read your real numbers.`
      : `El resultado es **${r.toFixed(2)}**, calculado a partir de los valores que cargaste (**${v1}** y **${v2}**). Los rangos deseables de colesterol (total <200, LDL <100, HDL >40-60 mg/dL) son orientativos: solo un análisis de sangre y tu médico interpretan tus valores reales.`,
    tone: 'neutral',
    icon: '🩸',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
