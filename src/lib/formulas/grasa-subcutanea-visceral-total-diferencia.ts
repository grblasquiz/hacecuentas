export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function grasaSubcutaneaVisceralTotalDiferencia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;

  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `From the values entered, the result is **${r.toFixed(2)}**. Visceral fat (around the organs) carries more metabolic risk than subcutaneous fat, even at the same total.`
      : `Con los valores ingresados, el resultado es **${r.toFixed(2)}**. La grasa visceral (alrededor de los órganos) implica más riesgo metabólico que la subcutánea, aun con el mismo total.`,
    tone: 'neutral',
    icon: '⚖️',
  };

  return { resultado:r.toFixed(2), resumen, _insight };
}
