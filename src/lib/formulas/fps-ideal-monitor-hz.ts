/** Calculadora de FPS Ideal según Hz del Monitor */
export interface Inputs {
  hzMonitor: number;
  fpsActuales: number;
  tieneSync: string;
}
export interface Outputs {
  fpsIdeal: number;
  aprovechamiento: number;
  frametimeIdeal: number;
  recomendacion: string;
}

export function fpsIdealMonitorHz(i: Inputs): Outputs {
  const hz = Number(i.hzMonitor);
  const fps = Number(i.fpsActuales);
  if (!hz || hz <= 0) throw new Error('Ingresá los Hz del monitor');
  if (!fps || fps <= 0) throw new Error('Ingresá los FPS actuales');

  const fpsIdeal = hz; // Ideal = match Hz
  const aprovechamiento = Math.min((fps / hz) * 100, 100);
  const frametimeIdeal = 1000 / hz;
  const tieneSync = i.tieneSync === 'si';

  let recomendacion: string;
  if (fps >= hz) {
    recomendacion = `Tus ${fps} FPS aprovechan al 100% tu monitor de ${hz} Hz. `;
    if (tieneSync) {
      recomendacion += 'Con adaptive sync activo, la experiencia es óptima.';
    } else {
      recomendacion += 'Activá V-Sync o considerá un monitor con G-Sync/FreeSync para evitar tearing.';
    }
  } else if (fps >= hz * 0.75) {
    recomendacion = `Estás cerca del ideal. Te faltan ${hz - fps} FPS. Bajá calidad gráfica o resolución para alcanzar ${hz} FPS.`;
    if (tieneSync) recomendacion += ' Con adaptive sync activado, la experiencia será fluida.';
  } else {
    recomendacion = `Tu PC solo genera el ${aprovechamiento.toFixed(0)}% de los frames necesarios. Necesitás mejorar la GPU o bajar la configuración gráfica significativamente.`;
    if (!tieneSync) recomendacion += ' Un monitor con FreeSync/G-Sync ayudaría a suavizar la imagen.';
  }

  return {
    fpsIdeal,
    aprovechamiento: Number(aprovechamiento.toFixed(1)),
    frametimeIdeal: Number(frametimeIdeal.toFixed(2)),
    recomendacion,
  };
}
