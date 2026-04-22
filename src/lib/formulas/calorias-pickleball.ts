/** Calorías quemadas jugando pickleball */
export interface Inputs {
  peso: number;
  nivel: string; // 'recreativo' | 'intermedio' | 'competitivo' | 'dobles-social'
  minutos: number;
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  nivelMostrado: string;
  resumen: string;
}

const MET_PICKLE: Record<string, { met: number; nombre: string }> = {
  'dobles-social': { met: 4.1, nombre: 'Dobles social / recreativo' },
  'recreativo': { met: 4.5, nombre: 'Singles recreativo' },
  'intermedio': { met: 5.0, nombre: 'Singles intermedio' },
  'competitivo': { met: 5.8, nombre: 'Competitivo / torneo' },
};

export function caloriasPickleball(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const nivel = String(i.nivel || 'recreativo');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = MET_PICKLE[nivel] || MET_PICKLE['recreativo'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    nivelMostrado: info.nombre,
    resumen: `Jugando **${info.nombre}** ${min} min quemás **${Math.round(total)} kcal** (${kcalMin.toFixed(2)} kcal/min, MET ${info.met}).`,
  };
}
