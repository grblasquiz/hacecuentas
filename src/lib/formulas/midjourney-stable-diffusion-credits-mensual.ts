export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function midjourneyStableDiffusionCreditsMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { mes: 'mes', si: 'Sí', siStealth: 'Sí + stealth' },
    en: { mes: 'mo',  si: 'Yes', siStealth: 'Yes + stealth' },
    pt: { mes: 'mês', si: 'Sim', siStealth: 'Sim + stealth' },
  } as const)[__lang];
  const p=String(i.plan||'standard');
  const data={'basic':{pr:10,h:'0 fast (200 img)',r:'No'},'standard':{pr:30,h:'15 h fast + unlimited relax',r:T.si},'pro':{pr:60,h:'30 h fast + unlimited relax',r:T.siStealth},'mega':{pr:120,h:'60 h fast',r:T.siStealth}}[p];
  return { precioMes:`USD ${data.pr}/${T.mes}`, horasFast:data.h, rolmode:data.r };
}
