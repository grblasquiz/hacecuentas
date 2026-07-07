export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function clasesSemanalesItalkiOnlineFrecuencia(i: Inputs): Outputs {
  const m=String(i.meta||'manten');
  const p:Record<string,[string,string]>={manten:['1','60 min'],mejora:['2-3','60 min'],intensivo:['5-7','60 min']};
  const [cl,du]=p[m]||p.manten;
  const metaLabel:Record<string,string>={manten:'mantener el nivel',mejora:'mejorar de forma progresiva',intensivo:'avanzar rápido (intensivo)'};
  const tip:Record<string,string>={
    manten:'Con esta frecuencia conservás fluidez sin presión; sumá práctica de consumo (podcasts, series) entre clases.',
    mejora:'Es el ritmo con mejor relación esfuerzo/avance: deja días para repasar y hacer la tarea entre sesiones.',
    intensivo:'Ritmo exigente y caro: reservalo para una meta con fecha (examen, mudanza) porque el desgaste y el costo mensual suben fuerte.',
  };
  const _insight = {
    title: 'Frecuencia recomendada',
    text: `Para **${metaLabel[m]??m}**, apuntá a **${cl} clase${cl==='1'?'':'s'} por semana** de **${du}**. ${tip[m]??tip.manten}`,
    tone: m==='intensivo'?'warn':(m==='mejora'?'good':'neutral'),
    icon: '🗣️',
  };
  return { clases:cl, duracion:du, resumen:`Meta ${m}: ${cl} clases/sem × ${du}.`, _insight };
}
