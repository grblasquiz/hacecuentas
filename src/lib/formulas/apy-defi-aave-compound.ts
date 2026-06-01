export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function apyDefiAaveCompound(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=Number(i.montoUsd)||0; const a=Number(i.apy)||0; const d=Number(i.plazoDias)||0;
  const g=m*a/100*d/365; const f=m+g;
  const interpretacion = __lang === 'en'
    ? `With ${a}% APY over ${d} days: you earn USD ${g.toFixed(2)}.`
    : `Con ${a}% APY durante ${d} días: ganás USD ${g.toFixed(2)}.`;
  return { ganancia:`USD ${g.toFixed(2)}`, valorFinal:`USD ${f.toFixed(2)}`, interpretacion };
}
