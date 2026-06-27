/** How long to read a book. Days = (pages × words/page) ÷ (WPM × min/day). */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; }

// Reading speed (WPM) and word density (words/page) by genre — matches the
// reference table shown on the page.
const GENRE: Record<string, { wpm: number; wpp: number }> = {
  ficcion: { wpm: 250, wpp: 275 },
  thriller: { wpm: 290, wpp: 260 },
  clasico: { wpm: 180, wpp: 300 },
  ensayo: { wpm: 220, wpp: 290 },
  academico: { wpm: 160, wpp: 320 },
};

export function tiempoLeerLibroGeneral(i: Inputs): Outputs {
  const paginas = Number(i.paginas) || 0;
  const minutosDia = Number(i.minutosDia) || 0;
  const genero = String(i.genero || 'ficcion');
  const g = GENRE[genero] || GENRE.ficcion;

  const totalWords = paginas * g.wpp;
  const totalMinutes = totalWords / g.wpm;
  const diasTotales = minutosDia > 0 ? Math.ceil(totalMinutes / minutosDia) : 0;
  const horasTotales = totalMinutes / 60;
  const semanas = diasTotales / 7;
  const paginasDia = diasTotales > 0 ? paginas / diasTotales : 0;

  return {
    diasTotales,
    horasTotales: Number(horasTotales.toFixed(1)),
    semanas: Number(semanas.toFixed(1)),
    paginasDia: Number(paginasDia.toFixed(1)),
  };
}
