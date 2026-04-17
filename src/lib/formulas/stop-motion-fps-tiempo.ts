/**
 * Calculadora de stop motion por FPS y duración
 */

export interface Inputs {
  duracion: number; fps: number; minPorFoto: number; mbPorFoto: number;
}

export interface Outputs {
  totalFotos: string; tiempoAnimacion: string; espacioDisco: string; fluidez: string;
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
  return {
    totalFotos: `${totalFotos} fotos`,
    tiempoAnimacion: tiempoStr,
    espacioDisco: `${gb.toFixed(1)} GB`,
    fluidez: `${fps} fps: ${fluidez}`,
  };
}
