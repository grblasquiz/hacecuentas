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

  return {
    result: Math.round(total),
    kcalMin: Number(kcalPorMin.toFixed(2)),
    metUsado: info.met,
    detalle: `Haciendo **${info.nombre}** durante ${min} min quemás **${Math.round(total)} kcal** (${kcalPorMin.toFixed(2)} kcal/min, MET ${info.met}).`,
  };
}
