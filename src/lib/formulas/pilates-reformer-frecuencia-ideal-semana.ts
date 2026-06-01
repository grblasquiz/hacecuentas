export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function pilatesReformerFrecuenciaIdealSemana(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const o=String(i.objetivo||'tonificar');
  const T = ({
    es: {
      f: {'mantenimiento':'2x/semana','tonificar':'3-4x/semana','postura':'2-3x/semana','lesion':'2-3x/semana (con profesional)','postparto':'2x/semana (desde semana 6-8)'},
      r: {'mantenimiento':'Conservar','tonificar':'Tono en 8-12 sesiones','postura':'Alineación en 4-6 semanas','lesion':'Recuperación progresiva','postparto':'Recuperación core'},
    },
    en: {
      f: {'mantenimiento':'2x/week','tonificar':'3-4x/week','postura':'2-3x/week','lesion':'2-3x/week (with a professional)','postparto':'2x/week (from week 6-8)'},
      r: {'mantenimiento':'Maintain fitness','tonificar':'Tone in 8-12 sessions','postura':'Alignment in 4-6 weeks','lesion':'Progressive recovery','postparto':'Core recovery'},
    },
  } as const)[__lang];
  const f=T.f[o as keyof typeof T.f];
  const s={'mantenimiento':'45-60 min','tonificar':'60 min','postura':'30-45 min','lesion':'30-45 min','postparto':'30-45 min'}[o];
  const r=T.r[o as keyof typeof T.r];
  return { frecuencia:f, sesionMin:s, resultados:r };
}
