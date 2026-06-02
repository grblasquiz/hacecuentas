/** VO2max estimado con test de Cooper (12 minutos) */
export interface Inputs { distanciaMetros: number; edad: number; sexo: string; __lang?: string; }
export interface Outputs {
  vo2max: number;
  categoria: string;
  detalle: string;
  _chart?: any;
}

// Tablas ACSM de clasificación VO2max por sexo y edad
// [muy pobre, pobre, regular, buena, excelente, superior]
const TABLAS_HOMBRE: Record<string, number[]> = {
  '20': [33, 37, 42, 46, 52],
  '30': [31, 35, 39, 45, 49],
  '40': [28, 32, 36, 42, 46],
  '50': [25, 29, 33, 39, 43],
  '60': [22, 26, 30, 36, 40],
};

const TABLAS_MUJER: Record<string, number[]> = {
  '20': [28, 32, 36, 41, 46],
  '30': [26, 30, 34, 39, 44],
  '40': [24, 28, 32, 37, 41],
  '50': [21, 25, 29, 34, 38],
  '60': [18, 22, 26, 31, 35],
};

function getCategoria(vo2: number, edad: number, sexo: string, lang: string): string {
  const tabla = sexo === 'mujer' ? TABLAS_MUJER : TABLAS_HOMBRE;
  let decada = '20';
  if (edad >= 60) decada = '60';
  else if (edad >= 50) decada = '50';
  else if (edad >= 40) decada = '40';
  else if (edad >= 30) decada = '30';
  else decada = '20';

  const umbrales = tabla[decada];
  const T = ({
    es: { veryPoor: 'Muy pobre', poor: 'Pobre', fair: 'Regular', good: 'Buena', excellent: 'Excelente', superior: 'Superior' },
    en: { veryPoor: 'Very poor', poor: 'Poor', fair: 'Fair', good: 'Good', excellent: 'Excellent', superior: 'Superior' },
  } as const)[lang as 'es' | 'en'] ?? ({ veryPoor: 'Muy pobre', poor: 'Pobre', fair: 'Regular', good: 'Buena', excellent: 'Excelente', superior: 'Superior' } as const);
  if (vo2 < umbrales[0]) return T.veryPoor;
  if (vo2 < umbrales[1]) return T.poor;
  if (vo2 < umbrales[2]) return T.fair;
  if (vo2 < umbrales[3]) return T.good;
  if (vo2 < umbrales[4]) return T.excellent;
  return T.superior;
}

export function vo2maxCooper(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorDist: 'Ingresá la distancia en metros',
      errorEdad: 'Ingresá tu edad',
      markerLabel: (v: string) => `Tu VO2max: ${v} ml/kg/min`,
      segVeryPoor: 'Muy pobre',
      segPoor: 'Pobre',
      segFair: 'Regular',
      segGood: 'Buena',
      segExcellent: 'Excelente',
      segSuperior: 'Superior',
      ariaLabel: 'Escala VO2max ACSM por edad y sexo: de muy pobre a superior',
      detalle: (dist: string, vo2: string, cat: string, sexo: string, edad: number) =>
        `Test de Cooper: ${dist} m en 12 min → VO2max = ${vo2} ml/kg/min. Categoría: ${cat} para ${sexo} de ${edad} años.`,
      insightTitle: 'Tu capacidad aeróbica',
      insightText: (dist: string, vo2: string, cat: string, sexo: string, edad: number) =>
        `Recorriste **${dist} m** en 12 minutos, lo que estima un **VO2max de ${vo2} ml/kg/min**. Según las tablas ACSM, eso te ubica en la categoría **${cat}** para ${sexo} de ${edad} años.`,
    },
    en: {
      errorDist: 'Enter the distance in meters',
      errorEdad: 'Enter your age',
      markerLabel: (v: string) => `Your VO2max: ${v} ml/kg/min`,
      segVeryPoor: 'Very poor',
      segPoor: 'Poor',
      segFair: 'Fair',
      segGood: 'Good',
      segExcellent: 'Excellent',
      segSuperior: 'Superior',
      ariaLabel: 'VO2max ACSM scale by age and sex: from very poor to superior',
      detalle: (dist: string, vo2: string, cat: string, sexo: string, edad: number) =>
        `Cooper Test: ${dist} m in 12 min → VO2max = ${vo2} ml/kg/min. Category: ${cat} for ${sexo}, age ${edad}.`,
      insightTitle: 'Your aerobic capacity',
      insightText: (dist: string, vo2: string, cat: string, sexo: string, edad: number) =>
        `You covered **${dist} m** in 12 minutes, which estimates a **VO2max of ${vo2} ml/kg/min**. According to ACSM tables, that places you in the **${cat}** category for ${sexo}, age ${edad}.`,
    },
  } as const)[__lang];

  const dist = Number(i.distanciaMetros);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'hombre');
  if (!dist || dist <= 0) throw new Error(T.errorDist);
  if (!edad || edad <= 0) throw new Error(T.errorEdad);

  // Fórmula de Cooper: VO2max = (distancia - 504.9) / 44.73
  const vo2 = (dist - 504.9) / 44.73;
  const cat = getCategoria(vo2, edad, sexo, __lang);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  // Umbrales ACSM para la banda edad/sexo del usuario (para la escala)
  const tablaChart = sexo === 'mujer' ? TABLAS_MUJER : TABLAS_HOMBRE;
  let decadaChart = '20';
  if (edad >= 60) decadaChart = '60';
  else if (edad >= 50) decadaChart = '50';
  else if (edad >= 40) decadaChart = '40';
  else if (edad >= 30) decadaChart = '30';
  const u = tablaChart[decadaChart];
  const topChart = Math.max(u[4] + 8, Math.ceil(vo2) + 4);
  const chart = {
    type: 'scale' as const,
    marker: Number(vo2.toFixed(1)),
    markerLabel: T.markerLabel(String(Number(vo2.toFixed(1)))),
    min: 10,
    unit: '',
    segments: [
      { nombre: T.segVeryPoor, max: u[0], color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.segPoor, max: u[1], color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: T.segFair, max: u[2], color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.segGood, max: u[3], color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: T.segExcellent, max: u[4], color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segSuperior, max: topChart, color: '#a7f3d0', colorDark: '#047857' },
    ],
    ariaLabel: T.ariaLabel,
  };

  const tone = (vo2 >= u[3]) ? 'good' : (vo2 < u[1]) ? 'warn' : 'neutral';
  const sexoLabel = __lang === 'en'
    ? (sexo === 'mujer' ? 'a woman' : 'a man')
    : (sexo === 'mujer' ? 'mujeres' : 'hombres');
  const insight = {
    title: T.insightTitle,
    text: T.insightText(fmt.format(dist), fmt.format(vo2), cat, sexoLabel, edad),
    tone,
    icon: '🫁',
  };

  return {
    vo2max: Number(vo2.toFixed(1)),
    categoria: cat,
    detalle: T.detalle(fmt.format(dist), fmt.format(vo2), cat, sexo, edad),
    _chart: chart,
    _insight: insight,
  };
}
