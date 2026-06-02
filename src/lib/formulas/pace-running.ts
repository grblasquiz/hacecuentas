/** Pace (ritmo) de running: tiempo por km, mph, velocidad */
export interface Inputs { distanciaKm: number; tiempoMin: number; __lang?: string; }
export interface Outputs {
  paceMinPorKm: string;
  paceMinPorMilla: string;
  velocidadKmh: number;
  velocidadMph: number;
  tiempoTotalFormato: string;
  _insight?: any;
}

export function paceRunning(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errDist: 'Ingresá la distancia en km',
      errTiempo: 'Ingresá el tiempo en minutos',
      insTitle: 'Tu ritmo y velocidad',
      insIcon: '🏃',
      insText: (pace: string, kmh: string, dist: string, tt: string) => `Corriste **${dist} km** en ${tt}, lo que da un ritmo de **${pace} min/km** a **${kmh} km/h**. Para proyectar otra distancia, mantené este pace constante y multiplicá por los km del objetivo.`,
    },
    en: {
      errDist: 'Enter the distance in km',
      errTiempo: 'Enter the time in minutes',
      insTitle: 'Your pace and speed',
      insIcon: '🏃',
      insText: (pace: string, kmh: string, dist: string, tt: string) => `You ran **${dist} km** in ${tt}, giving a pace of **${pace} min/km** at **${kmh} km/h**. To project another distance, hold this pace steady and multiply by the target's kilometers.`,
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

  const insight = {
    title: T.insTitle,
    text: T.insText(fmt(minPorKm), kmh.toFixed(2), String(dist), tiempoFmt),
    tone: 'neutral',
    icon: T.insIcon,
  };
  return {
    paceMinPorKm: fmt(minPorKm),
    paceMinPorMilla: fmt(minPorMi),
    velocidadKmh: Number(kmh.toFixed(2)),
    velocidadMph: Number(mph.toFixed(2)),
    tiempoTotalFormato: tiempoFmt,
    _insight: insight,
  };
}
