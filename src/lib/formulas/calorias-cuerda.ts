/** Calorías saltando la cuerda */
export interface Inputs { peso: number; duracion: number; intensidad: string; }
export interface Outputs {
  caloriasQuemadas: number;
  equivalenteKmCorrer: number;
  detalle: string;
}

const MET_CUERDA: Record<string, number> = {
  baja: 8.8,
  moderada: 11.8,
  alta: 12.3,
};

export function caloriasCuerda(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.duracion);
  const int = String(i.intensidad || 'moderada');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá la duración en minutos');

  const met = MET_CUERDA[int] || MET_CUERDA['moderada'];
  const kcalMin = (met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  // Equivalente km corriendo a 10 km/h (MET 9.8)
  const kcalPorKmCorrer = (9.8 * 3.5 * peso) / 200 * 6; // 6 min por km a 10 km/h
  const kmEquiv = total / kcalPorKmCorrer;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    caloriasQuemadas: Math.round(total),
    equivalenteKmCorrer: Number(kmEquiv.toFixed(1)),
    detalle: `Saltando la cuerda ${min} min a intensidad ${int} (MET ${met}), quemás ~${fmt.format(Math.round(total))} kcal. Equivale a correr ~${fmt.format(Number(kmEquiv.toFixed(1)))} km a 10 km/h.`,
  };
}
