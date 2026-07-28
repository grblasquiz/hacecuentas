import type { HubData } from './types';

/**
 * Hub de decisión — "Me anoté a una carrera: ¿cuántas semanas necesito?".
 *
 * Números espejados de:
 *   src/lib/formulas/plan-entrenamiento-5k-semanas.ts
 *   src/lib/formulas/plan-entrenamiento-21k-semi-maraton-semanas.ts
 *   src/lib/formulas/plan-entrenamiento-maraton-42k-semanas.ts
 *   src/lib/formulas/plan-maraton-semanas.ts        (progresión, deload y taper)
 *   src/lib/formulas/tiempo-meta-maraton.ts         (Riegel, exponente 1,06)
 *   src/lib/formulas/descanso-post-maraton-regla-1-dia-km.ts
 */

export const DISCLAIMER_SPORTS =
  'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.';

export const hub: HubData = {
  slug: 'salud/plan-de-carrera',
  title: 'Me anoté a una carrera: ¿cuántas semanas de plan necesito? — 5K, 21K y maratón',
  description:
    'Cuántas semanas de entrenamiento necesitás para 5K, media maratón o maratón según tu nivel, con qué pico de kilómetros semanales, qué tiempo podés hacer según Riegel y cuántos días descansar después.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Running y planes de entrenamiento',
  h1: 'Te anotaste a una carrera. Veamos si llegás.',
  lede:
    'Partimos de la distancia más habitual entre quienes empiezan, el 5K. Si tu carrera es otra, o querés saber el tiempo que podés hacer, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Planes ACSM · fórmula de Riegel', '6 calculadoras adentro'],

  resultLabel: 'Tu plan',

  cases: {
    title: '¿Para qué carrera te estás preparando?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: '5k',
        label: 'Un 5K',
        hint: 'La distancia de entrada',
        answer: 'Un 5K se prepara en 5 a 10 semanas según de dónde partas.',
        yes: [
          'Principiante: 10 semanas, pico de 28 km/semana, 3 días de corrida',
          'Intermedio: 7 semanas, pico de 40 km/semana, 4 días',
          'Avanzado: 5 semanas, pico de 58 km/semana, 6 días',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'La progresión de volumen no debería superar el 10% semanal: el sobreuso es la lesión más común del corredor nuevo',
        ],
        plazo: 'la última semana antes de la carrera se corre a la mitad del volumen del pico.',
      },
      {
        id: '21k',
        label: 'Una media maratón (21K)',
        hint: '21,097 km',
        answer: 'La media pide entre 10 y 14 semanas, con el fondo largo como sesión clave.',
        yes: [
          'Principiante: 14 semanas, pico de 50 km/semana',
          'Intermedio: 12 semanas, pico de 60 km/semana',
          'Avanzado: 10 semanas, pico de 72 km/semana',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'El fondo largo debería llegar a unos 18 km antes de la carrera: sin eso, los últimos kilómetros se sufren',
        ],
        plazo: 'las dos últimas semanas son de afloje, no de acumulación.',
      },
      {
        id: '42k',
        label: 'Una maratón (42K)',
        hint: '42,195 km',
        answer: 'La maratón necesita entre 14 y 20 semanas y un fondo largo de 30 a 32 km.',
        yes: [
          'Principiante: 20 semanas, pico de 55 km/semana',
          'Intermedio: 16 semanas, pico de 90 km/semana',
          'Avanzado: 14 semanas, pico de 130 km/semana',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'El afloje final de 3 semanas no se saltea: llegar cansado a la largada cuesta más minutos que cualquier semana de entrenamiento perdida',
        ],
        plazo: 'el fondo más largo se corre entre 3 y 4 semanas antes de la carrera, nunca después.',
      },
      {
        id: 'meta',
        label: 'Una maratón con un tiempo objetivo',
        hint: 'Plan ajustado a tu meta',
        answer: 'El tiempo que buscás define el pico de kilómetros, no las semanas.',
        yes: [
          'Semanas según experiencia: 22 principiante, 18 intermedio, 14 avanzado',
          'Pico de volumen según el tiempo objetivo: de 40 km/semana para más de 5 h a 100 km/semana para sub 2:45',
          'Descarga cada 4 semanas y afloje final de 3 semanas',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'Si hoy corrés menos de 20 km por semana, construí base durante 4 a 6 semanas antes de empezar el plan',
        ],
        plazo: 'si ya corrés más del 80% del pico, podés recortar el plan 2 o 3 semanas.',
      },
      {
        id: 'predictor',
        label: 'Qué tiempo puedo hacer',
        hint: 'Fórmula de Riegel',
        answer: 'Riegel proyecta tu tiempo a otra distancia a partir de una carrera reciente.',
        yes: [
          'Proyección a 5K, 10K, 15K, media maratón y maratón',
          'Ritmo por kilómetro y velocidad media de cada proyección',
          'Funciona mejor cuando la distancia meta no duplica a la de referencia',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'Proyectar de 5K a maratón queda optimista: el modelo no incluye el muro ni la fatiga acumulada',
        ],
        plazo: 'usá una carrera de los últimos 3 meses como referencia, no una vieja.',
      },
      {
        id: 'descanso',
        label: 'Cuánto descanso después de la carrera',
        hint: 'Regla del kilómetro',
        answer: 'La regla clásica pide medio día de descanso por kilómetro corrido.',
        yes: [
          'Días suaves = kilómetros de la carrera ÷ 2',
          'Después de una maratón son unos 21 días, cerca de 3 semanas',
          'Suave no es cero: trote liviano, cross-training o caminata cuentan',
        ],
        warn: [
          DISCLAIMER_SPORTS,
          'Volver a la intensidad antes de tiempo es la causa más común de lesión post-carrera',
        ],
        plazo: 'no encadenes otra carrera de la misma distancia dentro de esa ventana.',
      },
    ],
  },

  inputsTitle: 'Contanos desde dónde partís',
  inputsIntro: 'Los campos que no aplican a tu caso se ignoran. Podés dejar los valores de ejemplo.',
  fields: [
    {
      id: 'nivel',
      label: 'Tu nivel corriendo',
      type: 'select',
      value: 'principiante',
      options: [
        { value: 'principiante', label: 'Principiante — arranco o vuelvo' },
        { value: 'intermedio', label: 'Intermedio — corro hace más de un año' },
        { value: 'avanzado', label: 'Avanzado — entreno estructurado' },
      ],
    },
    { id: 'kmActuales', label: 'Kilómetros que corrés hoy por semana', type: 'number', min: 0, value: 25 },
    { id: 'metaHoras', label: 'Tiempo objetivo en maratón (horas)', type: 'number', min: 2, max: 8, step: 0.25, value: 4 },
    { id: 'distRef', label: 'Distancia de una carrera reciente (km)', type: 'number', min: 1, step: 0.1, value: 10 },
    { id: 'tiempoRefMin', label: 'Tiempo de esa carrera (minutos)', type: 'number', min: 1, step: 0.1, value: 52 },
    {
      id: 'distMeta',
      label: 'Distancia que querés proyectar',
      type: 'select',
      value: '21.1',
      options: [
        { value: '5', label: '5K' },
        { value: '10', label: '10K' },
        { value: '15', label: '15K' },
        { value: '21.1', label: 'Media maratón (21,1 km)' },
        { value: '42.195', label: 'Maratón (42,195 km)' },
      ],
    },
    { id: 'kmCarrera', label: 'Kilómetros de la carrera que corriste', type: 'number', min: 1, step: 0.1, value: 42.2 },
  ],
  fineprint: DISCLAIMER_SPORTS,

  chart: {
    type: 'bars',
    title: 'Cómo se reparte tu plan',
    caption:
      'En los planes, cada barra es una semana con su volumen en kilómetros: se ve la subida, las descargas cada 4 semanas y el afloje final. En el predictor, cada barra es el tiempo proyectado a una distancia.',
  },
  breakdownTitle: 'Los números de tu plan',
  breakdownIntro: 'De dónde sale cada cifra y qué referencia la respalda.',

  faq: [
    {
      q: '¿Cuántas semanas necesito para preparar un 5K desde cero?',
      a: 'Diez semanas si nunca corriste de forma sostenida, con tres salidas por semana y un pico de 28 km semanales. El objetivo realista de tiempo para ese punto de partida está entre 35 y 45 minutos.',
    },
    {
      q: '¿Cuántas semanas necesito para una maratón?',
      a: 'Veinte semanas si es tu primera y venís de poco volumen, 16 con base intermedia y 14 si entrenás estructurado hace años. Lo que cambia entre niveles no es sólo el tiempo: el pico de volumen va de 55 a 130 km semanales.',
    },
    {
      q: '¿Qué es el fondo largo y hasta dónde tiene que llegar?',
      a: 'Es la salida más larga de la semana, la sesión que construye la resistencia específica. Para media maratón debería estirarse hasta unos 18 km; para maratón, hasta 30 o 32 km, y siempre a ritmo cómodo, no a ritmo de carrera.',
    },
    {
      q: '¿Qué es el taper o afloje final?',
      a: 'Son las últimas semanas del plan en las que se baja el volumen para llegar descansado. En maratón son 3 semanas con aproximadamente el 70%, 55% y 40% del pico. No se recorta la intensidad: se recorta el kilometraje.',
    },
    {
      q: '¿Cómo funciona la fórmula de Riegel?',
      a: 'Proyecta el tiempo con T2 = T1 × (D2 ÷ D1) elevado a 1,06. Es decir: al duplicar la distancia el tiempo se multiplica por algo más del doble, porque el ritmo sostenible cae a medida que la carrera se alarga.',
    },
    {
      q: '¿Riegel es confiable para pasar de 10K a maratón?',
      a: 'Es la proyección más usada, pero al multiplicar la distancia por más de dos queda optimista. Tomá el resultado como el piso ideal si el entrenamiento acompañó, no como el tiempo que vas a hacer sin más.',
    },
    {
      q: '¿Cuántos días tengo que descansar después de una maratón?',
      a: 'La regla clásica da la distancia dividida dos: unos 21 días suaves después de 42 km. Suave significa trote liviano, bici, natación o caminata; no significa quedarse quieto tres semanas.',
    },
    {
      q: '¿Qué es una semana de descarga y cada cuánto va?',
      a: 'Es una semana en la que el volumen baja alrededor de un 30% para consolidar la adaptación. Se ubica cada 4 semanas de progresión. Saltearla es la forma más rápida de acumular fatiga sin ganancia.',
    },
    {
      q: '¿Puedo empezar un plan de maratón si corro 10 km por semana?',
      a: 'Conviene no hacerlo. Con menos de 20 km semanales el salto de volumen es demasiado grande: construí base durante 4 a 6 semanas hasta superar ese piso y recién ahí arrancá el plan.',
    },
    {
      q: '¿La regla del 10% semanal es obligatoria?',
      a: 'Es una guía, no una ley. Sirve como techo prudente para no acumular carga más rápido de lo que el tejido conectivo se adapta, que es más lento que el sistema cardiovascular.',
    },
    {
      q: '¿Cuántos días por semana tengo que correr?',
      a: 'Para 5K alcanza con 3 días si sos principiante; en niveles avanzados se llega a 6. Para maratón lo habitual es 4 o 5 días, con uno de fondo largo y uno de calidad.',
    },
    {
      q: '¿Sirve el mismo plan si mi carrera es de trail o en altura?',
      a: 'La estructura de semanas y descargas sirve igual, pero los tiempos y ritmos no: el desnivel y la altitud cambian el costo de cada kilómetro. Usá el plan como esqueleto y ajustá el volumen por tiempo en movimiento, no por distancia.',
    },
  ],

  sources: [
    {
      name: 'Riegel P. — Athletic Records and Human Endurance (modelo de predicción de tiempos)',
      url: 'https://www.jstor.org/stable/27848826',
      publisher: 'American Scientist',
      date: '1981',
    },
    {
      name: 'ACSM Guidelines for Exercise Testing and Prescription — progresión de volumen y carga',
      url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
      publisher: 'American College of Sports Medicine',
    },
    {
      name: 'Mujika I., Padilla S. — Scientific bases for precompetition tapering strategies',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12840640/',
      publisher: 'Medicine & Science in Sports & Exercise',
      date: '2003',
    },
    {
      name: 'Reglamento de distancias oficiales de ruta (5 km, 21,0975 km, 42,195 km)',
      url: 'https://worldathletics.org/about-iaaf/documents/book-of-rules',
      publisher: 'World Athletics',
    },
  ],

  replaces: [
    '/calculadora-plan-entrenamiento-5k-semanas',
    '/calculadora-plan-entrenamiento-21k-semi-maraton-semanas',
    '/calculadora-plan-entrenamiento-maraton-42k-semanas',
    '/calculadora-plan-maraton-semanas-experiencia',
    '/calculadora-tiempo-maraton-predictor',
    '/calculadora-descanso-post-maraton-regla-1-dia-km',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Planes fijos por distancia y nivel — espejo de los tres plan-entrenamiento-*.ts */
export const PLANES: Record<string, Record<string, { semanas: number; kmPico: number; dias?: number; meta?: string }>> = {
  '5k': {
    principiante: { semanas: 10, kmPico: 28, dias: 3, meta: '35-45 min' },
    intermedio: { semanas: 7, kmPico: 40, dias: 4, meta: '25-34 min' },
    avanzado: { semanas: 5, kmPico: 58, dias: 6, meta: 'sub-25 min' },
  },
  '21k': {
    principiante: { semanas: 14, kmPico: 50 },
    intermedio: { semanas: 12, kmPico: 60 },
    avanzado: { semanas: 10, kmPico: 72 },
  },
  '42k': {
    principiante: { semanas: 20, kmPico: 55 },
    intermedio: { semanas: 16, kmPico: 90 },
    avanzado: { semanas: 14, kmPico: 130 },
  },
};

/** Semanas base por experiencia en el plan ajustado a meta — espejo de plan-maraton-semanas.ts */
export const SEMANAS_POR_EXPERIENCIA: Record<string, number> = {
  principiante: 22,
  intermedio: 18,
  avanzado: 14,
};

/** Pico de km/semana según el tiempo objetivo en horas — espejo de plan-maraton-semanas.ts */
export const PICO_POR_META: Array<{ hasta: number; kmPico: number }> = [
  { hasta: 2.75, kmPico: 100 },
  { hasta: 3.25, kmPico: 80 },
  { hasta: 3.75, kmPico: 70 },
  { hasta: 4.25, kmPico: 60 },
  { hasta: 5, kmPico: 50 },
];
export const PICO_POR_META_DEFAULT = 40;

/** Distancias del predictor de Riegel. */
export const DISTANCIAS = [
  { value: 5, label: '5K' },
  { value: 10, label: '10K' },
  { value: 15, label: '15K' },
  { value: 21.1, label: '21K' },
  { value: 42.195, label: '42K' },
];

/** Exponente de Riegel. */
export const RIEGEL_EXP = 1.06;

/** Porcentajes del pico en el afloje final — espejo de plan-maraton-semanas.ts */
export const TAPER = [0.7, 0.55, 0.4];
