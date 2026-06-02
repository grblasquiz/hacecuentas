export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function panelSolarKwConsumoHogarAutoconsumo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  return {
    resultado:r.toFixed(2),
    resumen: __lang === 'en' ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.` : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`,
    _insight: {
      title: __lang === 'en' ? 'Your result' : 'Tu resultado',
      text: __lang === 'en'
        ? `The result of **${v1} × ${v2}** is **${r.toFixed(2)}**. Double-check the input units so the figure matches what you need.`
        : `El resultado de **${v1} × ${v2}** es **${r.toFixed(2)}**. Verificá las unidades de los datos cargados para que la cifra sea la que necesitás.`,
      tone: 'neutral',
      icon: '🔆',
    },
  };
}
