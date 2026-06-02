export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function paceNatacion100mRitmo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      avanzado: 'Avanzado',
      intermedio: 'Intermedio',
      principiante: 'Principiante',
      ariaLabel: 'Escala de pace de natación por nivel (segundos por 100m)',
      insTitle: 'Tu ritmo en la pileta',
      insIcon: '🏊',
      insText: (pace: string, clas: string, vel: string) => `Nadás a **${pace}**, lo que te ubica en nivel **${clas}** (a una velocidad de **${vel}**). Para bajar el pace, enfocá la técnica de brazada y la patada antes que la fuerza.`,
    },
    en: {
      avanzado: 'Advanced',
      intermedio: 'Intermediate',
      principiante: 'Beginner',
      ariaLabel: 'Swimming pace scale by level (seconds per 100m)',
      insTitle: 'Your pace in the pool',
      insIcon: '🏊',
      insText: (pace: string, clas: string, vel: string) => `You swim at **${pace}**, which puts you at **${clas}** level (a speed of **${vel}**). To lower your pace, focus on stroke and kick technique before raw power.`,
    },
    pt: {
      avanzado: 'Avançado',
      intermedio: 'Intermediário',
      principiante: 'Iniciante',
      ariaLabel: 'Escala de pace de natação por nível (segundos por 100m)',
      insTitle: 'Seu ritmo na piscina',
      insIcon: '🏊',
      insText: (pace: string, clas: string, vel: string) => `Você nada a **${pace}**, o que te coloca no nível **${clas}** (a uma velocidade de **${vel}**). Para baixar o pace, foque na técnica de braçada e pernada antes da força.`,
    },
  } as const)[__lang];
  const d=Number(i.distanciaM)||0; const t=Number(i.tiempoMinutos)||0;
  const paceSegPor100=d>0?(t*60/d*100):0;
  const min=Math.floor(paceSegPor100/60); const seg=Math.round(paceSegPor100%60);
  const v=d/(t*60);
  let clas='';
  if(paceSegPor100<65) clas='Elite';
  else if(paceSegPor100<90) clas=T.avanzado;
  else if(paceSegPor100<120) clas=T.intermedio;
  else clas=T.principiante;
  const markerSeg=Math.round(paceSegPor100);
  const markerLabel=__lang==='en'
    ?`Your pace: ${min}:${String(seg).padStart(2,'0')}/100m`
    :__lang==='pt'
    ?`Seu pace: ${min}:${String(seg).padStart(2,'0')}/100m`
    :`Tu pace: ${min}:${String(seg).padStart(2,'0')}/100m`;
  const chart={
    type:'scale' as const,
    marker:markerSeg,
    markerLabel,
    min:45,
    unit:'s',
    segments:[
      { nombre:'Elite', max:65, color:'#bbf7d0', colorDark:'#166534' },
      { nombre:T.avanzado, max:90, color:'#fef9c3', colorDark:'#854d0e' },
      { nombre:T.intermedio, max:120, color:'#fed7aa', colorDark:'#9a3412' },
      { nombre:T.principiante, max:Math.max(160,markerSeg+10), color:'#fecaca', colorDark:'#b91c1c' },
    ],
    ariaLabel:T.ariaLabel,
  };
  const paceStr=`${min}:${String(seg).padStart(2,'0')}/100m`;
  const velStr=`${v.toFixed(2)} m/s`;
  const insight={
    title:T.insTitle,
    text:T.insText(paceStr,clas,velStr),
    tone: paceSegPor100<90 ? 'good' : 'neutral',
    icon:T.insIcon,
  };
  return { pace:paceStr, velocidadMs:velStr, clasificacion:clas, _chart:chart, _insight:insight };
}
