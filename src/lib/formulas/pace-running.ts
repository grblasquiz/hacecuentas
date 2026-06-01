/** Pace (ritmo) de running: tiempo por km, mph, velocidad */
export interface Inputs { distanciaKm: number; tiempoMin: number; __lang?: string; }
export interface Outputs {
  paceMinPorKm: string;
  paceMinPorMilla: string;
  velocidadKmh: number;
  velocidadMph: number;
  tiempoTotalFormato: string;
}

export function paceRunning(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errDist: 'Ingresá la distancia en km',
      errTiempo: 'Ingresá el tiempo en minutos',
    },
    en: {
      errDist: 'Enter the distance in km',
      errTiempo: 'Enter the time in minutes',
    },
  } as const)[__lang];

  const dist = Number(i.distanciaKm);
  const tiempo = Number(i.tiempoMin);
  if (!dist || dist <= 0) throw new Error(T.errDist);
  if (!tiempo || tiempo <= 0) throw new Error(T.errTiempo);

  const minPorKm = tiempo / dist;
  const minPorMi = minPorKm * 1.60934;
  const kmh = dist / (tiempo / 60);
  const mph = kmh * 0.621371;

  const fmt = (min: number) => {
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const horas = Math.floor(tiempo / 60);
  const mins = Math.floor(tiempo % 60);
  const segs = Math.round((tiempo - Math.floor(tiempo)) * 60);
  const tiempoFmt = horas > 0
    ? `${horas}h ${mins}m ${segs}s`
    : `${mins}m ${segs}s`;

  return {
    paceMinPorKm: fmt(minPorKm),
    paceMinPorMilla: fmt(minPorMi),
    velocidadKmh: Number(kmh.toFixed(2)),
    velocidadMph: Number(mph.toFixed(2)),
    tiempoTotalFormato: tiempoFmt,
  };
}
