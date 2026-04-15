/** Calorías en sesión de yoga o pilates */
export interface Inputs {
  peso: number;
  duracion: number;
  tipo?: string;
}
export interface Outputs {
  caloriasQuemadas: number;
  equivalenteKmCaminata: number;
  detalle: string;
}

export function caloriasYoga(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const duracion = Number(i.duracion);
  const tipo = String(i.tipo || 'vinyasa');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!duracion || duracion <= 0) throw new Error('Ingresá la duración');

  // METs por tipo (Compendium of Physical Activities)
  let met = 4.0;
  let nombre = 'Vinyasa flow';
  if (tipo === 'hatha') { met = 2.5; nombre = 'Hatha yoga'; }
  else if (tipo === 'power') { met = 5.0; nombre = 'Power yoga'; }
  else if (tipo === 'pilates') { met = 3.0; nombre = 'Pilates'; }

  const horas = duracion / 60;
  const calorias = met * peso * horas;

  // Equivalente en km de caminata (MET 3.5, velocidad ~5 km/h)
  const metCaminata = 3.5;
  const horasCaminata = calorias / (metCaminata * peso);
  const kmCaminata = horasCaminata * 5;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    caloriasQuemadas: Math.round(calorias),
    equivalenteKmCaminata: Number(kmCaminata.toFixed(1)),
    detalle: `${nombre} por ${fmt.format(duracion)} min quema ~${fmt.format(calorias)} kcal. Equivale a caminar ${fmt.format(kmCaminata)} km.`,
  };
}
