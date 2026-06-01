/** Calorías quemadas en bici según velocidad, peso y tiempo */
export interface Inputs {
  peso: number;
  intensidad: string;
  minutos: number;
  __lang?: string;
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  intensidadMostrada: string;
  equivalenteKm: number;
  resumen: string;
}

const MET_BICI: Record<string, { met: number; nombre: string; nombreEn: string; kmh: number }> = {
  'paseo-tranquilo': { met: 3.5, nombre: 'Paseo tranquilo (<16 km/h)', nombreEn: 'Easy ride (<16 km/h)', kmh: 14 },
  'suave': { met: 5.8, nombre: 'Suave (16-19 km/h)', nombreEn: 'Light (16-19 km/h)', kmh: 17 },
  'moderado': { met: 7.5, nombre: 'Moderado (19-22 km/h)', nombreEn: 'Moderate (19-22 km/h)', kmh: 21 },
  'vigoroso': { met: 10.0, nombre: 'Vigoroso (22-26 km/h)', nombreEn: 'Vigorous (22-26 km/h)', kmh: 24 },
  'carrera': { met: 12.0, nombre: 'Carrera (26-30 km/h)', nombreEn: 'Racing (26-30 km/h)', kmh: 28 },
  'competicion': { met: 15.8, nombre: 'Competición (>30 km/h)', nombreEn: 'Competition (>30 km/h)', kmh: 32 },
  'spinning': { met: 8.5, nombre: 'Spinning/indoor', nombreEn: 'Spinning/indoor', kmh: 0 },
  'mtb-suave': { met: 8.5, nombre: 'Mountain bike suave', nombreEn: 'Mountain bike easy', kmh: 15 },
  'mtb-intenso': { met: 14.0, nombre: 'Mountain bike intenso', nombreEn: 'Mountain bike intense', kmh: 20 },
};

export function caloriasCiclismo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      errorMinutos: 'Ingresá los minutos',
    },
    en: {
      errorPeso: 'Enter your weight',
      errorMinutos: 'Enter the minutes',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const int = String(i.intensidad || 'moderado');

  if (!peso || peso <= 0) throw new Error(T.errorPeso);
  if (!min || min <= 0) throw new Error(T.errorMinutos);

  const info = MET_BICI[int] || MET_BICI['moderado'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;
  const km = (info.kmh * min) / 60;

  const nombreLang = __lang === 'en' ? info.nombreEn : info.nombre;

  const resumen = __lang === 'en'
    ? `Cycling **${info.nombreEn}** for ${min} min you burn **${Math.round(total)} kcal** (approx ${km.toFixed(1)} km covered, MET ${info.met}).`
    : `Pedaleando **${info.nombre}** durante ${min} min quemás **${Math.round(total)} kcal** (aprox ${km.toFixed(1)} km recorridos, MET ${info.met}).`;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    intensidadMostrada: nombreLang,
    equivalenteKm: Number(km.toFixed(1)),
    resumen,
  };
}
