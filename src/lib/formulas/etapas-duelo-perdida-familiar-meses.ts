export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function etapasDueloPerdidaFamiliarMeses(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      etapas: 'Negación, ira, negociación, depresión, aceptación',
      esperadaDur: '6-12 meses',
      esperadaAl: 'Normal si intensidad decrece',
      subitaDur: '12-18 meses',
      subitaAl: 'Shock prolongado puede requerir ayuda',
      ninezDur: 'Años con reevaluación en etapas',
      ninezAl: 'Acompañar en hitos vitales',
    },
    en: {
      etapas: 'Denial, anger, bargaining, depression, acceptance',
      esperadaDur: '6-12 months',
      esperadaAl: 'Normal if intensity decreases over time',
      subitaDur: '12-18 months',
      subitaAl: 'Prolonged shock may require professional support',
      ninezDur: 'Years with reassessment at key life stages',
      ninezAl: 'Provide support at major milestones',
    },
  } as const)[__lang];
  const t=String(i.tipoPerdida||'esperada');
  const d:Record<string,[string,string]>={esperada:[T.esperadaDur,T.esperadaAl],subita:[T.subitaDur,T.subitaAl],ninez:[T.ninezDur+'',T.ninezAl]};
  const [dur,al]=d[t]||d.esperada;
  return { etapas:T.etapas, duracion:dur, alerta:al, resumen:`${t}: ${dur}. ${al}.` };
}
