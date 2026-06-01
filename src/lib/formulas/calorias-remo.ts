/** Calorías en remo indoor / ergómetro */
export interface Inputs { peso: number; duracion: number; intensidad: string; }
export interface Outputs {
  caloriasQuemadas: number;
  wattsEstimados: number;
  detalle: string;
  _insight?: any;
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

  const kcalHora = kcalMin * 60;
  const insight = {
    title: 'Tu sesión de remo',
    text: `**${min} min** a intensidad **${info.nombre}** queman **${fmt.format(Math.round(total))} kcal** (~${fmt.format(Math.round(kcalHora))} kcal/hora a ${info.watts} W).` +
      (int === 'intensa'
        ? ' El remo intenso recluta casi todo el cuerpo: de los gastos más altos por minuto que vas a encontrar.'
        : ' Subí la intensidad o estirá la sesión para empujar el gasto hacia arriba.'),
    tone: 'good',
    icon: '🚣',
  };

  return {
    caloriasQuemadas: Math.round(total),
    wattsEstimados: info.watts,
    detalle: `Remo indoor ${min} min a intensidad ${info.nombre} (MET ${info.met}): ~${fmt.format(Math.round(total))} kcal. Watts estimados: ~${info.watts} W.`,
    _insight: insight,
  };
}
