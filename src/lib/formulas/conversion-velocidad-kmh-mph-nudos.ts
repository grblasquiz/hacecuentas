export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionVelocidadKmhMphNudos(i: Inputs): Outputs {
  const v=Number(i.v)||0; const d=String(i.de||'kmh');
  let kmh:number;
  if (d==='kmh') kmh=v; else if (d==='mph') kmh=v*1.609; else if (d==='kn') kmh=v*1.852; else kmh=v*3.6;
  const mph=kmh/1.609; const kn=kmh/1.852; const ms=kmh/3.6;
  const insight = {
    title: 'Velocidad equivalente',
    text: `**${kmh.toFixed(1)} km/h** equivalen a **${mph.toFixed(1)} mph**, **${kn.toFixed(1)} nudos** y **${ms.toFixed(1)} m/s**. Recordá que el límite y el velocímetro de EE.UU. y Reino Unido van en mph, y la náutica/aviación en nudos.`,
    tone: 'neutral',
    icon: '🚗',
  };
  return { kmh:`${kmh.toFixed(2)}`, mph:`${mph.toFixed(2)}`, kn:`${kn.toFixed(2)}`, ms:`${ms.toFixed(2)}`, resumen:`${v} ${d} = ${kmh.toFixed(1)} km/h.`, _insight: insight };
}
