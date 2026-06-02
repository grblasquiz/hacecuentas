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
  _insight?: any;
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
  const totalR = Math.round(total);

  // Equivalencia tangible: 1 alfajor de maicena ~250 kcal
  const alfajores = (total / 250);
  let equiv: string;
  if (alfajores >= 1) equiv = `${alfajores.toFixed(1)} alfajor${alfajores >= 2 ? 'es' : ''} de maicena`;
  else equiv = `media porción de pizza (~${Math.round(total)} kcal)`;
  const intenso = info.met >= 5.0;

  return {
    caloriasTotal: totalR,
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    nivelMostrado: info.nombre,
    resumen: `Jugando **${info.nombre}** ${min} min quemás **${totalR} kcal** (${kcalMin.toFixed(2)} kcal/min, MET ${info.met}).`,
    _insight: {
      title: 'Lo que quemaste en la cancha',
      text: `${min} min de **${info.nombre}** te queman **${totalR} kcal**, equivalente a ${equiv}. ${intenso ? 'A este ritmo el pickleball cuenta como ejercicio cardiovascular de intensidad moderada-alta.' : 'Un ritmo social que igual suma movimiento real al día.'}`,
      tone: 'good',
      icon: '🏓',
    },
  };
}
