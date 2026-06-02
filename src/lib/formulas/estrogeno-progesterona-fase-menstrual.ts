export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function estrogenoProgesteronaFaseMenstrual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      menstrual: 'Menstrual',
      folicular: 'Folicular',
      ovulatoria: 'Ovulatoria',
      lutea: 'Lútea',
      fueraDeCiclo: 'Fuera de ciclo',
      eBajo1: 'Bajo (30-80 pg/mL)',
      pBajo1: 'Bajo (<1 ng/mL)',
      eSubiendo: 'Subiendo (80-300)',
      pBajo2: 'Bajo (<1)',
      ePico: 'Pico (200-400)',
      pSubiendo: 'Subiendo (1-3)',
      eMedio: 'Medio (100-250)',
      pPico: 'Pico (5-20) día 21',
      insTitle: 'Qué pasa en tu cuerpo',
      insMenstrual: 'Estás en la **fase menstrual** (día {d}): ambas hormonas están bajas, por eso suele haber más cansancio y menos energía.',
      insFolicular: 'Estás en la **fase folicular** (día {d}): el estrógeno sube y suele subir el ánimo y la energía rumbo a la ovulación.',
      insOvulatoria: 'Estás en la **fase ovulatoria** (día {d}): el estrógeno está en su **pico** y es la ventana de mayor fertilidad del ciclo.',
      insLutea: 'Estás en la **fase lútea** (día {d}): la progesterona domina y, hacia el final, pueden aparecer síntomas premenstruales.',
      insFuera: 'El día **{d}** queda fuera de un ciclo típico de 28 días: revisá la duración real de tu ciclo para una lectura más precisa.',
      insDisc: 'Son rangos de referencia, no un análisis de sangre.',
    },
    en: {
      menstrual: 'Menstrual',
      folicular: 'Follicular',
      ovulatoria: 'Ovulatory',
      lutea: 'Luteal',
      fueraDeCiclo: 'Out of cycle',
      eBajo1: 'Low (30-80 pg/mL)',
      pBajo1: 'Low (<1 ng/mL)',
      eSubiendo: 'Rising (80-300)',
      pBajo2: 'Low (<1)',
      ePico: 'Peak (200-400)',
      pSubiendo: 'Rising (1-3)',
      eMedio: 'Mid (100-250)',
      pPico: 'Peak (5-20) day 21',
      insTitle: 'What is happening in your body',
      insMenstrual: 'You are in the **menstrual phase** (day {d}): both hormones are low, which often brings more fatigue and less energy.',
      insFolicular: 'You are in the **follicular phase** (day {d}): estrogen is rising, usually lifting mood and energy toward ovulation.',
      insOvulatoria: 'You are in the **ovulatory phase** (day {d}): estrogen is at its **peak** and this is the most fertile window of the cycle.',
      insLutea: 'You are in the **luteal phase** (day {d}): progesterone dominates and premenstrual symptoms may appear toward the end.',
      insFuera: 'Day **{d}** falls outside a typical 28-day cycle: check your real cycle length for a more accurate reading.',
      insDisc: 'These are reference ranges, not a blood test.',
    },
  } as const)[__lang];
  const d=Number(i.diaCiclo)||14;
  let fase='', e='', p='', insBody='', tone='neutral';
  if(d<=5){fase=T.menstrual;e=T.eBajo1;p=T.pBajo1;insBody=T.insMenstrual}
  else if(d<13){fase=T.folicular;e=T.eSubiendo;p=T.pBajo2;insBody=T.insFolicular;tone='good'}
  else if(d<=16){fase=T.ovulatoria;e=T.ePico;p=T.pSubiendo;insBody=T.insOvulatoria;tone='good'}
  else if(d<=28){fase=T.lutea;e=T.eMedio;p=T.pPico;insBody=T.insLutea}
  else {fase=T.fueraDeCiclo;e='N/A';p='N/A';insBody=T.insFuera;tone='warn'}
  return { fase:fase, estrogenoEsperado:e, progesteronaEsperada:p,
    _insight: {
      title: T.insTitle,
      text: `${insBody.replace('{d}', String(d))} ${T.insDisc}`,
      tone,
      icon: '🩸',
    } };
}
