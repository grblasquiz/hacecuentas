/** Calorías quemadas haciendo tareas del hogar */
export interface Inputs {
  peso: number;
  tarea?: string;
  duracion: number;
  __lang?: string;
}
export interface Outputs {
  caloriasQuemadas: number;
  equivalenteMinutosCaminata: number;
  detalle: string;
}

export function caloriasTareasHogar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const peso = Number(i.peso);
  const tarea = String(i.tarea || 'trapear');
  const duracion = Number(i.duracion);

  if (!peso || peso <= 0) throw new Error(__lang === 'en' ? 'Enter your weight' : 'Ingresá tu peso');
  if (!duracion || duracion <= 0) throw new Error(__lang === 'en' ? 'Enter the duration' : 'Ingresá la duración');

  // METs por tarea (Compendium of Physical Activities)
  const mets: Record<string, { met: number; nombre: string; nameEn: string }> = {
    barrer: { met: 3.0, nombre: 'Barrer', nameEn: 'Sweeping' },
    trapear: { met: 3.5, nombre: 'Trapear/fregar pisos', nameEn: 'Mopping floors' },
    aspirar: { met: 3.3, nombre: 'Aspirar', nameEn: 'Vacuuming' },
    cocinar: { met: 2.0, nombre: 'Cocinar', nameEn: 'Cooking' },
    'lavar-platos': { met: 2.2, nombre: 'Lavar platos', nameEn: 'Washing dishes' },
    jardineria: { met: 5.0, nombre: 'Jardinería', nameEn: 'Gardening' },
    planchar: { met: 1.8, nombre: 'Planchar', nameEn: 'Ironing' },
  };

  const tareaData = mets[tarea] || mets['trapear'];
  const horas = duracion / 60;
  const calorias = tareaData.met * peso * horas;

  // Equivalente en minutos de caminata (MET 3.5)
  const metCaminata = 3.5;
  const equivalenteMin = calorias / (metCaminata * peso / 60);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const taskName = __lang === 'en' ? tareaData.nameEn : tareaData.nombre;
  const detalle = __lang === 'en'
    ? `${taskName} for ${fmt.format(duracion)} min burns ~${fmt.format(calorias)} kcal (MET ${tareaData.met}). Equivalent to ${fmt.format(equivalenteMin)} min of walking.`
    : `${tareaData.nombre} por ${fmt.format(duracion)} min quema ~${fmt.format(calorias)} kcal (MET ${tareaData.met}). Equivale a ${fmt.format(equivalenteMin)} min de caminata.`;

  return {
    caloriasQuemadas: Math.round(calorias),
    equivalenteMinutosCaminata: Math.round(equivalenteMin),
    detalle,
  };
}
