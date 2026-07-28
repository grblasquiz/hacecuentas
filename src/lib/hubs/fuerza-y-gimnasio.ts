import type { HubData } from './types';

/**
 * Hub de decisión — "Cuánto levanto y cuánto descanso".
 *
 * Números espejados de:
 *   src/lib/formulas/rm.ts                                 (Epley / Brzycki / Lombardi + escalera de %)
 *   src/lib/formulas/tabla-wilks-powerlifting-score.ts      (coeficientes Wilks y umbrales de nivel)
 *   src/lib/formulas/descanso-series.ts                     (base + ajuste intensidad + ajuste grupo)
 *   src/lib/formulas/recuperacion-muscular-horas.ts         (horas base por grupo y modificadores)
 *   src/lib/formulas/frecuencia-entrenamiento-grupo-muscular.ts (frecuencia por nivel)
 */

export const DISCLAIMER_SPORTS =
  'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.';

export const hub: HubData = {
  slug: 'salud/fuerza-y-gimnasio',
  title: '¿Cuánto peso levanto y cuánto descanso? — 1RM, Wilks, series y recuperación',
  description:
    'Tu 1RM con Epley, Brzycki y Lombardi, la escalera de cargas por porcentaje, tu score Wilks, el descanso entre series y cuántas horas necesita cada músculo para volver a entrenar.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Fuerza y gimnasio',
  h1: 'Cuánto levantás, cuánto descansás y cuándo volvés a entrenar',
  lede:
    'Arrancamos por la pregunta más común del gimnasio: cuál es tu máximo de una repetición y qué cargas te tocan según el objetivo. Si tu duda es otra —descanso, frecuencia o recuperación— la cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Epley · Brzycki · Lombardi · Wilks', '10 calculadoras adentro'],

  resultLabel: 'Tu número',

  cases: {
    title: '¿Qué querés saber?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'rm',
        label: 'Cuál es mi 1RM (máximo de una repetición)',
        hint: 'Peso × repeticiones',
        answer: 'Con una serie submáxima de 3 a 6 reps la estimación del 1RM es confiable.',
        yes: [
          'Promedio de tres fórmulas: Epley, Brzycki y Lombardi',
          'La escalera de cargas: qué peso te toca al 95%, 90%, 85%, 80%, 75%, 70% y 65%',
          'Sirve para cualquier ejercicio: press de banca, sentadilla, peso muerto',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'Con más de 6 repeticiones las tres fórmulas se separan y el número queda inflado: retestealo con una serie de 3 a 5 reps',
        ],
        plazo: 'retesteá el 1RM cada 6 a 8 semanas, no todas las semanas.',
      },
      {
        id: 'wilks',
        label: 'Qué tan fuerte soy comparado con otros',
        hint: 'Score Wilks',
        answer: 'El Wilks normaliza tu total por peso corporal, así comparás contra cualquier categoría.',
        yes: [
          'Score Wilks a partir del total (sentadilla + banca + peso muerto) y tu peso corporal',
          'Coeficiente de la fórmula oficial, distinto para hombres y mujeres',
          'En qué nivel caés: principiante, intermedio, avanzado, élite, mundial',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'El coeficiente Wilks está definido entre 40 y 250 kg de peso corporal: fuera de ese rango no aplica',
        ],
        plazo: 'usá tu mejor total válido de competencia o de un test controlado.',
      },
      {
        id: 'descanso',
        label: 'Cuánto descanso entre series',
        hint: 'Fuerza, hipertrofia o resistencia',
        answer: 'El descanso lo manda el objetivo: fuerza pide minutos, resistencia segundos.',
        yes: [
          'Fuerza máxima: 3 a 5 minutos para recuperar la fosfocreatina',
          'Hipertrofia: 90 a 180 segundos, el equilibrio entre carga y estrés metabólico',
          'Resistencia muscular: 30 a 60 segundos, con el pulso arriba',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'Un ejercicio grande (sentadilla, peso muerto) suma tiempo de descanso; uno chico (bíceps, tríceps) lo baja',
        ],
        plazo: 'si la serie siguiente cae más de 2 reps respecto de la anterior, descansaste poco.',
      },
      {
        id: 'recuperacion',
        label: 'Cuándo puedo volver a entrenar el mismo músculo',
        hint: 'Horas de recuperación',
        answer: 'Cada grupo muscular tiene su ventana, y la edad y el sueño la estiran.',
        yes: [
          'Horas de recuperación según el grupo entrenado y la intensidad de la sesión',
          'Ajuste por edad: la ventana se alarga a partir de los 35',
          'Ajuste por sueño: dormir menos de 6 horas la alarga un 30%',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'Entrenar un músculo todavía dolorido no acelera nada: retrasa la adaptación',
        ],
        plazo: 'si el dolor supera las 72 horas, bajá el volumen de la próxima sesión.',
      },
      {
        id: 'frecuencia',
        label: 'Cuántas veces por semana entreno cada grupo',
        hint: 'Frecuencia semanal',
        answer: 'Repartir el volumen en más sesiones rinde más que concentrarlo en una.',
        yes: [
          'Principiante: 3 sesiones full body por semana',
          'Intermedio: 2 a 3 estímulos por grupo muscular',
          'Avanzado: 3 a 4 estímulos por grupo muscular',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'Subir la frecuencia sin bajar el volumen por sesión es la vía rápida al sobreentrenamiento',
        ],
        plazo: 'sostené una frecuencia al menos 6 semanas antes de cambiarla.',
      },
    ],
  },

  inputsTitle: 'Completá lo que corresponda a tu caso',
  inputsIntro: 'Los campos que no aplican a tu pregunta se ignoran. Podés dejar los valores de ejemplo.',
  fields: [
    { id: 'peso', label: 'Peso levantado en la serie (kg)', type: 'number', min: 1, step: 0.5, value: 100 },
    { id: 'reps', label: 'Repeticiones completadas', type: 'number', min: 1, max: 15, value: 5 },
    { id: 'pesoCorporal', label: 'Tu peso corporal (kg)', type: 'number', min: 40, max: 250, step: 0.5, value: 80 },
    { id: 'total', label: 'Total de powerlifting: sentadilla + banca + peso muerto (kg)', type: 'number', min: 1, value: 450 },
    {
      id: 'sexo',
      label: 'Coeficiente Wilks',
      type: 'select',
      value: 'masculino',
      options: [
        { value: 'masculino', label: 'Masculino' },
        { value: 'femenino', label: 'Femenino' },
      ],
    },
    {
      id: 'objetivo',
      label: 'Objetivo del entrenamiento',
      type: 'select',
      value: 'hipertrofia',
      options: [
        { value: 'fuerza', label: 'Fuerza máxima' },
        { value: 'hipertrofia', label: 'Hipertrofia' },
        { value: 'resistencia', label: 'Resistencia muscular' },
      ],
    },
    {
      id: 'intensidad',
      label: 'Intensidad de la sesión',
      type: 'select',
      value: 'media',
      options: [
        { value: 'baja', label: 'Baja' },
        { value: 'media', label: 'Media' },
        { value: 'alta', label: 'Alta' },
      ],
    },
    {
      id: 'grupo',
      label: 'Grupo muscular',
      type: 'select',
      value: 'piernas',
      options: [
        { value: 'piernas', label: 'Piernas' },
        { value: 'espalda', label: 'Espalda' },
        { value: 'pecho', label: 'Pecho' },
        { value: 'hombros', label: 'Hombros' },
        { value: 'biceps', label: 'Bíceps' },
        { value: 'triceps', label: 'Tríceps' },
        { value: 'abdominales', label: 'Abdominales' },
      ],
    },
    { id: 'edad', label: 'Tu edad', type: 'number', min: 12, max: 90, value: 30 },
    { id: 'sueno', label: 'Horas que dormís por noche', type: 'number', min: 3, max: 12, step: 0.5, value: 7 },
    {
      id: 'nivel',
      label: 'Tu nivel entrenando',
      type: 'select',
      value: 'intermedio',
      options: [
        { value: 'principiante', label: 'Principiante (menos de 1 año)' },
        { value: 'intermedio', label: 'Intermedio (1 a 3 años)' },
        { value: 'avanzado', label: 'Avanzado (más de 3 años)' },
      ],
    },
  ],
  fineprint: DISCLAIMER_SPORTS,

  chart: {
    type: 'bars',
    title: 'Tu número contra las alternativas',
    caption:
      'Las barras comparan el resultado de tu caso con las otras opciones posibles: las cargas por porcentaje del 1RM, los umbrales de Wilks, el descanso de cada objetivo o las horas que pide cada músculo.',
  },
  breakdownTitle: 'El detalle del cálculo',
  breakdownIntro: 'Cada fila muestra de dónde sale el número y con qué fórmula.',

  faq: [
    {
      q: '¿Cuál de las tres fórmulas de 1RM es la más precisa?',
      a: 'Ninguna gana siempre. Brzycki suele quedar más conservadora arriba de 10 repeticiones, Epley más optimista, y Lombardi se comporta parejo en el medio. Por eso el resultado que mostramos es el promedio de las tres: reduce el sesgo de cualquiera de ellas.',
    },
    {
      q: '¿Con cuántas repeticiones conviene testear el 1RM?',
      a: 'Entre 3 y 6. Por debajo de 3 el test se acerca a un intento máximo real y sube el riesgo; por encima de 6 la fatiga y la técnica desvían el resultado y las fórmulas empiezan a separarse entre sí.',
    },
    {
      q: '¿Qué porcentaje del 1RM uso para hipertrofia?',
      a: 'El rango clásico es 70-80% del 1RM, que suele caer entre 8 y 12 repeticiones. Para fuerza máxima se trabaja del 85% para arriba con 1 a 5 repeticiones, y para resistencia muscular del 65% para abajo.',
    },
    {
      q: '¿Qué es el score Wilks y para qué sirve?',
      a: 'Es un coeficiente que corrige tu total de powerlifting por tu peso corporal, para poder comparar a un atleta de 60 kg con uno de 120 kg. Se calcula con un polinomio de quinto grado distinto para hombres y mujeres.',
    },
    {
      q: '¿Qué Wilks se considera un buen nivel?',
      a: 'Como referencia: por debajo de 200 es principiante, 200-300 intermedio, 300-400 avanzado, 400-450 élite, 450-500 nivel mundial y por encima de 500 histórico. Son umbrales orientativos, no categorías federativas.',
    },
    {
      q: '¿Por qué para fuerza hay que descansar tanto entre series?',
      a: 'Porque el sistema ATP-fosfocreatina, que alimenta los esfuerzos máximos de pocos segundos, tarda entre 3 y 5 minutos en recargarse. Con menos descanso vas a mover menos peso en la serie siguiente, que es justo lo contrario del objetivo.',
    },
    {
      q: '¿Cuántas horas tarda un músculo en recuperarse?',
      a: 'Depende del grupo: las piernas necesitan unas 60 horas de base, la espalda 56, pecho y hombros 48, brazos 36 y abdominales 24. Sobre esa base la intensidad alta suma un 35%, y los años y el mal sueño la estiran todavía más.',
    },
    {
      q: '¿Dormir poco realmente afecta la recuperación muscular?',
      a: 'Sí, y bastante. Dormir menos de 6 horas alarga la ventana de recuperación cerca de un 30%, y entre 6 y 7 horas la alarga un 15%. Es la variable más accionable de todas: cambiarla no cuesta nada y rinde más que sumar suplementos.',
    },
    {
      q: '¿Conviene entrenar cada músculo una vez o varias por semana?',
      a: 'Para principiantes, 3 sesiones full body por semana rinden más que la rutina dividida clásica. Desde nivel intermedio, repartir el volumen semanal en 2 o 3 estímulos por grupo produce mejores resultados que concentrar todo en un solo día.',
    },
    {
      q: '¿Sirve el 1RM estimado para programar cargas reales?',
      a: 'Sí, es su uso principal. Lo que no conviene es usarlo para intentar un récord: el número es una estimación estadística, no una garantía de que ese peso se levanta. Programá con él y validá con series submáximas.',
    },
    {
      q: '¿El 1RM sirve igual para press de banca que para sentadilla?',
      a: 'Las fórmulas son las mismas, pero en la práctica los ejercicios de tren inferior toleran más repeticiones a un mismo porcentaje que los de tren superior. En sentadilla y peso muerto la estimación tiende a quedar algo baja, y en banca algo alta.',
    },
    {
      q: '¿Cómo sé si estoy sobreentrenando?',
      a: 'Las señales típicas son rendimiento que cae varias sesiones seguidas, dolor muscular que pasa las 72 horas, sueño alterado y pulso en reposo más alto de lo habitual. Ante ese cuadro, bajá el volumen antes de bajar la frecuencia.',
    },
  ],

  sources: [
    {
      name: 'Epley B. — Poundage Chart, Boyd Epley Workout (fórmula de 1RM)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9040895/',
      publisher: 'Journal of Strength and Conditioning Research (validación comparativa de fórmulas)',
    },
    {
      name: 'Brzycki M. — Strength Testing: Predicting a One-Rep Max from Reps-to-Fatigue',
      url: 'https://www.tandfonline.com/doi/abs/10.1080/07303084.1993.10606684',
      publisher: 'Journal of Physical Education, Recreation & Dance',
      date: '1993',
    },
    {
      name: 'Wilks Coefficient — fórmula oficial de powerlifting',
      url: 'https://www.powerlifting.sport/rules/codes/info/technical-rules',
      publisher: 'International Powerlifting Federation (IPF)',
    },
    {
      name: 'Schoenfeld B. et al. — Longer interset rest periods enhance muscle strength and hypertrophy',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26605807/',
      publisher: 'Journal of Strength and Conditioning Research',
      date: '2016',
    },
    {
      name: 'ACSM Position Stand — Progression Models in Resistance Training for Healthy Adults',
      url: 'https://journals.lww.com/acsm-msse/fulltext/2009/03000/progression_models_in_resistance_training_for.26.aspx',
      publisher: 'American College of Sports Medicine',
    },
  ],

  replaces: [
    '/calculadora-1rm-peso-maximo-levantamiento',
    '/calculadora-1rm-press-banca-estimador',
    '/calculadora-1rm-sentadilla-estimador',
    '/calculadora-repeticion-maxima-estimada',
    '/calculadora-repeticiones-maximas-epley-brzycki',
    '/calculadora-tabla-wilks-powerlifting-score',
    '/calculadora-descanso-entre-series-gimnasio',
    '/calculadora-frecuencia-entrenamiento-grupo-muscular',
    '/calculadora-recuperacion-muscular-horas',
    '/calculadora-periodizacion-entrenamiento',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-volumen-semanal-hipertrofia-musculo-series',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Coeficientes Wilks oficiales — espejo de tabla-wilks-powerlifting-score.ts */
export const WILKS = {
  masculino: { a: -216.0475144, b: 16.2606339, c: -0.002388645, d: -0.00113732, e: 7.01863e-6, f: -1.291e-8 },
  femenino: { a: 594.31747775582, b: -27.23842536447, c: 0.82112226871, d: -0.00930733913, e: 4.731582e-5, f: -9.054e-8 },
};

/** Umbrales de nivel Wilks — espejo de getNivel(). */
export const WILKS_NIVELES = [
  { label: 'Principiante', hasta: 200 },
  { label: 'Intermedio', hasta: 300 },
  { label: 'Avanzado', hasta: 400 },
  { label: 'Élite', hasta: 450 },
  { label: 'Nivel mundial', hasta: 500 },
  { label: 'All-time great', hasta: Infinity },
];

/** Descanso entre series — espejo de descanso-series.ts (segundos). */
export const DESCANSO = {
  base: { fuerza: 210, hipertrofia: 90, resistencia: 40 } as Record<string, number>,
  intensidad: { baja: -15, media: 15, alta: 40 } as Record<string, number>,
  /** El original distingue grupo grande (+20 s) de pequeño (−10 s). */
  grupoGrande: 20,
  grupoPequeno: -10,
};

/** Qué grupos cuentan como "grande" para el ajuste de descanso. */
export const GRUPOS_GRANDES = ['piernas', 'espalda', 'pecho'];

/** Recuperación muscular — espejo de recuperacion-muscular-horas.ts (horas base). */
export const RECUPERACION_BASE: Record<string, number> = {
  piernas: 60,
  espalda: 56,
  pecho: 48,
  hombros: 48,
  biceps: 36,
  triceps: 36,
  abdominales: 24,
};

/** Frecuencia semanal por nivel — espejo de frecuencia-entrenamiento-grupo-muscular.ts. */
export const FRECUENCIA: Record<string, { texto: string; valor: number }> = {
  principiante: { texto: '3 sesiones full body', valor: 3 },
  intermedio: { texto: '2-3 por grupo', valor: 2.5 },
  avanzado: { texto: '3-4 por grupo', valor: 3.5 },
};

/** Escalera de cargas por % del 1RM — espejo de rm.ts. */
export const ESCALERA = [
  { pct: 95, reps: 2 },
  { pct: 90, reps: 4 },
  { pct: 85, reps: 6 },
  { pct: 80, reps: 8 },
  { pct: 75, reps: 10 },
  { pct: 70, reps: 12 },
  { pct: 65, reps: 15 },
];
