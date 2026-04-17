/**
 * Calculadora de time-lapse por duración e intervalo
 */

export interface Inputs {
  duracionVideo: number; fps: number; duracionReal: number; mbPorFoto: number;
}

export interface Outputs {
  totalFotos: string; intervalo: string; aceleracion: number; espacioDisco: string;
}

export function timeLapseDuracionFotosMaker(inputs: Inputs): Outputs {
  const dv = Number(inputs.duracionVideo);
  const fps = Number(inputs.fps);
  const dr = Number(inputs.duracionReal) * 60; // min to seg
  const mbf = Number(inputs.mbPorFoto);
  if (!dv || !fps || !dr || !mbf) throw new Error('Completá los campos');
  const fotos = Math.ceil(dv * fps);
  const intervalo = dr / fotos;
  const aceleracion = dr / dv;
  const gb = (fotos * mbf) / 1000;
  let intStr = '';
  if (intervalo < 1) intStr = `${(intervalo * 1000).toFixed(0)} ms entre fotos`;
  else if (intervalo < 60) intStr = `${intervalo.toFixed(1)} s`;
  else intStr = `${(intervalo/60).toFixed(1)} min`;
  return {
    totalFotos: `${fotos} fotos`,
    intervalo: intStr,
    aceleracion: Number(aceleracion.toFixed(0)),
    espacioDisco: `${gb.toFixed(2)} GB`,
  };
}
