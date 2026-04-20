export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cafeinaDosisSeguraDiariaPeso(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const emb=String(i.embarazada||'no');
  let max=Math.min(400,p*6);
  if(emb==='si') max=200;
  return { maximoDiario:`${Math.round(max)} mg`, equivalencia:`~${Math.round(max/95)} tazas café (95 mg/taza)`, recomendacion:emb==='si'?'Embarazo: máx 200 mg. Ideal <100 mg.':'400 mg = límite FDA. Menos si problemas sueño/ansiedad.' };
}
