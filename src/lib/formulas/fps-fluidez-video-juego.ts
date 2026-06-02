export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function fpsFluidezVideoJuego(i: Inputs): Outputs {
  const fps=Number(i.fps)||0;
  const lat=fps===0?Infinity:1000/fps;
  let q='—'; if (fps>=144) q='Competitivo'; else if (fps>=60) q='Fluido'; else if (fps>=30) q='Aceptable'; else if (fps>=24) q='Mínimo cine'; else q='Entrecortado';
  const tone: 'good'|'warn'|'neutral' = fps>=60 ? 'good' : fps>=30 ? 'neutral' : 'warn';
  const _insight = {
    title: `${fps} FPS: ${q}`,
    text: fps>=144
      ? `A **${fps} FPS** la imagen es ultrafluida (**${lat.toFixed(1)} ms/frame**), ideal para juego competitivo donde cada milisegundo cuenta.`
      : fps>=60
      ? `Con **${fps} FPS** (**${lat.toFixed(1)} ms/frame**) la experiencia es fluida y cómoda para la mayoría de los juegos.`
      : fps>=30
      ? `**${fps} FPS** (**${lat.toFixed(1)} ms/frame**) es jugable, pero se nota menos suave que 60. Si podés, apuntá a 60+.`
      : `Con sólo **${fps} FPS** (**${lat.toFixed(1)} ms/frame**) la imagen se va a sentir entrecortada. Bajá calidad o resolución para ganar fluidez.`,
    tone,
    icon: '🎮',
  };
  const _chart = fps>0 ? {
    type: 'scale',
    marker: fps,
    markerLabel: `${fps} FPS`,
    min: 0,
    segments: [
      { nombre: 'Entrecortado', max: 24, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Mínimo cine', max: 30, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Aceptable', max: 60, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Fluido', max: 144, color: '#10b981', colorDark: '#34d399' },
      { nombre: 'Competitivo', max: Math.max(240, fps+10), color: '#2563eb', colorDark: '#60a5fa' },
    ],
    ariaLabel: `Escala de fluidez: ${fps} FPS clasificado como ${q}`,
  } : undefined;
  return { latencia:`${lat.toFixed(2)} ms`, calidad:q, resumen:`${fps} FPS: ${q} (${lat.toFixed(1)} ms/frame).`, _insight, _chart };
}
