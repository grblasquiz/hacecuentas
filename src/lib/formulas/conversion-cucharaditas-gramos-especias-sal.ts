export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionCucharaditasGramosEspeciasSal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;

  const rTxt = r.toFixed(2).replace(/\.?0+$/, '');
  const _insight = {
    title: __lang === 'en' ? 'Kitchen tip' : __lang === 'pt' ? 'Dica de cozinha' : 'Tip de cocina',
    text: __lang === 'en'
      ? `That gives you **${rTxt} g**. Density matters: a teaspoon of salt weighs more than one of a light spice like oregano, so weighing on a scale beats eyeballing spoons.`
      : __lang === 'pt'
      ? `Isso dá **${rTxt} g**. A densidade importa: uma colher de sal pesa mais do que uma de uma especiaria leve como orégano, então pesar na balança é melhor do que estimar com colheres.`
      : `Eso te da **${rTxt} g**. La densidad importa: una cucharadita de sal pesa más que una de una especia liviana como el orégano, así que pesar en balanza es más preciso que medir a ojo con cucharas.`,
    tone: 'neutral',
    icon: '🥄',
  };

  return { resultado:r.toFixed(2), resumen, _insight };
}
