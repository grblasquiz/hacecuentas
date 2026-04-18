export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function emisionesCo2AutoGKmAnual(i: Inputs): Outputs {
  const km=Number(i.km)||0; const r=Number(i.rend)||12;
  const l=km/r; const co2=l*2.31;
  return { litros:`${l.toFixed(0)} L`, co2:`${co2.toFixed(0)} kg CO2`, arboles:`${(co2/22).toFixed(0)} árboles`, resumen:`${km}km/año emite ${co2.toFixed(0)} kg CO2 (~${(co2/22).toFixed(0)} árboles/año para absorber).` };
}
