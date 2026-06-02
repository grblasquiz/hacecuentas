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
  _chart?: any;
  _insight?: any;
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

  const markerSeg = Math.round(pace100seg);
  const chart = {
    type: 'scale' as const,
    marker: markerSeg,
    markerLabel: 'Tu pace: ' + fmtTime(pace100seg) + '/100m',
    min: 50,
    unit: 's',
    segments: [
      { nombre: 'Avanzado', max: 75, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Intermedio-avanzado', max: 100, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Intermedio', max: 130, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Principiante', max: Math.max(180, markerSeg + 10), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de pace de natación por nivel (segundos por 100m)',
  };

  const insightTone = pace100seg < 100 ? 'good' : pace100seg < 160 ? 'neutral' : 'warn';
  const insight = {
    title: 'Tu ritmo de natación',
    text: `Nadás a **${fmtTime(pace100seg)}/100m** (${velocidad}): ${nivel.toLowerCase()}. A ese paso, los **1500m** te llevan **${tiempo1500}** y una **milla** unos **${tiempoMilla}**.`,
    tone: insightTone,
    icon: '🏊',
  };

  return {
    pace100,
    velocidad,
    tiempo400,
    tiempo1500,
    tiempoMilla,
    mensaje: `Pace: ${fmtTime(pace100seg)}/100m (${velocidad}). ${nivel}.`,
    _chart: chart,
    _insight: insight
  };
}