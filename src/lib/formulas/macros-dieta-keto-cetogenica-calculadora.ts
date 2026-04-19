export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function macrosDietaKetoCetogenicaCalculadora(i: Inputs): Outputs {
  const c=Number(i.calorias)||2000; const n=String(i.nivel||'estricto');
  const rat: Record<string,[number,number,number]> = { estricto:[0.75,0.20,0.05], moderado:[0.70,0.22,0.08], ciclico:[0.60,0.25,0.15] };
  const [pg,pp,pc]=rat[n]||rat.estricto;
  return { proteina:(c*pp/4).toFixed(0)+'g', grasa:(c*pg/9).toFixed(0)+'g', carbs:(c*pc/4).toFixed(0)+'g', resumen:`${c} kcal keto ${n}: ${(c*pg/9).toFixed(0)}g grasa, ${(c*pp/4).toFixed(0)}g proteína, ${(c*pc/4).toFixed(0)}g carbs.` };
}
