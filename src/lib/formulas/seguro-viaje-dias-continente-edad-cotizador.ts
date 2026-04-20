export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function seguroViajeDiasContinenteEdadCotizador(i: Inputs): Outputs {
  const d=Number(i.dias)||0; const c=String(i.continente||'europa'); const e=Number(i.edad)||30;
  const tarifaDiaria={'sudamerica':3,'norteamerica':6,'europa':5,'asia':5,'oceania':7}[c];
  const multEdad=e<65?1:e<75?1.5:2.5;
  const tot=d*tarifaDiaria*multEdad;
  return { premiumTotal:`USD ${Math.round(tot)}`, porDia:`USD ${Math.round(tot/d)}`, cobertura:c==='europa'?'Schengen: USD 30-40k médico obligatorio.':c==='norteamerica'?'Mínimo USD 100k (USA muy caro).':'USD 30-60k recomendado' };
}
