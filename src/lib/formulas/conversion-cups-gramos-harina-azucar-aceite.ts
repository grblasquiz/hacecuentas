export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionCupsGramosHarinaAzucarAceite(i: Inputs): Outputs {
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
    title: __lang === 'en' ? 'Why grams beat cups' : __lang === 'pt' ? 'Por que gramas é melhor que xícaras' : 'Por qué gramos le gana a tazas',
    text: __lang === 'en'
      ? `That comes to **${rTxt} g**. A "cup" isn't a fixed weight: a cup of flour is ~120 g but a cup of sugar is ~200 g and oil ~218 g. Converting to grams is the only way to bake the same recipe twice.`
      : __lang === 'pt'
      ? `Isso dá **${rTxt} g**. Uma "xícara" não é um peso fixo: uma xícara de farinha tem ~120 g, mas uma de açúcar tem ~200 g e óleo ~218 g. Converter para gramas é a única forma de repetir a mesma receita.`
      : `Eso da **${rTxt} g**. Una "taza" no es un peso fijo: una taza de harina pesa ~120 g, pero una de azúcar ~200 g y de aceite ~218 g. Pasar a gramos es la única forma de repetir la misma receta sin que te salga distinta.`,
    tone: 'neutral',
    icon: '🧁',
  };

  return { resultado:r.toFixed(2), resumen, _insight };
}
