/** Pace (ritmo) de running: tiempo por km, mph, velocidad */
export interface Inputs { distanciaKm: number; tiempoMin: number; }
export interface Outputs {
  paceMinPorKm: string;
  paceMinPorMilla: string;
  velocidadKmh: number;
  velocidadMph: number;
  tiempoTotalFormato: string;
}

export function paceRunning(i: Inputs): Outputs {
  const dist = Number(i.distanciaKm);
  const tiempo = Number(i.tiempoMin);
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia en km');
  if (!tiempo || tiempo <= 0) throw new Error('Ingresá el tiempo en minutos');

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
