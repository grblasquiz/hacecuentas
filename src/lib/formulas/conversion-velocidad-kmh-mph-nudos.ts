export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionVelocidadKmhMphNudos(i: Inputs): Outputs {
  const v=Number(i.v)||0; const d=String(i.de||'kmh');
  let kmh:number;
  if (d==='kmh') kmh=v; else if (d==='mph') kmh=v*1.609; else if (d==='kn') kmh=v*1.852; else kmh=v*3.6;
  return { kmh:`${kmh.toFixed(2)}`, mph:`${(kmh/1.609).toFixed(2)}`, kn:`${(kmh/1.852).toFixed(2)}`, ms:`${(kmh/3.6).toFixed(2)}`, resumen:`${v} ${d} = ${kmh.toFixed(1)} km/h.` };
}
