/** Calculadora pace natación por 100m */
export interface Inputs {
  distancia: number;
  minutos: number;
  segundos: number;
}
export interface Outputs {
  pace100: string;
  velocidad: string;
  tiempo400: string;
  tiempo1500: string;
  tiempoMilla: string;
  mensaje: string;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

export function natacionPace100m(i: Inputs): Outputs {
  const distancia = Number(i.distancia);
  const minutos = Number(i.minutos) || 0;
  const segundos = Number(i.segundos) || 0;
  if (!distancia || distancia <= 0) throw new Error('Ingresá la distancia');

  const totalSeg = minutos * 60 + segundos;
  if (totalSeg <= 0) throw new Error('Ingresá un tiempo válido');

  const pace100seg = (totalSeg / distancia) * 100;
  const pace100 = fmtTime(pace100seg) + ' /100m';

  const kmh = ((distancia / totalSeg) * 3.6).toFixed(2);
  const velocidad = `${kmh} km/h`;

  const tiempo400 = fmtTime(pace100seg * 4);
  const tiempo1500 = fmtTime(pace100seg * 15);
  const tiempoMilla = fmtTime(pace100seg * 18.52);

  let nivel: string;
  if (pace100seg < 75) nivel = 'Nivel competitivo avanzado';
  else if (pace100seg < 100) nivel = 'Nivel intermedio-avanzado';
  else if (pace100seg < 130) nivel = 'Nivel intermedio';
  else if (pace100seg < 160) nivel = 'Nivel principiante-intermedio';
  else nivel = 'Nivel principiante';

  return {
    pace100,
    velocidad,
    tiempo400,
    tiempo1500,
    tiempoMilla,
    mensaje: `Pace: ${fmtTime(pace100seg)}/100m (${velocidad}). ${nivel}.`
  };
}