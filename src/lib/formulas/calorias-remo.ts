/** Calorías en remo indoor / ergómetro */
export interface Inputs { peso: number; duracion: number; intensidad: string; }
export interface Outputs {
  caloriasQuemadas: number;
  wattsEstimados: number;
  detalle: string;
}

const MET_REMO: Record<string, { met: number; watts: number; nombre: string }> = {
  suave: { met: 4.8, watts: 75, nombre: 'suave (< 100 W)' },
  moderada: { met: 8.0, watts: 125, nombre: 'moderada (100–150 W)' },
  intensa: { met: 12.0, watts: 200, nombre: 'intensa (> 150 W)' },
};

export function caloriasRemo(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.duracion);
  const int = String(i.intensidad || 'moderada');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá la duración en minutos');

  const info = MET_REMO[int] || MET_REMO['moderada'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    caloriasQuemadas: Math.round(total),
    wattsEstimados: info.watts,
    detalle: `Remo indoor ${min} min a intensidad ${info.nombre} (MET ${info.met}): ~${fmt.format(Math.round(total))} kcal. Watts estimados: ~${info.watts} W.`,
  };
}
