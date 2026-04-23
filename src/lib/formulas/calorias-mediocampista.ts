/** Calorías quemadas por un mediocampista en un partido de fútbol (MET 9-11) */
export interface Inputs {
  peso: number;
  minutos: number;
  perfil: string; // 'box-to-box' | 'central' | 'ofensivo' | 'defensivo'
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  perfilNombre: string;
  kmEstimados: number;
  detalle: string;
}

const PERFILES: Record<string, { met: number; nombre: string; km: number }> = {
  'defensivo':  { met: 9.0,  nombre: 'Mediocampista defensivo (5)',           km: 10.5 },
  'central':    { met: 10.0, nombre: 'Mediocampista central clásico (8)',     km: 11.5 },
  'box-to-box': { met: 11.0, nombre: 'Mediocampista box-to-box',              km: 12.5 },
  'ofensivo':   { met: 10.5, nombre: 'Mediapunta / enganche (10)',            km: 11.0 },
};

export function caloriasMediocampista(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const perfil = String(i.perfil || 'central');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = PERFILES[perfil] || PERFILES['central'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;
  const km = info.km * (min / 90);

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    perfilNombre: info.nombre,
    kmEstimados: Number(km.toFixed(2)),
    detalle: `**${info.nombre}** de ${peso} kg en ${min} min quema **~${Math.round(total)} kcal** (MET ${info.met}) y recorre ~${km.toFixed(1)} km.`,
  };
}
