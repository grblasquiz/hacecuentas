export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function tmbBasalHarrisBenedictMetabolismo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Taking **${v2}%** of **${v1}** gives **${r.toFixed(2)}**. Adjust either value to see how the result moves before you apply it.`
      : `Tomar el **${v2}%** de **${v1}** da **${r.toFixed(2)}**. Cambiá cualquiera de los dos valores para ver cómo se mueve el resultado antes de usarlo.`,
    tone: 'neutral',
    icon: '🧮',
  };
  return {
    resultado:r.toFixed(2),
    resumen: __lang === 'en'
      ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
      : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`,
    _insight,
  };
}
