export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function macrosVeganoProteinaVegetalFuentes(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`;
  return {
    resultado:r.toFixed(1), resumen,
    _insight: {
      title: __lang === 'en' ? 'Your result' : 'Tu resultado',
      text: __lang === 'en'
        ? `With the values entered, the result is **${r.toFixed(1)}**.`
        : `Con los valores ingresados, el resultado es **${r.toFixed(1)}**.`,
      tone: 'neutral',
      icon: '🌱',
    },
  };
}
