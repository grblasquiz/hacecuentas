/** Calculadora Velocidad de Lectura — WPM */
export interface Inputs { palabras: number; minutos: number; palabrasTexto?: number; }
export interface Outputs { wpm: number; nivel: string; tiempoEstimado: string; comparacion: string; _insight?: any; _chart?: any; }

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
  const wpmR = Math.round(wpm);

  const tone: 'good' | 'warn' | 'neutral' = wpm < 150 ? 'warn' : wpm < 250 ? 'neutral' : 'good';
  const comparaTxt = diff >= 0
    ? `un **${diff.toFixed(0)}% más rápido** que el promedio adulto (230 WPM)`
    : `un **${Math.abs(diff).toFixed(0)}% por debajo** del promedio adulto (230 WPM)`;

  return {
    wpm: wpmR,
    nivel,
    tiempoEstimado: tiempoEst,
    comparacion: `${diff >= 0 ? '+' : ''}${diff.toFixed(0)}% vs promedio adulto (230 WPM)`,
    _insight: {
      title: 'Tu velocidad de lectura',
      text: `Leés a **${wpmR} WPM** (${nivel.toLowerCase()}), ${comparaTxt}. Con práctica de lectura activa podés ganar entre 50 y 100 WPM sin perder comprensión.`,
      tone,
      icon: '📖',
    },
    _chart: {
      type: 'scale',
      marker: wpmR,
      markerLabel: `${wpmR} WPM`,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: 150, color: '#fca5a5', colorDark: '#ef4444' },
        { nombre: 'Promedio', max: 250, color: '#fde047', colorDark: '#eab308' },
        { nombre: 'Sobre la media', max: 400, color: '#86efac', colorDark: '#22c55e' },
        { nombre: 'Rápido', max: 600, color: '#7dd3fc', colorDark: '#0ea5e9' },
        { nombre: 'Speed reader', max: Math.max(800, Math.ceil(wpmR + 50)), color: '#c4b5fd', colorDark: '#8b5cf6' },
      ],
      ariaLabel: `Velocidad de lectura de ${wpmR} palabras por minuto: ${nivel}`,
    },
  };
}
