/** ¿Cuánto tarda leer un libro? */
export interface Inputs {
  [k: string]: any;
  __lang?: string;
}
export interface Outputs {
  diasTotales: number;
  horasTotales: number;
  semanas: number;
  paginasDia: number;
  _insight?: any;
}

export function tiempoLeerLibroGeneral(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const pag = Number(i.paginas) || 300;
  const min = Number(i.minutosDia) || 30;
  const gen = String(i.genero || 'ficcion');
  if (pag <= 0 || min <= 0) throw new Error(__lang === 'en' ? 'Invalid data' : 'Datos inválidos');

  const WPM: Record<string, number> = { thriller: 290, ficcion: 250, clasico: 180, ensayo: 220, academico: 160 };
  const PAL_PAG: Record<string, number> = { thriller: 260, ficcion: 275, clasico: 300, ensayo: 290, academico: 320 };

  const wpm = WPM[gen] || 250;
  const pp = PAL_PAG[gen] || 275;

  const palabras = pag * pp;
  const minTotales = palabras / wpm;
  const horas = minTotales / 60;
  const dias = Math.ceil(minTotales / min);
  const semanas = Math.round(dias / 7 * 10) / 10;
  const pagDia = Math.round(pag / dias * 10) / 10;
  const horasR = Math.round(horas * 10) / 10;

  let insightText: string; let insightTone: 'good' | 'warn' | 'neutral';
  if (__lang === 'en') {
    if (dias <= 7) {
      insightText = `Leaning in **${min} min/day** you'd finish in just **${dias} days** (about **${pagDia} pages/day**). Very doable in a week.`;
      insightTone = 'good';
    } else if (semanas >= 8) {
      insightText = `At **${min} min/day** this book stretches to **${semanas} weeks** (${dias} days, ${horasR} h total). Bump your daily time or it'll drag on.`;
      insightTone = 'warn';
    } else {
      insightText = `At **${min} min/day** you'll finish in about **${semanas} weeks** (**${dias} days**, ${pagDia} pages/day). A steady, realistic pace.`;
      insightTone = 'neutral';
    }
  } else {
    if (dias <= 7) {
      insightText = `Con **${min} min por día** lo terminás en apenas **${dias} días** (unas **${pagDia} páginas diarias**). Perfectamente factible en una semana.`;
      insightTone = 'good';
    } else if (semanas >= 8) {
      insightText = `A **${min} min por día** el libro se estira a **${semanas} semanas** (${dias} días, ${horasR} h en total). Subí tu tiempo diario o se te va a hacer eterno.`;
      insightTone = 'warn';
    } else {
      insightText = `A **${min} min por día** lo terminás en unas **${semanas} semanas** (**${dias} días**, ${pagDia} páginas diarias). Un ritmo sostenible y realista.`;
      insightTone = 'neutral';
    }
  }

  return {
    diasTotales: dias,
    horasTotales: horasR,
    semanas,
    paginasDia: pagDia,
    _insight: {
      title: __lang === 'en' ? 'Your reading plan' : 'Tu plan de lectura',
      text: insightText, tone: insightTone, icon: '📚',
    },
  };

}
