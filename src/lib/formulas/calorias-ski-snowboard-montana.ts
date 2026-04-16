/** Calorías quemadas en esquí y snowboard */
export interface Inputs {
  peso: number;
  actividad: string;
  minutos: number;
}

export interface Outputs {
  result: number;
  kcalMin: number;
  metUsado: number;
  detalle: string;
}

const MET_NIEVE: Record<string, { met: number; nombre: string }> = {
  'alpino-suave': { met: 5.0, nombre: 'Esquí alpino suave' },
  'alpino-moderado': { met: 6.0, nombre: 'Esquí alpino moderado' },
  'alpino-intenso': { met: 8.0, nombre: 'Esquí alpino intenso' },
  'snowboard-moderado': { met: 5.3, nombre: 'Snowboard moderado' },
  'snowboard-intenso': { met: 7.0, nombre: 'Snowboard intenso / freestyle' },
  'fondo-suave': { met: 7.0, nombre: 'Esquí de fondo suave' },
  'fondo-moderado': { met: 9.0, nombre: 'Esquí de fondo moderado' },
  'fondo-intenso': { met: 15.0, nombre: 'Esquí de fondo intenso' },
};

export function caloriasSkiSnowboardMontaña(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const act = String(i.actividad || 'alpino-moderado');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá los minutos de actividad');

  const info = MET_NIEVE[act] || MET_NIEVE['alpino-moderado'];
  const kcalPorMin = (info.met * 3.5 * peso) / 200;
  const total = kcalPorMin * min;

  return {
    result: Math.round(total),
    kcalMin: Number(kcalPorMin.toFixed(2)),
    metUsado: info.met,
    detalle: `Haciendo **${info.nombre}** durante ${min} min quemás **${Math.round(total)} kcal** (${kcalPorMin.toFixed(2)} kcal/min, MET ${info.met}).`,
  };
}
