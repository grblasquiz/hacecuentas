import type { HubData } from './types';

/**
 * Hub de decisión — "¿De qué generación soy?"
 * Arquetipo CÁLCULO DOMINANTE: una sola cuenta manda (`answer`, sin `cases`).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FORMATO: acá NO hay plata. Todas las filas viajan con `format: 'unit'` o
 * `'plain'` y su `unit`, y el resultado declara `format: 'plain'`. El runtime
 * hace Object.assign sobre el formato base, así que una fila sin `format`
 * propio saldría con "$" adelante. `ref` queda para la fuente, no la unidad.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const hub: HubData = {
  slug: 'fechas/generaciones',
  title: '¿De qué generación soy? Boomer, X, Millennial, Z o Alpha según tu año',
  description:
    'Tu generación según el año en que naciste, con los rangos de Pew Research y McCrindle: Silenciosa, Baby Boomer, X, Millennial, Z, Alpha y Beta. Incluye tu edad, la esperanza de vida de tu país y qué porcentaje de tu vida llevás recorrido.',
  silo: 'Fechas',
  siloHref: '/fechas',

  eyebrow: 'Fechas y calendario',
  h1: '¿De qué generación soy?',
  lede:
    'Las generaciones son tramos de años de nacimiento, no personalidades. Poné tu año y te decimos en qué tramo caés, con qué edad llegás a 2026 y cuánto de tu vida esperada llevás recorrido.',
  stamps: ['Actualizado 27-07-2026', 'Rangos Pew Research · McCrindle', '17 calculadoras adentro'],

  resultLabel: 'Tu generación',

  inputsTitle: 'Poné tu año de nacimiento',
  inputsIntro: 'El país y el sexo sólo se usan para la esperanza de vida: la generación depende únicamente del año.',
  fields: [
    { id: 'anio', label: 'Año en que naciste', type: 'number', min: 1900, max: 2026, value: 1990 },
    {
      id: 'sexo',
      label: 'Sexo (para la tabla de mortalidad)',
      type: 'select',
      value: 'f',
      options: [
        { value: 'f', label: 'Femenino' },
        { value: 'm', label: 'Masculino' },
      ],
    },
    {
      id: 'pais',
      label: 'País donde vivís',
      type: 'select',
      value: 'argentina',
      options: [
        { value: 'argentina', label: 'Argentina' },
        { value: 'chile', label: 'Chile' },
        { value: 'colombia', label: 'Colombia' },
        { value: 'espana', label: 'España' },
        { value: 'mexico', label: 'México' },
        { value: 'uruguay', label: 'Uruguay' },
        { value: 'peru', label: 'Perú' },
        { value: 'brasil', label: 'Brasil' },
        { value: 'usa', label: 'Estados Unidos' },
        { value: 'japon', label: 'Japón' },
        { value: 'global', label: 'Promedio mundial' },
      ],
    },
  ],
  fineprint:
    'Los rangos generacionales son convenciones de investigación, no categorías legales: distintos institutos corren los cortes uno o dos años. La esperanza de vida es un promedio poblacional, no un pronóstico personal.',

  chart: {
    type: 'timeline',
    title: 'La línea de las generaciones',
    caption:
      'Cada franja es un tramo de años de nacimiento. El marcador señala dónde cae tu año dentro de la línea, entre la Generación Silenciosa y la Beta.',
  },
  breakdownTitle: 'Tu año, tu generación y tu tiempo',
  breakdownIntro: 'Cada fila muestra su propia unidad junto al número. Ninguna es plata.',

  answer: {
    title: 'Cómo se define una generación',
    copy:
      'Una generación es un tramo de años de nacimiento que comparte los mismos hitos históricos y tecnológicos en la misma etapa de la vida. Los cortes más usados son los de Pew Research Center para Boomer, X, Millennial y Z, y los de Mark McCrindle para Alpha y Beta. No hay una definición legal ni un organismo que las fije.',
    yes: [
      'Generación Silenciosa: 1928–1945. Depresión, Segunda Guerra y posguerra',
      'Baby Boomer: 1946–1964. El baby boom de posguerra, la TV y el rock',
      'Generación X: 1965–1980. Analógicos de chicos, digitales de adultos',
      'Millennial (Gen Y): 1981–1996. Los primeros nativos de internet',
      'Generación Z: 1997–2012. No conocieron un mundo sin smartphone',
      'Generación Alpha: 2013–2024. Tablets, asistentes de voz e IA desde bebés',
      'Generación Beta: 2025 en adelante, todavía en formación',
    ],
    warn: [
      'Los cortes varían: Pew ubica el fin de los Millennials en 1996, pero otros institutos lo estiran hasta 1997 o 2000.',
      'Si naciste en el primer o el último año de un tramo sos "cúspide" y solés reconocerte en las dos generaciones vecinas.',
      'La edad que ves acá es la que cumplís durante 2026: si tu cumpleaños todavía no pasó, hoy tenés un año menos.',
      'La esperanza de vida es un promedio del país y del sexo, no una predicción individual: no incorpora tu salud ni tus hábitos.',
    ],
    plazo:
      'la Generación Beta arrancó el 1 de enero de 2025 y, según la convención de McCrindle, se extiende hasta 2039.',
  },

  faq: [
    {
      q: '¿De qué generación soy si nací en 1990?',
      a: 'Sos Millennial, también llamada Generación Y: el tramo va de 1981 a 1996 según Pew Research Center. Los nacidos en 1990 tienen memoria del mundo previo al smartphone pero adoptaron internet en la adolescencia, que es justamente el rasgo que define al tramo.',
    },
    {
      q: '¿Cuáles son los años exactos de cada generación?',
      a: 'Generación Silenciosa 1928–1945; Baby Boomer 1946–1964; Generación X 1965–1980; Millennial 1981–1996; Generación Z 1997–2012; Generación Alpha 2013–2024; Generación Beta desde 2025. Los cuatro primeros cortes son los de Pew Research Center y los dos últimos los de la consultora McCrindle, que fue la que acuñó los nombres Alpha y Beta.',
    },
    {
      q: '¿Un nacido en 1996 es Millennial o Gen Z?',
      a: 'Con el criterio de Pew, 1996 es el último año Millennial y 1997 el primero de la Gen Z. Es un caso típico de "cúspide": quienes nacieron entre 1994 y 1999 suelen identificarse con las dos, y algunos autores les dan el nombre informal de Zillennials.',
    },
    {
      q: '¿Qué es la Generación Alpha y qué la Beta?',
      a: 'Alpha son los nacidos entre 2013 y 2024, hijos mayormente de Millennials y la primera camada criada con tablets y asistentes de voz desde bebés. Beta arrancó el 1 de enero de 2025 y se proyecta hasta 2039: nace en un mundo donde la inteligencia artificial generativa ya es cotidiana.',
    },
    {
      q: '¿Quién decide dónde empieza y termina una generación?',
      a: 'Nadie con autoridad oficial. Son convenciones de investigación social: Pew Research Center fijó 1946–1964 para los Boomers a partir del pico de natalidad de posguerra y definió los cortes siguientes; Mark McCrindle nombró a Alpha y Beta. Otros institutos usan cortes distintos, por eso hay tablas que difieren en uno o dos años.',
    },
    {
      q: '¿Qué porcentaje de mi vida llevo vivido?',
      a: 'Se divide tu edad actual por la esperanza de vida de tu país y sexo. Con 36 años y una esperanza de 79,7 (mujer, Argentina) llevás recorrido el 45,2%. Es una referencia estadística poblacional: no dice nada sobre tu caso particular, y la esperanza de vida sube a medida que la persona envejece.',
    },
    {
      q: '¿Cuántas horas de vida me quedan?',
      a: 'Se toman los años que faltan hasta la esperanza de vida, se multiplican por 365,25 días y por 24 horas. Sólo unas dos terceras partes de esas horas se viven despiertas: descontando unas 8 horas de sueño por día, queda alrededor del 67% del total.',
    },
    {
      q: '¿Cuál es la esperanza de vida en Argentina?',
      a: 'Alrededor de 73,2 años para varones y 79,7 para mujeres, según las tablas de mortalidad del INDEC y las estimaciones del Banco Mundial. La brecha por sexo de unos seis años es persistente y se repite en casi todos los países de la región.',
    },
    {
      q: '¿Qué edad tengo en otros planetas?',
      a: 'La edad no es más que la cantidad de vueltas al Sol que diste, así que cambia con el período orbital de cada planeta. Mercurio tarda 88 días terrestres en dar una vuelta, así que ahí tendrías cuatro veces más años; Marte tarda 1,88 años terrestres, así que tu edad marciana es tu edad dividida por 1,88.',
    },
    {
      q: '¿Las generaciones sirven para explicar la personalidad?',
      a: 'Poco. Investigadores como Bobby Duffy y el propio Pew advierten que las diferencias dentro de una generación son mayores que las diferencias entre generaciones, y que buena parte de lo que se atribuye a la cohorte es en realidad efecto de la edad o del momento histórico. Sirven para leer contextos compartidos, no para predecir cómo es alguien.',
    },
  ],

  sources: [
    {
      name: 'Defining generations: Where Millennials end and Generation Z begins',
      url: 'https://www.pewresearch.org/short-reads/2019/01/17/where-millennials-end-and-generation-z-begins/',
      publisher: 'Pew Research Center',
      date: '17-01-2019',
    },
    {
      name: 'Generación Alpha y Generación Beta — definición de los tramos',
      url: 'https://mccrindle.com.au/article/topic/generation-alpha/generation-alpha-defined/',
      publisher: 'McCrindle Research',
    },
    {
      name: 'Tablas abreviadas de mortalidad y esperanza de vida por sexo',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-2-24-119',
      publisher: 'INDEC',
    },
    {
      name: 'Life expectancy at birth, total (years)',
      url: 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN',
      publisher: 'Banco Mundial',
    },
    {
      name: 'Planetary Fact Sheet — períodos orbitales',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
      publisher: 'NASA — NSSDC',
    },
  ],

  replaces: [
    '/calculadora-generacion-perteneces',
    '/calculadora-que-generacion-sos',
    '/calculadora-expectativa-vida',
    '/calculadora-horas-vida-restantes',
    '/calculadora-vida-utilizada-porcentaje',
    '/calculadora-edad-planeta',
    '/calculadora-biorhythm',
    '/calculadora-piedra-nacimiento',
    '/calculadora-angel-guardian-fecha',
    '/calculadora-planeta-regente',
    '/calculadora-numero-camino-vida',
    '/calculadora-love-calculator',
    '/calculadora-compatibilidad-nombres',
    '/calculadora-test-lenguaje-amor',
    '/calculadora-nombre-rapper',
    '/calculadora-nombre-estrella-wars',
    '/calculadora-nombre-elfo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Año de referencia del cálculo de edad (edad que cumplís durante el año). */
export const ANIO_ACTUAL = 2026;

/**
 * Tramos generacionales. Cortes de Pew Research Center (Silenciosa → Z) y de
 * McCrindle Research (Alpha y Beta).
 */
export const GENERACIONES: Array<{ nombre: string; corto: string; desde: number; hasta: number }> = [
  { nombre: 'Generación Silenciosa', corto: 'Silenciosa', desde: 1928, hasta: 1945 },
  { nombre: 'Baby Boomer', corto: 'Boomer', desde: 1946, hasta: 1964 },
  { nombre: 'Generación X', corto: 'X', desde: 1965, hasta: 1980 },
  { nombre: 'Millennial (Gen Y)', corto: 'Millennial', desde: 1981, hasta: 1996 },
  { nombre: 'Generación Z', corto: 'Z', desde: 1997, hasta: 2012 },
  { nombre: 'Generación Alpha', corto: 'Alpha', desde: 2013, hasta: 2024 },
  { nombre: 'Generación Beta', corto: 'Beta', desde: 2025, hasta: 2039 },
];

/** Esperanza de vida al nacer por país y sexo (Banco Mundial / INDEC). */
export const ESPERANZA_VIDA: Record<string, { m: number; f: number }> = {
  argentina: { m: 73.2, f: 79.7 },
  chile: { m: 77.5, f: 82.8 },
  colombia: { m: 74.1, f: 80.3 },
  espana: { m: 81.2, f: 86.3 },
  mexico: { m: 73.1, f: 78.8 },
  uruguay: { m: 74.0, f: 81.3 },
  peru: { m: 73.5, f: 78.5 },
  brasil: { m: 73.2, f: 80.2 },
  usa: { m: 76.3, f: 81.4 },
  japon: { m: 81.5, f: 87.6 },
  global: { m: 71.0, f: 76.0 },
};

/** Período orbital de Marte en años terrestres (NASA Planetary Fact Sheet). */
export const PERIODO_MARTE = 1.8809;
/** Período orbital de Mercurio en años terrestres. */
export const PERIODO_MERCURIO = 0.2408;
/** Proporción del tiempo que se vive despierto (~16 h de 24). */
export const FRACCION_DESPIERTO = 0.67;
