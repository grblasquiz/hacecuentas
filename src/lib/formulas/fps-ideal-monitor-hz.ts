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
  _insight?: any;
  _chart?: any;
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

  const aprovR = Number(aprovechamiento.toFixed(1));
  const tone: 'good' | 'warn' | 'neutral' = fps >= hz ? 'good' : fps >= hz * 0.75 ? 'neutral' : 'warn';
  const _insight = {
    title: `FPS ideal: ${fpsIdeal} (= tus ${hz} Hz)`,
    text:
      fps >= hz
        ? `Tus **${fps} FPS** igualan o superan los **${hz} Hz** del monitor: lo aprovechás al **${aprovR}%**, el escenario ideal.`
        : fps >= hz * 0.75
        ? `Con **${fps} FPS** usás el **${aprovR}%** de tu monitor de **${hz} Hz**. Te faltan **${hz - fps} FPS** para el ideal: bajá un poco la calidad gráfica y los alcanzás.`
        : `Tus **${fps} FPS** sólo cubren el **${aprovR}%** de los **${hz} Hz** del monitor. Estás dejando rendimiento sin usar: conviene optimizar la config gráfica o la GPU.`,
    tone,
    icon: '🖥️',
  };
  const _chart = {
    type: 'scale',
    marker: aprovR,
    markerLabel: `${aprovR}%`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Lejos', max: 75, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Cerca', max: 99, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Ideal', max: 100, color: '#10b981', colorDark: '#34d399' },
    ],
    ariaLabel: `Aprovechamiento del monitor: ${aprovR}% de los ${hz} Hz`,
  };
  return {
    fpsIdeal,
    aprovechamiento: aprovR,
    frametimeIdeal: Number(frametimeIdeal.toFixed(2)),
    recomendacion,
    _insight,
    _chart,
  };
}
