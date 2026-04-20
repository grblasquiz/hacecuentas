export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bonosGlobalesAl30Gd30Rendimiento(i: Inputs): Outputs {
  const p=Number(i.precioCompra)||0; const c=Number(i.cuponAnual)||0; const n=Number(i.anosRestantes)||1;
  const tir=p>0?(((100/p)**(1/n)-1)*100+c/p*100):0;
  return { tirAproximada:`${tir.toFixed(1)}%`, ingresoCuponAnual:`USD ${c.toFixed(2)}`, interpretacion:`Si mantenés ${n} años y no hay default, rinde ~${tir.toFixed(1)}% anual en USD.` };
}
