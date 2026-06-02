export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function hotelVsAirbnbVsHostelNocheComparativa(i: Inputs): Outputs {
  const p=Number(i.personas)||1; const n=Number(i.noches)||1; const t=String(i.tipoViaje||'pareja');
  const hostel=n*25*p; const airbnb=n*80*(p>2?1.3:1); const hotel=n*120*(p>1?1:0.7);
  const recMap={'solo':'Hostel','pareja':'Airbnb','familia':'Airbnb','amigos':'Airbnb grande o hostel grupo'};

  // Insight: cuál es la opción más barata y cuánto se ahorra vs la más cara
  const opciones = [
    { nombre: 'Hostel', valor: hostel },
    { nombre: 'Airbnb', valor: Math.round(airbnb) },
    { nombre: 'Hotel', valor: Math.round(hotel) },
  ].sort((a, b) => a.valor - b.valor);
  const barata = opciones[0];
  const cara = opciones[opciones.length - 1];
  const ahorro = cara.valor - barata.valor;
  const _insight = {
    title: 'Opción más económica',
    text: `Para **${p} ${p === 1 ? 'persona' : 'personas'}** y **${n} ${n === 1 ? 'noche' : 'noches'}**, lo más barato es **${barata.nombre}** a **USD ${barata.valor}** — hasta **USD ${ahorro}** menos que ${cara.nombre} (USD ${cara.valor}). Recomendación según tu viaje: **${recMap[t]}**.`,
    tone: 'neutral',
    icon: '🏨',
  };

  return { hostelUsd:`USD ${hostel}`, airbnbUsd:`USD ${Math.round(airbnb)}`, hotelUsd:`USD ${Math.round(hotel)}`, recomendacion:recMap[t], _insight };
}
