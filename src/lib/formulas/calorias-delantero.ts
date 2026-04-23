/** Calorías quemadas por un delantero sprinter en un partido (MET 8-10) */
export interface Inputs {
  peso: number;
  minutos: number;
  tipo: string; // 'nueve' | 'extremo' | 'falso-nueve' | 'sprinter-elite'
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  tipoNombre: string;
  sprintsEstimados: number;
  detalle: string;
}

const TIPOS: Record<string, { met: number; nombre: string; sprints: number }> = {
  'nueve':          { met: 8.5,  nombre: 'Delantero centro (9)',            sprints: 35 },
  'extremo':        { met: 9.5,  nombre: 'Extremo veloz',                   sprints: 48 },
  'falso-nueve':    { met: 9.0,  nombre: 'Falso 9 (movimiento constante)',  sprints: 38 },
  'sprinter-elite': { met: 10.0, nombre: 'Delantero sprinter élite',        sprints: 55 },
};

export function caloriasDelantero(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const tipo = String(i.tipo || 'nueve');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = TIPOS[tipo] || TIPOS['nueve'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;
  const sprints = Math.round(info.sprints * (min / 90));

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    tipoNombre: info.nombre,
    sprintsEstimados: sprints,
    detalle: `**${info.nombre}** de ${peso} kg en ${min} min quema **~${Math.round(total)} kcal** (MET ${info.met}) y realiza **~${sprints} sprints** (>24 km/h).`,
  };
}
