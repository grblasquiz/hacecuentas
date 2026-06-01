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

  return {
    diasTotales: dias,
    horasTotales: Math.round(horas * 10) / 10,
    semanas,
    paginasDia: pagDia,
  };

}
