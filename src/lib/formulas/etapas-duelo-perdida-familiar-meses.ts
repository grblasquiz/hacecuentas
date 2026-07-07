export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
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
      insTitle: 'Cada duelo tiene su ritmo',
      insEsperada: 'En una pérdida esperada, el duelo suele transitarse en **6-12 meses**. No es lineal: hay días mejores y peores, y eso es normal mientras la intensidad baje con el tiempo.',
      insSubita: 'Una pérdida súbita puede extender el duelo a **12-18 meses** por el shock inicial. Si la angustia no cede o te bloquea la vida diaria, buscar apoyo profesional ayuda mucho.',
      insNinez: 'El duelo en la niñez se reelabora durante **años**, resurgiendo en cada etapa vital. Más que "superarlo", se trata de acompañar en cada hito a medida que crece.',
      insDisc: 'Son rangos orientativos, no un diagnóstico.',
    },
    en: {
      etapas: 'Denial, anger, bargaining, depression, acceptance',
      esperadaDur: '6-12 months',
      esperadaAl: 'Normal if intensity decreases over time',
      subitaDur: '12-18 months',
      subitaAl: 'Prolonged shock may require professional support',
      ninezDur: 'Years with reassessment at key life stages',
      ninezAl: 'Provide support at major milestones',
      insTitle: 'Every grief has its own pace',
      insEsperada: 'After an expected loss, grief usually unfolds over **6-12 months**. It is not linear: better and worse days are normal as long as the intensity eases over time.',
      insSubita: 'A sudden loss can stretch grief to **12-18 months** because of the initial shock. If the distress does not ease or blocks daily life, professional support helps a lot.',
      insNinez: 'Childhood grief is reworked over **years**, resurfacing at each life stage. Rather than "getting over it", it is about offering support at every milestone as the child grows.',
      insDisc: 'These are general ranges, not a diagnosis.',
    },
  } as const)[__lang];
  const t=String(i.tipoPerdida||'esperada');
  const d:Record<string,[string,string]>={esperada:[T.esperadaDur,T.esperadaAl],subita:[T.subitaDur,T.subitaAl],ninez:[T.ninezDur+'',T.ninezAl]};
  const [dur,al]=d[t]||d.esperada;
  const insMap:Record<string,string>={esperada:T.insEsperada,subita:T.insSubita,ninez:T.insNinez};
  const insBody=insMap[t]||T.insEsperada;
  return { etapas:T.etapas, duracion:dur, alerta:al, resumen:`${t}: ${dur}. ${al}.`,
    _insight: {
      title: T.insTitle,
      text: `${insBody} ${T.insDisc}`,
      tone: t==='subita' ? 'warn' : 'neutral',
      icon: '🕊️',
    } };
}
