export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function wheyProteinDosisDiariaScoop(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your daily whey dose' : 'Tu dosis diaria de whey',
    text: __lang === 'en'
      ? `The result comes to **${r.toFixed(1)}**. One whey scoop is usually ~25-30 g of protein; spread your daily intake across meals rather than in one shot, since the body absorbs protein better in **20-40 g** portions.`
      : `El resultado da **${r.toFixed(1)}**. Un scoop de whey suele aportar ~25-30 g de proteína; repartí la ingesta del día en varias comidas en vez de todo de una, porque el cuerpo aprovecha mejor la proteína en porciones de **20-40 g**.`,
    tone: 'neutral' as const,
    icon: '🥤',
  };
  return { resultado:r.toFixed(1), resumen, _insight };
}
