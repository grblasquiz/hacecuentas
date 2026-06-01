export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function lecturaVelocidadPaginasHoraWpm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      muyRapida: 'Muy rápida',
      rapida: 'Rápida',
      promedio: 'Promedio',
      lenta: 'Lenta',
      recMuyRapida: 'Excelente. Verifica comprensión.',
      recRapida: 'Muy buena.',
      recPromedio: 'Intenta sin subvocalizar.',
      recLenta: 'Practica: RSVP apps, Spreeder, lectura en chunks.',
    },
    en: {
      muyRapida: 'Very fast',
      rapida: 'Fast',
      promedio: 'Average',
      lenta: 'Slow',
      recMuyRapida: 'Excellent. Double-check your comprehension.',
      recRapida: 'Very good.',
      recPromedio: 'Try reading without subvocalizing.',
      recLenta: 'Practice: RSVP apps, Spreeder, chunked reading.',
    },
  } as const)[__lang];
  const p=Number(i.palabras)||0; const t=Number(i.tiempoMinutos)||1;
  const wpm=p/t;
  let clas='', rec='';
  if(wpm>=500){clas=T.muyRapida;rec=T.recMuyRapida;}
  else if(wpm>=300){clas=T.rapida;rec=T.recRapida;}
  else if(wpm>=200){clas=T.promedio;rec=T.recPromedio;}
  else {clas=T.lenta;rec=T.recLenta;}
  return { wpm:`${Math.round(wpm)} WPM`, clasificacion:clas, recomendacion:rec };
}
