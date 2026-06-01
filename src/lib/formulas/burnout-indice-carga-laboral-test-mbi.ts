export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
    },
  } as const)[__lang];
  const ce=Number(i.cansancioEmocional)||0; const dp=Number(i.despersonalizacion)||0; const rp=Number(i.realizacionPersonal)||0;
  const burnout=(ce+dp+(10-rp))/3;
  let nivel='', interp='', rec='';
  if(burnout<4){nivel=T.bajo;interp=T.sinSignos;rec=T.mantenHabitos}
  else if(burnout<6){nivel=T.moderado;interp=T.senalesIniciales;rec=T.descanso}
  else if(burnout<8){nivel=T.alto;interp=T.burnoutClaro;rec=T.licencia}
  else {nivel=T.severo;interp=T.crisis;rec=T.intervencion}
  return { nivel:nivel, interpretacion:interp, recomendacion:rec };
}
