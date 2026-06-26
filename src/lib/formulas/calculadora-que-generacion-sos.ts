/**
 * ¿Qué generación sos? Según el año de nacimiento.
 * Rangos: Silenciosa ≤1945, Boomer 1946–1964, X 1965–1980, Millennial 1981–1996,
 * Z 1997–2012, Alpha 2013–2024, Beta ≥2025.
 * Fuentes: Pew Research Center (Boomer–Z) y Mark McCrindle (Alpha/Beta). Ver sources en el JSON.
 */
export interface Inputs {
  anioNacimiento: number;
  __lang?: string;
}
export interface Outputs {
  generacion: string;
  rango: string;
  edadAprox: number;
  descripcion: string;
  formula: string;
  _insight?: any;
}

const ANIO_ACTUAL = 2026;

interface Gen {
  min: number;
  max: number;
  es: { nombre: string; rango: string; desc: string };
  en: { nombre: string; rango: string; desc: string };
  icon: string;
}

const GENERACIONES: Gen[] = [
  {
    min: 1900,
    max: 1945,
    icon: '📻',
    es: {
      nombre: 'Generación Silenciosa',
      rango: '1928–1945',
      desc: 'Crecieron entre la Gran Depresión y la Segunda Guerra Mundial. Valoran el ahorro, la disciplina y el respeto por las instituciones.',
    },
    en: {
      nombre: 'Silent Generation',
      rango: '1928–1945',
      desc: 'Grew up between the Great Depression and World War II. They value saving, discipline and respect for institutions.',
    },
  },
  {
    min: 1946,
    max: 1964,
    icon: '☮️',
    es: {
      nombre: 'Baby Boomer',
      rango: '1946–1964',
      desc: 'Nacidos en el baby boom de posguerra. Vivieron la TV en color, el rock y los grandes cambios sociales de los 60 y 70.',
    },
    en: {
      nombre: 'Baby Boomer',
      rango: '1946–1964',
      desc: 'Born during the post-war baby boom. They lived through color TV, rock and the social upheavals of the 60s and 70s.',
    },
  },
  {
    min: 1965,
    max: 1980,
    icon: '📼',
    es: {
      nombre: 'Generación X',
      rango: '1965–1980',
      desc: 'La generación de la transición analógica-digital: crecieron con el VHS y el walkman, y se adaptaron a internet de adultos.',
    },
    en: {
      nombre: 'Generation X',
      rango: '1965–1980',
      desc: 'The analog-to-digital transition generation: raised on VHS and the Walkman, they adopted the internet as adults.',
    },
  },
  {
    min: 1981,
    max: 1996,
    icon: '💻',
    es: {
      nombre: 'Millennial (Generación Y)',
      rango: '1981–1996',
      desc: 'Los primeros nativos de internet. Crecieron con el cambio de milenio, las redes sociales y los smartphones.',
    },
    en: {
      nombre: 'Millennial (Generation Y)',
      rango: '1981–1996',
      desc: 'The first internet natives. They grew up with the turn of the millennium, social media and smartphones.',
    },
  },
  {
    min: 1997,
    max: 2012,
    icon: '📱',
    es: {
      nombre: 'Generación Z',
      rango: '1997–2012',
      desc: 'Verdaderos nativos digitales: no conocieron un mundo sin internet ni teléfonos táctiles. Crecieron con YouTube y TikTok.',
    },
    en: {
      nombre: 'Generation Z',
      rango: '1997–2012',
      desc: 'True digital natives: they never knew a world without the internet or touchscreens. Raised on YouTube and TikTok.',
    },
  },
  {
    min: 2013,
    max: 2024,
    icon: '🎮',
    es: {
      nombre: 'Generación Alpha',
      rango: '2013–2024',
      desc: 'La primera generación enteramente nacida en el siglo XXI. Crecen con tablets, asistentes de voz e inteligencia artificial.',
    },
    en: {
      nombre: 'Generation Alpha',
      rango: '2013–2024',
      desc: 'The first generation born entirely in the 21st century. Growing up with tablets, voice assistants and artificial intelligence.',
    },
  },
  {
    min: 2025,
    max: 2099,
    icon: '🤖',
    es: {
      nombre: 'Generación Beta',
      rango: '2025–2039 (proyectada)',
      desc: 'La generación que recién empieza. Nacerá en un mundo de IA generativa cotidiana, autos autónomos y realidad inmersiva.',
    },
    en: {
      nombre: 'Generation Beta',
      rango: '2025–2039 (projected)',
      desc: 'The generation just beginning. Born into a world of everyday generative AI, autonomous cars and immersive reality.',
    },
  },
];

export function queGeneracionSos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorAnio: 'Ingresá un año de nacimiento entre 1900 y 2026',
      insightTitle: 'Tu generación',
      sos: 'Sos de la',
      tenes: 'tenés (o cumplís)',
      anios: 'años en 2026',
    },
    en: {
      errorAnio: 'Enter a birth year between 1900 and 2026',
      insightTitle: 'Your generation',
      sos: "You're",
      tenes: 'you turn',
      anios: 'in 2026',
    },
  } as const)[__lang];

  const anio = Math.floor(Number(i.anioNacimiento));
  if (!anio || anio < 1900 || anio > ANIO_ACTUAL) throw new Error(T.errorAnio);

  const gen = GENERACIONES.find((g) => anio >= g.min && anio <= g.max)!;
  const info = gen[__lang];
  const edadAprox = ANIO_ACTUAL - anio;

  const insight = {
    title: T.insightTitle,
    text:
      __lang === 'en'
        ? `Born in **${anio}**, you belong to the **${info.nombre}** (${info.rango}). In 2026 you turn around **${edadAprox}** years old. ${info.desc}`
        : `Naciste en **${anio}**, así que sos de la **${info.nombre}** (${info.rango}). En 2026 tenés (o cumplís) unos **${edadAprox}** años. ${info.desc}`,
    tone: 'good' as const,
    icon: gen.icon,
  };

  return {
    generacion: info.nombre,
    rango: info.rango,
    edadAprox,
    descripcion: info.desc,
    formula:
      __lang === 'en'
        ? `Born ${anio} → ${info.nombre} (${info.rango}) · age ≈ ${ANIO_ACTUAL} − ${anio} = ${edadAprox}`
        : `Nacido en ${anio} → ${info.nombre} (${info.rango}) · edad ≈ ${ANIO_ACTUAL} − ${anio} = ${edadAprox}`,
    _insight: insight,
  };
}
