export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function consumoCombustibleKmLitro(i: Inputs): Outputs {
  const km=Number(i.km)||0; const l=Number(i.l)||0;
  if (l===0) return { kml:'—', l100km:'—', mpg:'—', resumen:'Litros no puede ser 0.' };
  const kml=km/l; const l100=100/kml; const mpg=kml*2.352;
  return { kml:`${kml.toFixed(2)} km/L`, l100km:`${l100.toFixed(2)} L/100km`, mpg:`${mpg.toFixed(1)} MPG`, resumen:`${km}km con ${l}L = ${kml.toFixed(1)}km/L.` };
}
