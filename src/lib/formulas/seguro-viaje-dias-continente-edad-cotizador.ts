export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function seguroViajeDiasContinenteEdadCotizador(i: Inputs): Outputs {
  const d=Number(i.dias)||0; const c=String(i.continente||'europa'); const e=Number(i.edad)||30;
  const tarifaDiaria={'sudamerica':3,'norteamerica':6,'europa':5,'asia':5,'oceania':7}[c];
  const multEdad=e<65?1:e<75?1.5:2.5;
  const tot=d*tarifaDiaria*multEdad;
  const contNombre={'sudamerica':'Sudamérica','norteamerica':'Norteamérica','europa':'Europa','asia':'Asia','oceania':'Oceanía'}[c]||c;
  let insightText=`Para **${d} días** en **${contNombre}** la prima ronda **USD ${Math.round(tot)}** (USD ${Math.round(tot/d)}/día).`;
  let insightTone='neutral';
  if (multEdad>1) {
    insightText+=` A los **${e} años** se aplica un recargo ×${multEdad} por edad, el factor que más pesa en la cotización.`;
    insightTone='warn';
  } else if (c==='norteamerica') {
    insightText+=` Para EE.UU. no bajes de **USD 100.000** de cobertura médica: la atención es carísima.`;
    insightTone='warn';
  } else if (c==='europa') {
    insightText+=` Schengen exige un mínimo de **USD 30.000-40.000** médico para entrar.`;
  }
  const insight={title:'Tu cotización',text:insightText,tone:insightTone,icon:'🌍'};
  return { premiumTotal:`USD ${Math.round(tot)}`, porDia:`USD ${Math.round(tot/d)}`, cobertura:c==='europa'?'Schengen: USD 30-40k médico obligatorio.':c==='norteamerica'?'Mínimo USD 100k (USA muy caro).':'USD 30-60k recomendado', _insight: insight };
}
