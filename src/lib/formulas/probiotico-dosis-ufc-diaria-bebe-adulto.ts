export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function probioticoDosisUfcDiariaBebeAdulto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `From the values **${v1}** and **${v2}**, the result is **${r.toFixed(2)}**.`
      : `A partir de los valores **${v1}** y **${v2}**, el resultado es **${r.toFixed(2)}**.`,
    tone: 'neutral',
    icon: '🦠',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
