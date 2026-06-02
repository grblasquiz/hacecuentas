/** Calculadora de Tiempo de Lectura de Libro */
export interface Inputs { paginas: number; palabrasPagina: number; velocidadLectura: number; minutosDia: number; }
export interface Outputs { horasTotal: number; diasCompletar: number; paginasHora: number; librosAnio: number; _insight?: any; }

export function lecturaTiempoLibro(i: Inputs): Outputs {
  const pags = Number(i.paginas);
  const wpp = Number(i.palabrasPagina);
  const wpm = Number(i.velocidadLectura);
  const mpd = Number(i.minutosDia);
  if (!pags || pags < 1) throw new Error('Ingresá las páginas');
  if (!wpp || wpp < 1) throw new Error('Ingresá palabras por página');
  if (!wpm || wpm < 1) throw new Error('Ingresá velocidad de lectura');
  if (!mpd || mpd < 1) throw new Error('Ingresá minutos por día');

  const totalWords = pags * wpp;
  const totalMin = totalWords / wpm;
  const horasTotal = totalMin / 60;
  const diasCompletar = Math.ceil(totalMin / mpd);
  const paginasHora = Math.round(60 / (wpp / wpm));
  const librosAnio = Math.floor(365 / diasCompletar);

  return {
    horasTotal: Number(horasTotal.toFixed(1)),
    diasCompletar,
    paginasHora,
    librosAnio,
    _insight: {
      title: 'Tu plan de lectura',
      text: `A **${wpm} palabras por minuto** y **${mpd} min/día**, terminás este libro en **${diasCompletar} días** (unas **${horasTotal.toFixed(1)} horas** de lectura). A ese ritmo leerías **${librosAnio} libros** de este tamaño en un año.`,
      tone: 'neutral',
      icon: '📖',
    },
  };
}
