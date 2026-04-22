/** Calorías quemadas en WOD de CrossFit con benchmarks clásicos */
export interface Inputs {
  peso: number;
  wod: string; // 'fran' | 'cindy' | 'murph' | 'helen' | 'metcon-10' | 'metcon-20' | 'wod-amrap' | 'custom'
  minutos?: number; // usado solo si wod = 'custom' o 'metcon-*'
  intensidad?: string; // 'baja' | 'media' | 'alta'
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  duracionMin: number;
  wodMostrado: string;
  resumen: string;
}

// MET 10.5-13.0 (Compendium)
const WODS: Record<string, { met: number; minDefault: number; nombre: string; desc: string }> = {
  'fran': { met: 13.0, minDefault: 5, nombre: 'Fran', desc: '21-15-9 thrusters + pull-ups' },
  'cindy': { met: 11.5, minDefault: 20, nombre: 'Cindy', desc: 'AMRAP 20: 5 pull-ups, 10 push-ups, 15 squats' },
  'murph': { met: 11.0, minDefault: 45, nombre: 'Murph', desc: '1 mi + 100 pull-ups + 200 push-ups + 300 squats + 1 mi' },
  'helen': { met: 12.0, minDefault: 12, nombre: 'Helen', desc: '3 rounds: 400 m run + 21 KB swings + 12 pull-ups' },
  'metcon-10': { met: 12.0, minDefault: 10, nombre: 'Metcon 10 min', desc: 'WOD intenso 10 min' },
  'metcon-20': { met: 11.0, minDefault: 20, nombre: 'Metcon 20 min', desc: 'WOD AMRAP 20 min' },
  'wod-amrap': { met: 10.5, minDefault: 15, nombre: 'AMRAP general', desc: 'WOD AMRAP mixto' },
  'custom': { met: 11.0, minDefault: 15, nombre: 'WOD personalizado', desc: 'Duración personalizada' },
};

export function caloriasCrossfitWod(i: Inputs): Outputs {
  const peso = Number(i.peso);
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');

  const wodKey = String(i.wod || 'fran');
  const info = WODS[wodKey] || WODS['fran'];

  const minInput = Number(i.minutos);
  const min = (minInput && minInput > 0) ? minInput : info.minDefault;

  let met = info.met;
  const inten = String(i.intensidad || 'media');
  if (inten === 'baja') met = met * 0.85;
  else if (inten === 'alta') met = met * 1.1;

  const kcalMin = (met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: Number(met.toFixed(1)),
    duracionMin: min,
    wodMostrado: `${info.nombre} — ${info.desc}`,
    resumen: `**${info.nombre}** (${min} min, MET ${met.toFixed(1)}) quema **${Math.round(total)} kcal** para un atleta de ${peso} kg.`,
  };
}
