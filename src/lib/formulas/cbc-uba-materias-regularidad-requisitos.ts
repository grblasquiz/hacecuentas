export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cbcUbaMateriasRegularidadRequisitos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      libreAsistencia: 'Libre por asistencia',
      libreParciales: 'Libre por parciales (recuperatorio disponible)',
      regular: 'Regular — rinde final',
      obsContinua: 'Continuá con final oral/escrito.',
      obsRevisa: 'Revisá tu caso con docente.',
    },
    en: {
      libreAsistencia: 'Absent — failed attendance',
      libreParciales: 'Absent — failed midterms (make-up available)',
      regular: 'Regular — must take final exam',
      obsContinua: 'Keep going and prepare for the final.',
      obsRevisa: 'Review your situation with your professor.',
    },
  } as const)[__lang];
  const a=Number(i.asistenciaPorcentaje)||0; const p1=Number(i.parcial1)||0; const p2=Number(i.parcial2)||0;
  let reg='';
  if(a<75) reg=T.libreAsistencia;
  else if(p1<4||p2<4) reg=T.libreParciales;
  else reg=T.regular;
  const prom=(p1+p2)/2;
  return { regularidad:reg, promedio:prom.toFixed(1), observacion:reg.includes('Regular')?T.obsContinua:T.obsRevisa };
}
