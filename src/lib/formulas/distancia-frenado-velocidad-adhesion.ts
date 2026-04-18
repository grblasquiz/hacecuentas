export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function distanciaFrenadoVelocidadAdhesion(i: Inputs): Outputs {
  const vk=Number(i.v)||0; const mu=Number(i.mu)||0.7; const tr=Number(i.treac)||1;
  const v=vk/3.6;
  const dr=v*tr; const df=v*v/(2*mu*9.81);
  return { reaccion:`${dr.toFixed(1)} m`, frenado:`${df.toFixed(1)} m`, total:`${(dr+df).toFixed(1)} m`, resumen:`A ${vk}km/h: reacción ${dr.toFixed(0)}m + frenado ${df.toFixed(0)}m = ${(dr+df).toFixed(0)}m total.` };
}
