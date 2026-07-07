export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function pilatesReformerFrecuenciaIdealSemana(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const o=String(i.objetivo||'tonificar');
  const T = ({
    es: {
      f: {'mantenimiento':'2x/semana','tonificar':'3-4x/semana','postura':'2-3x/semana','lesion':'2-3x/semana (con profesional)','postparto':'2x/semana (desde semana 6-8)'},
      r: {'mantenimiento':'Conservar','tonificar':'Tono en 8-12 sesiones','postura':'Alineación en 4-6 semanas','lesion':'Recuperación progresiva','postparto':'Recuperación core'},
      objLabel: {'mantenimiento':'mantener tu estado físico','tonificar':'tonificar','postura':'mejorar la postura','lesion':'recuperarte de una lesión','postparto':'recuperación postparto'},
      insTitle: 'Tu plan de Reformer',
      ins: (obj: string, f: string, s: string, r: string) => `Para **${obj}**, lo ideal es entrenar **${f}** en sesiones de **${s}**. Meta esperable: ${r.toLowerCase()}. La constancia importa más que la intensidad: respetá los días de recuperación.`,
    },
    en: {
      f: {'mantenimiento':'2x/week','tonificar':'3-4x/week','postura':'2-3x/week','lesion':'2-3x/week (with a professional)','postparto':'2x/week (from week 6-8)'},
      r: {'mantenimiento':'Maintain fitness','tonificar':'Tone in 8-12 sessions','postura':'Alignment in 4-6 weeks','lesion':'Progressive recovery','postparto':'Core recovery'},
      objLabel: {'mantenimiento':'maintain your fitness','tonificar':'tone up','postura':'improve posture','lesion':'recover from an injury','postparto':'postpartum recovery'},
      insTitle: 'Your Reformer plan',
      ins: (obj: string, f: string, s: string, r: string) => `To **${obj}**, the ideal is training **${f}** in sessions of **${s}**. Expected outcome: ${r.toLowerCase()}. Consistency matters more than intensity: respect your recovery days.`,
    },
  } as const)[__lang];
  const f=T.f[o as keyof typeof T.f];
  const s={'mantenimiento':'45-60 min','tonificar':'60 min','postura':'30-45 min','lesion':'30-45 min','postparto':'30-45 min'}[o];
  const r=T.r[o as keyof typeof T.r];
  const objTxt=T.objLabel[o as keyof typeof T.objLabel];
  const _insight = {
    title: T.insTitle,
    text: T.ins(objTxt, f, s, r),
    tone: 'neutral',
    icon: '🤸',
  };
  return { frecuencia:f, sesionMin:s, resultados:r, _insight };
}
