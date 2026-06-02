export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
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
      insightTitle: 'Tu velocidad de lectura',
      insightText: (wpm:number, clas:string)=>`Leés a **${wpm} palabras por minuto**, lo que te ubica en el rango **${clas.toLowerCase()}**. El adulto promedio ronda las 200-300 WPM.`,
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
      insightTitle: 'Your reading speed',
      insightText: (wpm:number, clas:string)=>`You read at **${wpm} words per minute**, which places you in the **${clas.toLowerCase()}** range. The average adult reads around 200-300 WPM.`,
    },
  } as const)[__lang];
  const p=Number(i.palabras)||0; const t=Number(i.tiempoMinutos)||1;
  const wpm=p/t;
  let clas='', rec='', tone='neutral';
  if(wpm>=500){clas=T.muyRapida;rec=T.recMuyRapida;tone='good';}
  else if(wpm>=300){clas=T.rapida;rec=T.recRapida;tone='good';}
  else if(wpm>=200){clas=T.promedio;rec=T.recPromedio;tone='neutral';}
  else {clas=T.lenta;rec=T.recLenta;tone='warn';}
  const wpmR=Math.round(wpm);
  const topMax=Math.max(700, wpmR+1);
  return {
    wpm:`${wpmR} WPM`,
    clasificacion:clas,
    recomendacion:rec,
    _insight: {
      title: T.insightTitle,
      text: T.insightText(wpmR, clas),
      tone,
      icon: '📚',
    },
    _chart: {
      type: 'scale',
      marker: wpmR,
      markerLabel: `${wpmR} WPM`,
      min: 0,
      segments: [
        { nombre: T.lenta, max: 200, color: '#f97316', colorDark: '#fb923c' },
        { nombre: T.promedio, max: 300, color: '#eab308', colorDark: '#facc15' },
        { nombre: T.rapida, max: 500, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: T.muyRapida, max: topMax, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `${wpmR} palabras por minuto, rango ${clas.toLowerCase()}.`,
    },
  };
}
