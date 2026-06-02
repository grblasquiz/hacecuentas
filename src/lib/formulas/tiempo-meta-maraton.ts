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
  _insight?: any;
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

  // Insight: la fórmula de Riegel es confiable extrapolando a distancias parecidas;
  // cuanto más lejos extrapolás (sobre todo hacia distancias más largas), más optimista queda.
  const factorExtrap = distMetaKm / distConocida;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (factorExtrap >= 2) {
    insightTone = 'warn';
    insightText = `Estás proyectando de **${distConocida} km** a **${distMetaKm} km** (×${factorExtrap.toFixed(1)} la distancia). Riegel tiende a quedar **optimista** en saltos tan grandes: el muro y la fatiga acumulada suelen sumar tiempo, así que tomá **${tiempoEstimado}** como piso ideal, no como garantía.`;
  } else if (factorExtrap <= 0.6) {
    insightTone = 'good';
    insightText = `Proyectando hacia una distancia más corta (**${distMetaKm} km**), el modelo es **realista**: deberías poder sostener un ritmo de **${ritmoKm}** o incluso mejorarlo en una distancia tan accesible.`;
  } else {
    insightTone = 'neutral';
    insightText = `La referencia (**${distConocida} km**) y la meta (**${distMetaKm} km**) están cerca, así que la estimación de **${tiempoEstimado}** a **${ritmoKm}** es de las más confiables que da el modelo de Riegel.`;
  }

  return {
    tiempoEstimado,
    ritmoKm,
    velocidadKmh: Number(velocidadKmh.toFixed(1)),
    tiempoHoras: Number((tiempoEstimadoMin / 60).toFixed(2)),
    tiempoMinutosTotal: Math.round(tiempoEstimadoMin),
    mensaje: `Tiempo estimado para ${distMetaKm} km: ${tiempoEstimado} (ritmo ${ritmoKm}, ${velocidadKmh.toFixed(1)} km/h).`,
    _insight: {
      title: 'Qué significa este tiempo',
      text: insightText,
      tone: insightTone,
      icon: '🏃',
    },
  };
}
