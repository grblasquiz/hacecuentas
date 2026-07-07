export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function midjourneyStableDiffusionCreditsMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      mes: 'mes', si: 'Sí', siStealth: 'Sí + stealth',
      titUnlim: 'Generación ilimitada', titFast: 'Plan rápido, sin relax',
      txtUnlim: (pr: number, h: string) => `Por **USD ${pr}/mes** tenés **${h}**: el modo relax ilimitado te deja generar todo lo que quieras sin gastar horas fast.`,
      txtFast: (pr: number, h: string) => `El plan de **USD ${pr}/mes** trae **${h}** pero sin relax ilimitado: cuando se acaban las horas fast, pagás extra o esperás al mes siguiente.`,
    },
    en: {
      mes: 'mo', si: 'Yes', siStealth: 'Yes + stealth',
      titUnlim: 'Unlimited generation', titFast: 'Fast plan, no relax',
      txtUnlim: (pr: number, h: string) => `For **USD ${pr}/mo** you get **${h}**: unlimited relax mode lets you generate as much as you want without burning fast hours.`,
      txtFast: (pr: number, h: string) => `The **USD ${pr}/mo** plan includes **${h}** but no unlimited relax: once fast hours run out you pay extra or wait for next month.`,
    },
    pt: {
      mes: 'mês', si: 'Sim', siStealth: 'Sim + stealth',
      titUnlim: 'Geração ilimitada', titFast: 'Plano rápido, sem relax',
      txtUnlim: (pr: number, h: string) => `Por **USD ${pr}/mês** você tem **${h}**: o modo relax ilimitado permite gerar tudo o que quiser sem gastar horas fast.`,
      txtFast: (pr: number, h: string) => `O plano de **USD ${pr}/mês** traz **${h}** mas sem relax ilimitado: quando acabam as horas fast, paga extra ou espera o próximo mês.`,
    },
  } as const)[__lang];
  const p=String(i.plan||'standard');
  const data={'basic':{pr:10,h:'0 fast (200 img)',r:'No'},'standard':{pr:30,h:'15 h fast + unlimited relax',r:T.si},'pro':{pr:60,h:'30 h fast + unlimited relax',r:T.siStealth},'mega':{pr:120,h:'60 h fast',r:T.siStealth}}[p];
  const tieneRelax = data.h.indexOf('unlimited relax') !== -1;
  const _insight = tieneRelax
    ? { title: T.titUnlim, text: T.txtUnlim(data.pr, data.h), tone: 'good', icon: '🎨' }
    : { title: T.titFast, text: T.txtFast(data.pr, data.h), tone: 'neutral', icon: '⏱️' };
  return { precioMes:`USD ${data.pr}/${T.mes}`, horasFast:data.h, rolmode:data.r, _insight };
}
