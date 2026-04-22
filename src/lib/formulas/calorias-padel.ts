/** Calorías quemadas jugando pádel según intensidad */
export interface Inputs {
  peso: number;
  intensidad: string; // 'recreativo' | 'intermedio' | 'competitivo' | 'profesional'
  minutos: number;
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  intensidadMostrada: string;
  resumen: string;
}

const MET_PADEL: Record<string, { met: number; nombre: string }> = {
  'recreativo': { met: 6.0, nombre: 'Recreativo (amigos, ritmo medio)' },
  'intermedio': { met: 7.0, nombre: 'Intermedio (juega habitual)' },
  'competitivo': { met: 8.0, nombre: 'Competitivo (torneo amateur)' },
  'profesional': { met: 8.5, nombre: 'Alto nivel / profesional' },
};

export function caloriasPadel(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const nivel = String(i.intensidad || 'recreativo');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = MET_PADEL[nivel] || MET_PADEL['recreativo'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    intensidadMostrada: info.nombre,
    resumen: `Pádel **${info.nombre}** ${min} min = **${Math.round(total)} kcal** (MET ${info.met}, ${kcalMin.toFixed(2)} kcal/min).`,
  };
}
