export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function frecuenciaCardiacaZonasEntrenamientoKarvonen(i: Inputs): Outputs {
  const e=Number(i.edad)||30; const r=Number(i.fcReposo)||60;
  const fcMax=220-e;
  const delta=fcMax-r;
  const z=[0.5,0.6,0.7,0.8,0.9,1.0].map(p=>Math.round(r+delta*p));
  return { fcMax:fcMax+' bpm', z1:z[0]+'-'+z[1]+' bpm', z2:z[1]+'-'+z[2]+' bpm', z3:z[2]+'-'+z[3]+' bpm', z4:z[3]+'-'+z[4]+' bpm', z5:z[4]+'-'+z[5]+' bpm', resumen:`Edad ${e}, FCR ${r}: FCmax ${fcMax}, zonas calculadas Karvonen.` };
}
