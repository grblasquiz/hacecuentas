export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function seguroViajeDiasContinenteEdadCotizador(i: Inputs): Outputs {
  const d=Number(i.dias)||0; const c=String(i.continente||'europa'); const e=Number(i.edad)||30;
  // Base daily rate (USD) by continent — mid-market average
  const tarifaMap: Record<string,number>={'sudamerica':3.5,'norteamerica':9,'europa':4.75,'asia':4.5,'oceania':6.5};
  const tarifaDiaria=tarifaMap[c]??4.75;
  // Age multiplier — granular 8-band scale based on actuarial market data
  let multEdad: number;
  if (e<18) multEdad=0.80;
  else if (e<=30) multEdad=1.00;
  else if (e<=40) multEdad=1.15;
  else if (e<=50) multEdad=1.35;
  else if (e<=60) multEdad=1.65;
  else if (e<=70) multEdad=2.10;
  else if (e<=75) multEdad=2.80;
  else if (e<=80) multEdad=3.50;
  else multEdad=4.50;
  const tot=d*tarifaDiaria*multEdad;
  const contNombre: Record<string,string>={'sudamerica':'Sudamérica','norteamerica':'Norteamérica','europa':'Europa','asia':'Asia','oceania':'Oceanía'};
  const destino=contNombre[c]||c;
  let insightText=`Para **${d} días** en **${destino}** la prima ronda **USD ${Math.round(tot)}** (USD ${(tot/d).toFixed(2)}/día).`;
  let insightTone='neutral';
  if (multEdad>1) {
    insightText+=` A los **${e} años** se aplica un recargo ×${multEdad.toFixed(2)} por edad — el factor que más pesa en la cotización.`;
    insightTone='warn';
  } else if (c==='norteamerica') {
    insightText+=` Para EE.UU. no bajes de **USD 100.000** de cobertura médica: la atención es carísima.`;
    insightTone='warn';
  } else if (c==='europa') {
    insightText+=` Schengen exige cobertura médica mínima de **€30.000** (≈ USD 32.000) para ingresar con visa.`;
  }
  const coberturaMap: Record<string,string>={
    'sudamerica':'Mínimo USD 30.000 recomendado',
    'norteamerica':'Mínimo USD 100.000 (EE.UU. muy caro)',
    'europa':'Schengen: €30.000 obligatorio (≈ USD 32.000)',
    'asia':'Mínimo USD 50.000 recomendado',
    'oceania':'Mínimo USD 60.000 recomendado'
  };
  const cobertura=coberturaMap[c]??'Mínimo USD 40.000 recomendado';
  const insight={title:'Tu cotización estimada',text:insightText,tone:insightTone,icon:'🌍'};
  return { premiumTotal:`USD ${Math.round(tot)}`, porDia:`USD ${(tot/d).toFixed(2)}/día`, cobertura, _insight: insight };
}
