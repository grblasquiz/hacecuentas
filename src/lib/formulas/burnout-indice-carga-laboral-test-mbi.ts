export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function burnoutIndiceCargaLaboralTestMbi(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      bajo: 'Bajo',
      sinSignos: 'Sin signos burnout',
      mantenHabitos: 'Mantené hábitos saludables',
      moderado: 'Moderado',
      senalesIniciales: 'Señales iniciales',
      descanso: 'Descanso + asesoría. Establecer límites laborales.',
      alto: 'Alto',
      burnoutClaro: 'Burnout claro',
      licencia: 'Licencia preventiva + tratamiento psicológico',
      severo: 'Severo',
      crisis: 'Crisis',
      intervencion: 'Intervención urgente. No trabajar hasta estabilizar.',
      insightTitle: 'Tu índice de burnout',
      insightPre: 'Tu índice combinado da',
      insightPost: 'de 10',
      nivelLbl: 'nivel',
      zonaBaja: 'Baja',
      zonaModerada: 'Moderada',
      zonaAlta: 'Alta',
      zonaSevera: 'Severa',
      ariaChart: 'Índice de burnout en una escala de 0 a 10 con zonas baja, moderada, alta y severa',
    },
    en: {
      bajo: 'Low',
      sinSignos: 'No burnout signs',
      mantenHabitos: 'Maintain healthy habits',
      moderado: 'Moderate',
      senalesIniciales: 'Early warning signs',
      descanso: 'Rest + counseling. Set work boundaries.',
      alto: 'High',
      burnoutClaro: 'Clear burnout',
      licencia: 'Preventive leave + psychological treatment',
      severo: 'Severe',
      crisis: 'Crisis',
      intervencion: 'Urgent intervention. Do not work until stabilized.',
      insightTitle: 'Your burnout index',
      insightPre: 'Your combined index is',
      insightPost: 'out of 10',
      nivelLbl: 'level',
      zonaBaja: 'Low',
      zonaModerada: 'Moderate',
      zonaAlta: 'High',
      zonaSevera: 'Severe',
      ariaChart: 'Burnout index on a 0 to 10 scale with low, moderate, high and severe zones',
    },
  } as const)[__lang];
  const ce=Number(i.cansancioEmocional)||0; const dp=Number(i.despersonalizacion)||0; const rp=Number(i.realizacionPersonal)||0;
  const burnout=(ce+dp+(10-rp))/3;
  let nivel='', interp='', rec='';
  if(burnout<4){nivel=T.bajo;interp=T.sinSignos;rec=T.mantenHabitos}
  else if(burnout<6){nivel=T.moderado;interp=T.senalesIniciales;rec=T.descanso}
  else if(burnout<8){nivel=T.alto;interp=T.burnoutClaro;rec=T.licencia}
  else {nivel=T.severo;interp=T.crisis;rec=T.intervencion}
  const idx = Math.round(burnout*10)/10;
  const _insight = {
    title: T.insightTitle,
    text: `${T.insightPre} **${idx}** ${T.insightPost} → ${T.nivelLbl} **${nivel}**. ${interp}.`,
    tone: burnout < 4 ? 'good' : burnout < 6 ? 'neutral' : 'warn',
    icon: burnout < 4 ? '🟢' : burnout < 6 ? '🟡' : burnout < 8 ? '🟠' : '🔴',
  };
  const _chart = {
    type: 'scale',
    marker: idx,
    markerLabel: `${idx}`,
    min: 0,
    segments: [
      { nombre: T.zonaBaja, max: 4, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: T.zonaModerada, max: 6, color: '#eab308', colorDark: '#ca8a04' },
      { nombre: T.zonaAlta, max: 8, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: T.zonaSevera, max: 10, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: T.ariaChart,
  };
  return { nivel:nivel, interpretacion:interp, recomendacion:rec, _insight, _chart };
}
