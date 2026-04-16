/** Calculadora de velocidad de lectura (WPM) */
export interface Inputs {
  palabrasLeidas: number;
  tiempoSegundos: number;
}
export interface Outputs {
  wpm: number;
  nivel: string;
  percentil: string;
  paginasPorHora: number;
  tiempoLibro200pag: number;
  mensaje: string;
}

export function velocidadLecturaWpm(i: Inputs): Outputs {
  const palabras = Number(i.palabrasLeidas);
  const segundos = Number(i.tiempoSegundos);

  if (!palabras || palabras <= 0) throw new Error('Ingresá la cantidad de palabras leídas');
  if (!segundos || segundos <= 0) throw new Error('Ingresá el tiempo en segundos');

  const minutos = segundos / 60;
  const wpm = palabras / minutos;

  // Clasificación
  let nivel: string;
  let percentil: string;
  if (wpm < 150) { nivel = 'Lento'; percentil = 'Debajo del promedio'; }
  else if (wpm < 200) { nivel = 'Debajo del promedio'; percentil = 'Percentil 25'; }
  else if (wpm < 250) { nivel = 'Promedio'; percentil = 'Percentil 50'; }
  else if (wpm < 350) { nivel = 'Encima del promedio'; percentil = 'Percentil 75'; }
  else if (wpm < 500) { nivel = 'Rápido'; percentil = 'Percentil 90'; }
  else if (wpm < 800) { nivel = 'Muy rápido'; percentil = 'Percentil 95'; }
  else { nivel = 'Speed reader'; percentil = 'Percentil 99'; }

  // Páginas por hora (~250 palabras por página)
  const paginasPorHora = (wpm * 60) / 250;

  // Tiempo para un libro de 200 páginas
  const tiempoLibro200pag = (200 * 250) / wpm; // en minutos

  return {
    wpm: Math.round(wpm),
    nivel,
    percentil,
    paginasPorHora: Math.round(paginasPorHora),
    tiempoLibro200pag: Math.round(tiempoLibro200pag),
    mensaje: `Velocidad: ${Math.round(wpm)} PPM (${nivel}). Leés ~${Math.round(paginasPorHora)} páginas/hora. Un libro de 200 págs: ~${Math.round(tiempoLibro200pag)} minutos.`,
  };
}
