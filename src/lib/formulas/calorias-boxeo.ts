/** Calorías en boxeo y artes marciales */
export interface Inputs { peso: number; duracion: number; disciplina: string; }
export interface Outputs {
  caloriasQuemadas: number;
  equivalenteKmCorrer: number;
  detalle: string;
}

const DISCIPLINAS: Record<string, { met: number; nombre: string }> = {
  boxeo: { met: 7.8, nombre: 'Boxeo' },
  kickboxing: { met: 9.0, nombre: 'Kickboxing' },
  'muay-thai': { met: 10.3, nombre: 'Muay Thai' },
  'jiu-jitsu': { met: 7.3, nombre: 'Jiu-Jitsu / BJJ' },
  karate: { met: 7.5, nombre: 'Karate' },
  taekwondo: { met: 8.5, nombre: 'Taekwondo' },
};

export function caloriasBoxeo(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.duracion);
  const disc = String(i.disciplina || 'boxeo');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá la duración en minutos');

  const info = DISCIPLINAS[disc] || DISCIPLINAS['boxeo'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  // Equivalente km corriendo a 10 km/h (MET 9.8)
  const kcalPorKmCorrer = (9.8 * 3.5 * peso) / 200 * 6;
  const kmEquiv = total / kcalPorKmCorrer;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    caloriasQuemadas: Math.round(total),
    equivalenteKmCorrer: Number(kmEquiv.toFixed(1)),
    detalle: `${info.nombre} ${min} min (MET ${info.met}): ~${fmt.format(Math.round(total))} kcal. Equivale a correr ~${kmEquiv.toFixed(1)} km a 10 km/h.`,
  };
}
