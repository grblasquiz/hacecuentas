export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; _chart?: any; }
export function cobayoVitaminaCDosisDiaria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const rFmt = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${rFmt}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} / 10 = ${rFmt}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${rFmt}.`;
  const ins = {
    es: { title: 'Dosis diaria de vitamina C', text: `La dosis diaria estimada para tu cobayo es de **${rFmt} mg**. Los cuyes no sintetizan vitamina C y dependen 100% de la dieta: cubrila con pellets frescos, verduras (pimiento, perejil) y suplemento si está enfermo o gestante.`, icon: '🐹' },
    en: { title: 'Daily vitamin C dose', text: `Your guinea pig's estimated daily dose is **${rFmt} mg**. Guinea pigs can't make vitamin C and rely entirely on diet: cover it with fresh pellets, veggies (bell pepper, parsley) and a supplement if sick or pregnant.`, icon: '🐹' },
    pt: { title: 'Dose diária de vitamina C', text: `A dose diária estimada para sua cobaia é de **${rFmt} mg**. As cobaias não produzem vitamina C e dependem totalmente da dieta: garanta-a com ração fresca, vegetais (pimentão, salsa) e suplemento se estiver doente ou gestante.`, icon: '🐹' },
  }[__lang];
  return { resultado:rFmt, resumen, _insight: { title: ins.title, text: ins.text, tone: 'neutral', icon: ins.icon } };
}
