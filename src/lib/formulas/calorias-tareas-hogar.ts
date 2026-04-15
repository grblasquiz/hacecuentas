/** Calorías quemadas haciendo tareas del hogar */
export interface Inputs {
  peso: number;
  tarea?: string;
  duracion: number;
}
export interface Outputs {
  caloriasQuemadas: number;
  equivalenteMinutosCaminata: number;
  detalle: string;
}

export function caloriasTareasHogar(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const tarea = String(i.tarea || 'trapear');
  const duracion = Number(i.duracion);

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!duracion || duracion <= 0) throw new Error('Ingresá la duración');

  // METs por tarea (Compendium of Physical Activities)
  const mets: Record<string, { met: number; nombre: string }> = {
    barrer: { met: 3.0, nombre: 'Barrer' },
    trapear: { met: 3.5, nombre: 'Trapear/fregar pisos' },
    aspirar: { met: 3.3, nombre: 'Aspirar' },
    cocinar: { met: 2.0, nombre: 'Cocinar' },
    'lavar-platos': { met: 2.2, nombre: 'Lavar platos' },
    jardineria: { met: 5.0, nombre: 'Jardinería' },
    planchar: { met: 1.8, nombre: 'Planchar' },
  };

  const tareaData = mets[tarea] || mets['trapear'];
  const horas = duracion / 60;
  const calorias = tareaData.met * peso * horas;

  // Equivalente en minutos de caminata (MET 3.5)
  const metCaminata = 3.5;
  const equivalenteMin = calorias / (metCaminata * peso / 60);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    caloriasQuemadas: Math.round(calorias),
    equivalenteMinutosCaminata: Math.round(equivalenteMin),
    detalle: `${tareaData.nombre} por ${fmt.format(duracion)} min quema ~${fmt.format(calorias)} kcal (MET ${tareaData.met}). Equivale a ${fmt.format(equivalenteMin)} min de caminata.`,
  };
}
