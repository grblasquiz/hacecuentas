/** Calorías quemadas en escalada y boulder */
export interface Inputs {
  peso: number;
  tipo: string;
  minutos: number;
}

export interface Outputs {
  result: number;
  kcalMin: number;
  metUsado: number;
  detalle: string;
  _insight?: any;
}

const MET_ESCALADA: Record<string, { met: number; nombre: string }> = {
  'boulder-indoor': { met: 5.0, nombre: 'Boulder indoor' },
  'escalada-indoor-moderada': { met: 5.8, nombre: 'Muro indoor moderado' },
  'escalada-indoor-intensa': { met: 7.5, nombre: 'Muro indoor intenso' },
  'escalada-roca': { met: 8.0, nombre: 'Escalada en roca' },
  'escalada-lead': { met: 11.0, nombre: 'Escalada lead / intensa' },
};

export function caloriasEscaladaBoulderMuro(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const tipo = String(i.tipo || 'boulder-indoor');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá los minutos de escalada');

  const info = MET_ESCALADA[tipo] || MET_ESCALADA['boulder-indoor'];
  const kcalPorMin = (info.met * 3.5 * peso) / 200;
  const total = kcalPorMin * min;

  // Equivalencia para dar contexto: 1 alfajor ~ 230 kcal, 1 hora de caminata ~ MET 3.5
  const totalR = Math.round(total);
  const alfajores = total / 230;
  const intensa = info.met >= 8;
  const _insight = {
    title: intensa ? 'Sesión de alto gasto' : 'Gasto moderado',
    text: intensa
      ? `**${info.nombre}** es de las actividades que más queman: en ${min} min te llevaste **${totalR} kcal**, equivalente a casi **${alfajores.toFixed(1)} alfajores**. La escalada suma fuerza, técnica y cardio a la vez.`
      : `En ${min} min de **${info.nombre}** quemaste **${totalR} kcal** (~**${alfajores.toFixed(1)} alfajores**). Subir de intensidad o encadenar más vías eleva bastante el gasto.`,
    tone: intensa ? 'good' : 'neutral',
    icon: '🧗',
  };

  return {
    result: totalR,
    kcalMin: Number(kcalPorMin.toFixed(2)),
    metUsado: info.met,
    detalle: `Haciendo **${info.nombre}** durante ${min} min quemás **${totalR} kcal** (${kcalPorMin.toFixed(2)} kcal/min, MET ${info.met}).`,
    _insight,
  };
}
