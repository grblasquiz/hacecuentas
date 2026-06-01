export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
    },
  } as const)[__lang];
  const d=Number(i.diaCiclo)||14;
  let fase='', e='', p='';
  if(d<=5){fase=T.menstrual;e=T.eBajo1;p=T.pBajo1}
  else if(d<13){fase=T.folicular;e=T.eSubiendo;p=T.pBajo2}
  else if(d<=16){fase=T.ovulatoria;e=T.ePico;p=T.pSubiendo}
  else if(d<=28){fase=T.lutea;e=T.eMedio;p=T.pPico}
  else {fase=T.fueraDeCiclo;e='N/A';p='N/A'}
  return { fase:fase, estrogenoEsperado:e, progesteronaEsperada:p };
}
