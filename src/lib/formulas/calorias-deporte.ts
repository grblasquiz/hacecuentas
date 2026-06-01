/** Calorías quemadas por actividad — usando MET */
export interface Inputs { peso: number; actividad: string; minutos: number; __lang?: string; }
export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  actividadMostrada: string;
}

// Valores MET (Ainsworth Compendium of Physical Activities 2011)
const MET_TABLE: Record<string, { met: number; nombre: string; nombreEn: string }> = {
  'caminar-lento': { met: 2.8, nombre: 'Caminar lento (3 km/h)', nombreEn: 'Slow walking (3 km/h)' },
  'caminar-rapido': { met: 4.3, nombre: 'Caminar rápido (5 km/h)', nombreEn: 'Brisk walking (5 km/h)' },
  'trotar': { met: 7.0, nombre: 'Trotar suave (8 km/h)', nombreEn: 'Light jogging (8 km/h)' },
  'correr-moderado': { met: 9.8, nombre: 'Correr moderado (10 km/h)', nombreEn: 'Moderate running (10 km/h)' },
  'correr-rapido': { met: 11.5, nombre: 'Correr rápido (12 km/h)', nombreEn: 'Fast running (12 km/h)' },
  'ciclismo-suave': { met: 4.0, nombre: 'Ciclismo suave (<16 km/h)', nombreEn: 'Easy cycling (<16 km/h)' },
  'ciclismo-moderado': { met: 8.0, nombre: 'Ciclismo moderado (20 km/h)', nombreEn: 'Moderate cycling (20 km/h)' },
  'ciclismo-intenso': { met: 10.0, nombre: 'Ciclismo intenso (>25 km/h)', nombreEn: 'Intense cycling (>25 km/h)' },
  'natacion-moderada': { met: 6.0, nombre: 'Natación moderada', nombreEn: 'Moderate swimming' },
  'natacion-intensa': { met: 9.8, nombre: 'Natación intensa', nombreEn: 'Intense swimming' },
  'futbol': { met: 7.0, nombre: 'Fútbol', nombreEn: 'Soccer' },
  'tenis': { met: 7.3, nombre: 'Tenis recreativo', nombreEn: 'Recreational tennis' },
  'basquet': { met: 6.5, nombre: 'Básquet recreativo', nombreEn: 'Recreational basketball' },
  'yoga': { met: 2.5, nombre: 'Yoga hatha', nombreEn: 'Hatha yoga' },
  'pilates': { met: 3.0, nombre: 'Pilates', nombreEn: 'Pilates' },
  'spinning': { met: 8.5, nombre: 'Spinning / ciclismo indoor', nombreEn: 'Spinning / indoor cycling' },
  'pesas-moderado': { met: 3.5, nombre: 'Pesas moderado', nombreEn: 'Moderate weight training' },
  'pesas-intenso': { met: 6.0, nombre: 'Pesas intenso', nombreEn: 'Intense weight training' },
  'crossfit': { met: 8.0, nombre: 'CrossFit / HIIT', nombreEn: 'CrossFit / HIIT' },
  'escalada': { met: 8.0, nombre: 'Escalada indoor', nombreEn: 'Indoor climbing' },
  'padel': { met: 6.0, nombre: 'Pádel recreativo', nombreEn: 'Recreational padel' },
  'surf': { met: 3.0, nombre: 'Surf recreativo', nombreEn: 'Recreational surfing' },
  'skate': { met: 5.0, nombre: 'Skate / patineta', nombreEn: 'Skateboarding' },
  'baile-zumba': { met: 6.5, nombre: 'Zumba / baile cardio', nombreEn: 'Zumba / cardio dance' },
};

export function caloriasDeporte(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const act = String(i.actividad || 'correr-moderado');
  if (!peso || peso <= 0) throw new Error(__lang === 'en' ? 'Enter your weight' : 'Ingresá el peso');
  if (!min || min <= 0) throw new Error(__lang === 'en' ? 'Enter the minutes' : 'Ingresá los minutos');

  const info = MET_TABLE[act] || MET_TABLE['correr-moderado'];
  // kcal = MET × 3.5 × peso / 200 × minutos
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    actividadMostrada: __lang === 'en' ? info.nombreEn : info.nombre,
  };
}
