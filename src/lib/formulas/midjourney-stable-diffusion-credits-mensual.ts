export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function midjourneyStableDiffusionCreditsMensual(i: Inputs): Outputs {
  const p=String(i.plan||'standard');
  const data={'basic':{pr:10,h:'0 fast (200 img)',r:'No'},'standard':{pr:30,h:'15 h fast + unlimited relax',r:'Sí'},'pro':{pr:60,h:'30 h fast + unlimited relax',r:'Sí + stealth'},'mega':{pr:120,h:'60 h fast',r:'Sí + stealth'}}[p];
  return { precioMes:`USD ${data.pr}/mes`, horasFast:data.h, rolmode:data.r };
}
