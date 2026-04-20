export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hotelVsAirbnbVsHostelNocheComparativa(i: Inputs): Outputs {
  const p=Number(i.personas)||1; const n=Number(i.noches)||1; const t=String(i.tipoViaje||'pareja');
  const hostel=n*25*p; const airbnb=n*80*(p>2?1.3:1); const hotel=n*120*(p>1?1:0.7);
  const recMap={'solo':'Hostel','pareja':'Airbnb','familia':'Airbnb','amigos':'Airbnb grande o hostel grupo'};
  return { hostelUsd:`USD ${hostel}`, airbnbUsd:`USD ${Math.round(airbnb)}`, hotelUsd:`USD ${Math.round(hotel)}`, recomendacion:recMap[t] };
}
