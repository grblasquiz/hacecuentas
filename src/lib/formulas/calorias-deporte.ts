/** Calorías quemadas por actividad — usando MET */
export interface Inputs { peso: number; actividad: string; minutos: number; }
export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  actividadMostrada: string;
}

// Valores MET (Ainsworth Compendium of Physical Activities 2011)
const MET_TABLE: Record<string, { met: number; nombre: string }> = {
  'caminar-lento': { met: 2.8, nombre: 'Caminar lento (3 km/h)' },
  'caminar-rapido': { met: 4.3, nombre: 'Caminar rápido (5 km/h)' },
  'trotar': { met: 7.0, nombre: 'Trotar suave (8 km/h)' },
  'correr-moderado': { met: 9.8, nombre: 'Correr moderado (10 km/h)' },
  'correr-rapido': { met: 11.5, nombre: 'Correr rápido (12 km/h)' },
  'ciclismo-suave': { met: 4.0, nombre: 'Ciclismo suave (<16 km/h)' },
  'ciclismo-moderado': { met: 8.0, nombre: 'Ciclismo moderado (20 km/h)' },
  'ciclismo-intenso': { met: 10.0, nombre: 'Ciclismo intenso (>25 km/h)' },
  'natacion-moderada': { met: 6.0, nombre: 'Natación moderada' },
  'natacion-intensa': { met: 9.8, nombre: 'Natación intensa' },
  'futbol': { met: 7.0, nombre: 'Fútbol' },
  'tenis': { met: 7.3, nombre: 'Tenis recreativo' },
  'basquet': { met: 6.5, nombre: 'Básquet recreativo' },
  'yoga': { met: 2.5, nombre: 'Yoga hatha' },
  'pilates': { met: 3.0, nombre: 'Pilates' },
  'spinning': { met: 8.5, nombre: 'Spinning / ciclismo indoor' },
  'pesas-moderado': { met: 3.5, nombre: 'Pesas moderado' },
  'pesas-intenso': { met: 6.0, nombre: 'Pesas intenso' },
  'crossfit': { met: 8.0, nombre: 'CrossFit / HIIT' },
  'escalada': { met: 8.0, nombre: 'Escalada indoor' },
  'padel': { met: 6.0, nombre: 'Pádel recreativo' },
  'surf': { met: 3.0, nombre: 'Surf recreativo' },
  'skate': { met: 5.0, nombre: 'Skate / patineta' },
  'baile-zumba': { met: 6.5, nombre: 'Zumba / baile cardio' },
};

export function caloriasDeporte(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const act = String(i.actividad || 'correr-moderado');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos');

  const info = MET_TABLE[act] || MET_TABLE['correr-moderado'];
  // kcal = MET × 3.5 × peso / 200 × minutos
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    actividadMostrada: info.nombre,
  };
}
