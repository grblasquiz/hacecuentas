export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function bonosGlobalesAl30Gd30Rendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.precioCompra)||0; const c=Number(i.cuponAnual)||0; const n=Number(i.anosRestantes)||1;
  const tir=p>0?(((100/p)**(1/n)-1)*100+c/p*100):0;
  const interpretacion = __lang === 'en'
    ? `If you hold for ${n} years and there is no default, the yield is ~${tir.toFixed(1)}% per year in USD.`
    : `Si mantenés ${n} años y no hay default, rinde ~${tir.toFixed(1)}% anual en USD.`;
  return { tirAproximada:`${tir.toFixed(1)}%`, ingresoCuponAnual:`USD ${c.toFixed(2)}`, interpretacion };
}
