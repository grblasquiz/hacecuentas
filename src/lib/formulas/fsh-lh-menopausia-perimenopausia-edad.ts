export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fshLhMenopausiaPerimenopausiaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      etapa1: 'Menopausia establecida',
      interp1: 'FSH elevada sostenida',
      rec1: 'Terapia síntomas si aplican',
      etapa2: 'Perimenopausia',
      interp2: 'Transición hormonal',
      rec2: 'Control ginecológico, evaluar síntomas',
      etapa3: 'Pre-menopausia normal',
      interp3: 'Función ovárica normal',
      rec3: 'Controles de rutina',
      etapa4: 'Variable',
      interp4: 'Interpretación según contexto clínico',
      rec4: 'Consultar ginecólogo',
      insTitle: 'Lectura hormonal',
      ins1: (f: number, e: number) => `Con **FSH ${f} mUI/mL** a los **${e} años**, el patrón es compatible con **menopausia establecida**. Este valor por sí solo no reemplaza la evaluación clínica.`,
      ins2: (f: number) => `Una **FSH de ${f} mUI/mL** en rango de transición sugiere **perimenopausia**: los ciclos pueden volverse irregulares. Conviene control ginecológico.`,
      ins3: (f: number) => `Con **FSH ${f} mUI/mL** la **función ovárica luce normal**. Es un valor esperable fuera de la transición menopáusica.`,
      ins4: (f: number) => `Una **FSH de ${f} mUI/mL** cae en zona intermedia: la interpretación depende del momento del ciclo y la clínica. Mejor consultarlo con tu ginecólogo.`,
    },
    en: {
      etapa1: 'Established menopause',
      interp1: 'Sustained elevated FSH',
      rec1: 'Symptom therapy if applicable',
      etapa2: 'Perimenopause',
      interp2: 'Hormonal transition',
      rec2: 'Gynecological follow-up, evaluate symptoms',
      etapa3: 'Normal pre-menopause',
      interp3: 'Normal ovarian function',
      rec3: 'Routine check-ups',
      etapa4: 'Variable',
      interp4: 'Interpretation based on clinical context',
      rec4: 'Consult a gynecologist',
      insTitle: 'Hormonal reading',
      ins1: (f: number, e: number) => `With **FSH ${f} mIU/mL** at **${e} years old**, the pattern is consistent with **established menopause**. This value alone does not replace clinical evaluation.`,
      ins2: (f: number) => `An **FSH of ${f} mIU/mL** in the transition range suggests **perimenopause**: cycles may become irregular. Gynecological follow-up is advisable.`,
      ins3: (f: number) => `With **FSH ${f} mIU/mL**, **ovarian function looks normal**. It is an expected value outside the menopausal transition.`,
      ins4: (f: number) => `An **FSH of ${f} mIU/mL** falls in an intermediate zone: interpretation depends on the cycle phase and symptoms. Best to discuss it with your gynecologist.`,
    },
  } as const)[__lang];
  const f=Number(i.fsh)||0; const l=Number(i.lh)||0; const e=Number(i.edad)||0;
  let etapa='', interp='', rec='', insText='', tone: 'good'|'warn'|'neutral'='neutral';
  if(f>=30&&e>=45){etapa=T.etapa1;interp=T.interp1;rec=T.rec1;insText=T.ins1(f,e);tone='warn'}
  else if(f>=15&&f<30){etapa=T.etapa2;interp=T.interp2;rec=T.rec2;insText=T.ins2(f);tone='warn'}
  else if(f<10){etapa=T.etapa3;interp=T.interp3;rec=T.rec3;insText=T.ins3(f);tone='good'}
  else {etapa=T.etapa4;interp=T.interp4;rec=T.rec4;insText=T.ins4(f);tone='neutral'}
  return {
    etapa:etapa, interpretacion:interp, recomendacion:rec,
    _insight: { title: T.insTitle, text: insText, tone, icon: '🩺' },
  };
}
