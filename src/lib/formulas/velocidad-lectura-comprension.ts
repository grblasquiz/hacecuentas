/** Calculadora Velocidad de Lectura — WPM */
export interface Inputs { palabras: number; minutos: number; palabrasTexto?: number; }
export interface Outputs { wpm: number; nivel: string; tiempoEstimado: string; comparacion: string; }

export function velocidadLecturaComprension(i: Inputs): Outputs {
  const pal = Number(i.palabras);
  const min = Number(i.minutos);
  if (pal <= 0) throw new Error('Las palabras deben ser mayor a 0');
  if (min <= 0) throw new Error('El tiempo debe ser mayor a 0');

  const wpm = pal / min;
  let nivel: string;
  if (wpm < 150) nivel = 'Por debajo del promedio (< 150 WPM)';
  else if (wpm < 250) nivel = 'Promedio (150-250 WPM)';
  else if (wpm < 400) nivel = 'Por encima del promedio (250-400 WPM)';
  else if (wpm < 600) nivel = 'Lector rápido (400-600 WPM)';
  else nivel = 'Speed reader (600+ WPM)';

  let tiempoEst: string;
  const palTexto = i.palabrasTexto && Number(i.palabrasTexto) > 0 ? Number(i.palabrasTexto) : 0;
  if (palTexto > 0) {
    const minTexto = palTexto / wpm;
    if (minTexto < 60) tiempoEst = `${minTexto.toFixed(0)} minutos para ${palTexto.toLocaleString()} palabras`;
    else tiempoEst = `${(minTexto / 60).toFixed(1)} horas para ${palTexto.toLocaleString()} palabras`;
  } else {
    tiempoEst = 'Ingresá las palabras del texto para estimar el tiempo';
  }

  const promedioAdulto = 230;
  const diff = ((wpm / promedioAdulto) * 100 - 100);

  return {
    wpm: Number(wpm.toFixed(0)),
    nivel,
    tiempoEstimado: tiempoEst,
    comparacion: `${diff >= 0 ? '+' : ''}${diff.toFixed(0)}% vs promedio adulto (230 WPM)`,
  };
}
