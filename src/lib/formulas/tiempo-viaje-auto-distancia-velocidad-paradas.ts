export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoViajeAutoDistanciaVelocidadParadas(i: Inputs): Outputs {
  const km=Number(i.km)||0; const v=Number(i.v)||80; const np=Number(i.paradas)||0; const d=Number(i.dur)||0;
  const h=km/v; const extra=np*d/60;
  const tot=h+extra;
  const hh=Math.floor(tot); const mm=Math.round((tot-hh)*60);
  return { tiempo:`${hh}h ${mm}min`, resumen:`${km}km a ${v}km/h + ${np} paradas: ${hh}h ${mm}min.` };
}
