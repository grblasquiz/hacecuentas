export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function leerMesLibrosMetaAnualReto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;
  const insightText = __lang === 'en'
    ? `Dividing **${v1}** by **${v2}** gives **${r.toFixed(2)}**: the first value is **${r.toFixed(2)} times** the second.`
    : `Dividiendo **${v1}** entre **${v2}** obtenés **${r.toFixed(2)}**: el primer valor equivale a **${r.toFixed(2)} veces** el segundo.`;
  return {
    resultado:r.toFixed(2),
    resumen,
    _insight: {
      title: __lang === 'en' ? 'Result' : 'Resultado',
      text: insightText,
      tone: 'neutral',
      icon: '📚',
    },
  };
}
