export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function depreciacionAutoAnualValorResidual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v=Number(i.valor)||0; const a=Number(i.anios)||1;
  const pct1=0.2; const pctN=0.12;
  let vf=v*(1-pct1);
  for (let k=1;k<a;k++) vf*=(1-pctN);
  const resumen = __lang === 'en'
    ? `After ${a} years: $${vf.toFixed(0)} (loss ${((1-vf/v)*100).toFixed(0)}%).`
    : `Tras ${a} años: $${vf.toFixed(0)} (pérdida ${((1-vf/v)*100).toFixed(0)}%).`;
  return { valorFinal:`$${vf.toFixed(0)}`, perdida:`$${(v-vf).toFixed(0)}`, pctAnual:`~${(pctN*100).toFixed(0)}%`, resumen };
}
