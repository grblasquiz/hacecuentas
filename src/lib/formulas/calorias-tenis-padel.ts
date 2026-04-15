/** Calorías quemadas jugando tenis o pádel */
export interface Inputs {
  peso: number;
  deporte: string; // 'tenis-singles' | 'tenis-dobles' | 'padel-recreativo' | 'padel-competitivo'
  minutos: number;
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  deporteMostrado: string;
  resumen: string;
}

const MET: Record<string, { met: number; nombre: string }> = {
  'tenis-singles': { met: 8.0, nombre: 'Tenis singles (1 vs 1)' },
  'tenis-dobles': { met: 6.0, nombre: 'Tenis dobles' },
  'tenis-competitivo': { met: 10.0, nombre: 'Tenis competitivo' },
  'tenis-recreativo': { met: 6.5, nombre: 'Tenis recreativo' },
  'padel-recreativo': { met: 6.0, nombre: 'Pádel recreativo' },
  'padel-competitivo': { met: 8.5, nombre: 'Pádel competitivo' },
  'padel-dobles': { met: 7.0, nombre: 'Pádel dobles amateur' },
};

export function caloriasTenisPadel(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const dep = String(i.deporte || 'tenis-singles');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos de juego');

  const info = MET[dep] || MET['tenis-singles'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    deporteMostrado: info.nombre,
    resumen: `Jugando **${info.nombre}** durante ${min} minutos quemás **${Math.round(total)} kcal** (${kcalMin.toFixed(1)} kcal/min, MET ${info.met}).`,
  };
}
