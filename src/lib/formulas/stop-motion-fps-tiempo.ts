/**
 * Calculadora de stop motion por FPS y duración
 */

export interface Inputs {
  duracion: number; fps: number; minPorFoto: number; mbPorFoto: number;
}

export interface Outputs {
  totalFotos: string; tiempoAnimacion: string; espacioDisco: string; fluidez: string; _insight?: any; _chart?: any;
}

export function stopMotionFpsTiempo(inputs: Inputs): Outputs {
  const dur = Number(inputs.duracion);
  const fps = Number(inputs.fps);
  const mpf = Number(inputs.minPorFoto);
  const mbf = Number(inputs.mbPorFoto);
  if (!dur || !fps || !mpf || !mbf) throw new Error('Completá los campos');
  const totalFotos = Math.ceil(dur * fps);
  const totalMin = totalFotos * mpf;
  const horas = totalMin / 60;
  const gb = (totalFotos * mbf) / 1000;
  let fluidez = '';
  if (fps < 10) fluidez = 'Choppy / experimental';
  else if (fps < 13) fluidez = 'Clásico stop motion ✅';
  else if (fps < 20) fluidez = 'Moderno fluido';
  else fluidez = 'Cine profesional';
  let tiempoStr = '';
  if (horas < 1) tiempoStr = `${Math.round(totalMin)} min`;
  else if (horas < 24) tiempoStr = `${horas.toFixed(1)} hs`;
  else tiempoStr = `${(horas/24).toFixed(1)} días (${horas.toFixed(0)} hs totales)`;

  const tiempoLimpio = tiempoStr;
  const _insight = {
    title: 'Tu producción en números',
    text: `Para **${dur}s a ${fps} fps** necesitás **${totalFotos} fotos**, que a ${mpf} min cada una son **${tiempoLimpio}** de trabajo y ${gb.toFixed(1)} GB en disco. A ${fps} fps el resultado es "${fluidez}".`,
    tone: fps < 10 ? 'warn' : 'neutral',
    icon: '🎬',
  };

  const _chart = {
    type: 'scale',
    marker: fps,
    markerLabel: `${fps} fps`,
    min: 0,
    segments: [
      { nombre: 'Choppy / experimental', max: 10, color: '#f87171', colorDark: '#dc2626' },
      { nombre: 'Clásico stop motion', max: 13, color: '#4ade80', colorDark: '#16a34a' },
      { nombre: 'Moderno fluido', max: 20, color: '#60a5fa', colorDark: '#2563eb' },
      { nombre: 'Cine profesional', max: Math.max(30, Math.ceil(fps) + 1), color: '#a78bfa', colorDark: '#7c3aed' },
    ],
    ariaLabel: `Fluidez de la animación: ${fps} fps (${fluidez})`,
  };

  return {
    totalFotos: `${totalFotos} fotos`,
    tiempoAnimacion: tiempoStr,
    espacioDisco: `${gb.toFixed(1)} GB`,
    fluidez: `${fps} fps: ${fluidez}`,
    _insight,
    _chart,
  };
}
