export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function becaPromedioMinimoRequisitoUniversidades(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;
  const insightText = __lang === 'en'
    ? `Your resulting average is **${r.toFixed(2)}**. Compare it against the minimum GPA each scholarship or university demands: meeting it is usually a hard eligibility gate.`
    : `Tu promedio resultante es **${r.toFixed(2)}**. Compará ese número con el promedio mínimo que pide cada beca o universidad: cumplirlo suele ser un requisito excluyente para postular.`;
  return {
    resultado:r.toFixed(2),
    resumen,
    _insight: {
      title: __lang === 'en' ? 'How to read your average' : 'Cómo leer tu promedio',
      text: insightText,
      tone: 'neutral',
      icon: '📊',
    },
  };
}
