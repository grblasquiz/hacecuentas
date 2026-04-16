/** Predictor de tiempo en maratón/media maratón — Riegel */
export interface Inputs {
  distanciaConocida: number;
  tiempoMinutos: number;
  distanciaMeta: string;
}
export interface Outputs {
  tiempoEstimado: string;
  ritmoKm: string;
  velocidadKmh: number;
  tiempoHoras: number;
  tiempoMinutosTotal: number;
  mensaje: string;
}

export function tiempoMetaMaraton(i: Inputs): Outputs {
  const distConocida = Number(i.distanciaConocida); // km
  const tiempoMin = Number(i.tiempoMinutos);
  const distMeta = String(i.distanciaMeta || '42.195');

  if (!distConocida || distConocida <= 0) throw new Error('Ingresá la distancia de referencia');
  if (!tiempoMin || tiempoMin <= 0) throw new Error('Ingresá el tiempo en minutos');

  const distancias: Record<string, number> = {
    '5': 5,
    '10': 10,
    '15': 15,
    '21.1': 21.1,
    '42.195': 42.195,
  };
  const distMetaKm = distancias[distMeta] || Number(distMeta);

  // Fórmula de Riegel: T2 = T1 × (D2/D1)^1.06
  const tiempoEstimadoMin = tiempoMin * Math.pow(distMetaKm / distConocida, 1.06);

  const horas = Math.floor(tiempoEstimadoMin / 60);
  const mins = Math.floor(tiempoEstimadoMin % 60);
  const segs = Math.round((tiempoEstimadoMin % 1) * 60);
  const tiempoEstimado = `${horas}h ${mins.toString().padStart(2, '0')}m ${segs.toString().padStart(2, '0')}s`;

  const ritmoMinKm = tiempoEstimadoMin / distMetaKm;
  const ritmoM = Math.floor(ritmoMinKm);
  const ritmoS = Math.round((ritmoMinKm - ritmoM) * 60);
  const ritmoKm = `${ritmoM}:${ritmoS.toString().padStart(2, '0')} min/km`;

  const velocidadKmh = distMetaKm / (tiempoEstimadoMin / 60);

  return {
    tiempoEstimado,
    ritmoKm,
    velocidadKmh: Number(velocidadKmh.toFixed(1)),
    tiempoHoras: Number((tiempoEstimadoMin / 60).toFixed(2)),
    tiempoMinutosTotal: Math.round(tiempoEstimadoMin),
    mensaje: `Tiempo estimado para ${distMetaKm} km: ${tiempoEstimado} (ritmo ${ritmoKm}, ${velocidadKmh.toFixed(1)} km/h).`,
  };
}
