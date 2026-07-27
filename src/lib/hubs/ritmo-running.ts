import type { HubData } from './types';

/**
 * Hub de decisión — "¿A qué ritmo tengo que correr?"
 *
 * Absorbe 7 calculadoras de ritmo/pace: 3 de running (que calculaban lo mismo),
 * 1 de caminata y 3 de natación. El diferencial que ninguna de las 7 tenía es la
 * proyección de Riegel: si corriste 10K en X, cuánto te da la maratón.
 */
export const hub: HubData = {
  slug: 'salud/ritmo-y-pace',
  title: '¿A qué ritmo tengo que correr? — Pace, velocidad y proyección de tiempos',
  description:
    'Calculá tu pace en min/km, la velocidad en km/h y cuánto te daría otra distancia con la fórmula de Riegel. También ritmo de caminata, pasos por km, pace de natación por 100 m, SWOLF y velocidad crítica.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Ritmo, pace y proyección',
  h1: '¿A qué ritmo tengo que correr?',
  lede:
    'Partimos del caso más frecuente: corriste una distancia en un tiempo y querés saber tu pace, tu velocidad y qué podrías hacer en otra distancia. Si nadás o caminás, cambiá el caso abajo.',
  stamps: ['Proyección por fórmula de Riegel', 'Running, caminata y natación', '7 calculadoras adentro'],

  resultLabel: 'Tu ritmo',

  cases: {
    title: '¿Qué querés calcular?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'pace',
        label: 'Corrí una distancia y quiero mi ritmo',
        hint: 'Pace, velocidad y proyecciones',
        answer: 'Tu pace es el tiempo total dividido por los kilómetros.',
        yes: [
          'Pace en min/km y en min/milla',
          'Velocidad media en km/h y mph',
          'Proyección a 5K, 10K, media y maratón con la fórmula de Riegel',
          'Comparación contra la proyección ingenua a pace constante',
        ],
        warn: [
          'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',
          'Riegel supone que venís entrenando la distancia objetivo. Si nunca pasaste de 10K, la proyección de maratón es un techo teórico, no un plan.',
        ],
        plazo: 'la proyección se vuelve optimista si el esfuerzo de referencia no fue a fondo.',
      },
      {
        id: 'objetivo',
        label: 'Tengo un tiempo objetivo y quiero saber a qué ritmo ir',
        hint: 'El cálculo al revés',
        answer: 'El ritmo objetivo es el tiempo meta dividido por la distancia.',
        yes: [
          'Pace exacto que tenés que sostener',
          'Parciales de control por 1 km, 5 km y por vuelta de 400 m',
          'Velocidad de cinta equivalente en km/h',
        ],
        warn: [
          'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',
          'En calle el desnivel y el viento mueven el pace real. Guiate por esfuerzo, no sólo por el reloj.',
        ],
        plazo: 'salir 5-10 s/km más lento en el primer km casi siempre mejora el tiempo final.',
      },
      {
        id: 'caminata',
        label: 'Camino: ¿cuántos pasos por km y a qué velocidad?',
        hint: 'Zancada por altura',
        answer: 'Los pasos por kilómetro salen de tu altura, no de una tabla fija.',
        yes: [
          'Longitud de zancada estimada a partir de tu altura (factor 0,415)',
          'Distancia real recorrida y pasos por kilómetro',
          'Velocidad en km/h con la franja de intensidad',
        ],
        warn: [
          'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',
          'La zancada por altura es una aproximación: en subida o con mochila se acorta y los pasos por km suben.',
        ],
        plazo: 'a partir de 5 km/h la caminata ya cuenta como actividad de intensidad moderada.',
      },
      {
        id: 'natacion',
        label: 'Nado: ¿cuál es mi pace por 100 m?',
        hint: 'El pace del agua',
        answer: 'En natación el ritmo se mide en tiempo por 100 metros.',
        yes: [
          'Pace por 100 m y velocidad en km/h',
          'Proyección a 400 m, 1500 m y milla nadada (1852 m)',
          'Nivel orientativo según el pace',
        ],
        warn: [
          'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',
          'En pileta de 25 m ganás tiempo en cada viraje: el mismo pace en aguas abiertas es más lento.',
        ],
        plazo: 'medí siempre con el mismo largo de pileta si querés comparar semanas.',
      },
      {
        id: 'swolf',
        label: 'Nado: ¿qué tan eficiente soy? (SWOLF)',
        hint: 'Segundos + brazadas',
        answer: 'El SWOLF suma segundos y brazadas de un largo: cuanto más bajo, mejor.',
        yes: [
          'Índice SWOLF del largo (tiempo en segundos + brazadas)',
          'Nivel orientativo y qué palanca conviene mover',
        ],
        warn: [
          'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',
          'El SWOLF sólo se compara contra vos mismo en la misma pileta y el mismo estilo. Entre nadadores no dice nada.',
        ],
        plazo: 'bajarlo a fuerza de nadar más rápido sin técnica no es mejorar eficiencia.',
      },
      {
        id: 'css',
        label: 'Nado: mi velocidad crítica y zonas (CSS)',
        hint: 'Test de 400 y 200 m',
        answer: 'La velocidad crítica es tu umbral sostenible en el agua.',
        yes: [
          'CSS en m/s y en pace por 100 m, a partir del test de 400 m y 200 m',
          'Zona de umbral, de recuperación y de VO2 máx para armar series',
        ],
        warn: [
          'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',
          'Los dos tests tienen que ser a fondo y con descanso completo entre ellos, si no el CSS sale falseado.',
        ],
        plazo: 'reevaluá el CSS cada 6-8 semanas de entrenamiento.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada caso usa sólo los campos que necesita. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'distancia', label: 'Distancia recorrida (km) — correr o caminar', type: 'number', min: 0, step: 0.01, value: 10 },
    { id: 'horas', label: 'Tiempo: horas', type: 'number', min: 0, max: 99, value: 0 },
    { id: 'minutos', label: 'Tiempo: minutos', type: 'number', min: 0, max: 59, value: 52 },
    { id: 'segundos', label: 'Tiempo: segundos', type: 'number', min: 0, max: 59, value: 30 },
    { id: 'pasos', label: 'Pasos dados (caminata)', type: 'number', min: 0, value: 8000 },
    { id: 'altura', label: 'Tu altura en cm (para la zancada)', type: 'number', min: 100, max: 230, value: 172 },
    { id: 'distanciaNado', label: 'Distancia nadada (metros)', type: 'number', min: 0, value: 400 },
    { id: 'nadoMin', label: 'Tiempo nadando: minutos', type: 'number', min: 0, max: 99, value: 7 },
    { id: 'nadoSeg', label: 'Tiempo nadando: segundos', type: 'number', min: 0, max: 59, value: 0 },
    {
      id: 'tiempo200',
      label: 'Tu tiempo en 200 m, en segundos (sólo CSS)',
      type: 'number',
      min: 0,
      value: 200,
      help: 'El test de CSS son dos esfuerzos a fondo con descanso completo: 400 m (cargalo en los campos de tiempo nadando, arriba) y 200 m (acá, en segundos totales).',
    },
    { id: 'segLargo', label: 'Segundos que tardás un largo (SWOLF)', type: 'number', min: 0, value: 30 },
    { id: 'brazadas', label: 'Brazadas en ese largo (SWOLF)', type: 'number', min: 0, value: 22 },
  ],
  fineprint:
    'Estimación general. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu ritmo',
    caption:
      'La barra muestra las franjas de intensidad del deporte elegido y el marcador indica dónde queda tu ritmo. En natación la escala corre al revés: menos segundos es más rápido.',
  },
  breakdownTitle: 'El detalle de tu ritmo',
  breakdownIntro: 'Los valores en tiempo aparecen convertidos a minutos decimales para poder compararlos entre sí.',

  faq: [
    {
      q: '¿Qué es el pace y en qué se diferencia de la velocidad?',
      a: 'El pace es el tiempo que tardás en recorrer un kilómetro (min/km) y la velocidad son los kilómetros que hacés en una hora (km/h). Son la misma información al revés: pace = 60 ÷ velocidad. Correr a 5:00 min/km es correr a 12 km/h.',
    },
    {
      q: '¿Cómo proyecto mi tiempo de maratón desde un 10K?',
      a: 'Con la fórmula de Riegel: T2 = T1 × (D2 ÷ D1) elevado a 1,06. Ese exponente mayor a 1 es el que castiga la distancia larga. Multiplicar el pace del 10K por 42,195 (proyección lineal) da un tiempo que casi nadie corre en la vida real.',
    },
    {
      q: '¿Por qué el pace de maratón es más lento que el de 10K?',
      a: 'Porque el sistema aeróbico no sostiene la misma intensidad relativa por cuatro veces más tiempo: entran en juego el glucógeno, la deshidratación y el daño muscular. La regla práctica es que cada vez que duplicás la distancia perdés entre 4% y 8% de pace.',
    },
    {
      q: '¿Cuántos pasos hay en un kilómetro?',
      a: 'Depende de tu altura, no de un número fijo. La zancada estimada es altura × 0,415: alguien de 1,72 m tiene una zancada de 0,71 m y da unos 1.401 pasos por km. Alguien de 1,60 m necesita cerca de 1.506 pasos para el mismo kilómetro.',
    },
    {
      q: '¿Qué velocidad de caminata cuenta como ejercicio?',
      a: 'A partir de unos 5 km/h la caminata pasa a ser de intensidad moderada. Por debajo de 4 km/h es un paseo, y arriba de 6 km/h ya es marcha rápida, casi trote.',
    },
    {
      q: '¿Cómo se mide el ritmo en natación?',
      a: 'En segundos o minutos por cada 100 metros. Si nadás 400 m en 7:00, tu pace es 1:45/100 m. La conversión a km/h existe pero casi nadie la usa en el agua: los planes de entrenamiento están escritos en tiempo por 100.',
    },
    {
      q: '¿Qué es el SWOLF y para qué sirve?',
      a: 'Es la suma de los segundos que tardás un largo más las brazadas que diste en ese largo. Mide eficiencia: dos nadadores con el mismo tiempo pero distinto número de brazadas no nadan igual. Cuanto más bajo el número, mejor deslizás.',
    },
    {
      q: '¿Qué es la velocidad crítica de nado (CSS)?',
      a: 'Es tu umbral sostenible en el agua. Se estima con dos tests a fondo: CSS = (400 − 200) ÷ (tiempo de 400 − tiempo de 200), en metros por segundo. Sirve para prescribir series de umbral con un pace concreto en vez de guiarte por sensación.',
    },
    {
      q: '¿Qué pace tengo que llevar para bajar de 4 horas en maratón?',
      a: 'Cuatro horas son 240 minutos para 42,195 km, o sea 5:41 min/km sostenidos. En la práctica conviene apuntar a 5:35 para tener colchón, porque el recorrido medido siempre da algo más que la distancia oficial.',
    },
    {
      q: '¿Sirve el pace de la cinta para predecir el de la calle?',
      a: 'Parcialmente. La cinta no tiene resistencia del aire y la banda ayuda al retorno de la pierna, así que suele dar un pace algo más rápido que el equivalente en calle. Poner 1% de inclinación acerca bastante las dos superficies.',
    },
    {
      q: '¿Conviene correr siempre al mismo ritmo?',
      a: 'No. La mayor parte del volumen semanal debería ir a ritmo cómodo, con una porción chica a ritmos exigentes. Entrenar siempre en la zona intermedia es el error clásico: cansa como lo duro y estimula como lo suave.',
    },
    {
      q: '¿Por qué mi reloj marca una distancia distinta a la de la carrera?',
      a: 'Porque el GPS suaviza y corta curvas, y porque el recorrido oficial se mide por la línea más corta posible. Es habitual que el reloj marque entre 1% y 2% más en una carrera de calle.',
    },
  ],

  sources: [
    {
      name: 'Riegel, P. — "Athletic Records and Human Endurance" (modelo de predicción de tiempos)',
      url: 'https://www.jstor.org/stable/27848530',
      publisher: 'American Scientist',
      date: '1981',
    },
    {
      name: 'Physical Activity Guidelines — intensidad de la caminata y actividad moderada',
      url: 'https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines',
      publisher: 'U.S. Department of Health and Human Services',
    },
    {
      name: 'Critical Swim Speed: test de 400 y 200 m para estimar el umbral en natación',
      url: 'https://pubmed.ncbi.nlm.nih.gov/1474658/',
      publisher: 'PubMed — Int J Sports Med',
    },
    {
      name: 'Distancias oficiales de ruta (5 km, 10 km, media maratón 21,0975 km, maratón 42,195 km)',
      url: 'https://worldathletics.org/about-iaaf/documents/book-of-rules',
      publisher: 'World Athletics',
    },
  ],

  replaces: [
    '/calculadora-pace-ritmo-running',
    '/calculadora-ritmo-carrera-pace-km',
    '/calculadora-velocidad-promedio-carrera-km-h',
    '/calculadora-ritmo-caminata-pasos-por-km',
    '/calculadora-natacion-pace-100m',
    '/calculadora-swolf-natacion-indice',
    '/calculadora-velocidad-critica-natacion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Distancias de ruta para la tabla de proyección (km). */
export const DISTANCIAS = [
  { id: '5k', label: '5K', km: 5 },
  { id: '10k', label: '10K', km: 10 },
  { id: '21k', label: 'Media maratón', km: 21.0975 },
  { id: '42k', label: 'Maratón', km: 42.195 },
];

/** Exponente de fatiga de Riegel. >1 = la distancia larga castiga el pace. */
export const RIEGEL = 1.06;

/** Franjas de velocidad de carrera (km/h). Espejo de src/lib/formulas/velocidad-carrera.ts. */
export const ZONAS_CARRERA = [
  { label: 'Trote suave', from: 0, to: 8, tone: 'good' },
  { label: 'Recreativo', from: 8, to: 11, tone: 'good' },
  { label: 'Entrenado', from: 11, to: 14, tone: 'main' },
  { label: 'Competitivo', from: 14, to: 18, tone: 'warn' },
  { label: 'Elite', from: 18, to: 24, tone: 'bad' },
];

/** Franjas de caminata (km/h). Espejo de src/lib/formulas/ritmo-caminata.ts. */
export const ZONAS_CAMINATA = [
  { label: 'Tranquilo', from: 0, to: 4, tone: 'good' },
  { label: 'Moderado', from: 4, to: 5, tone: 'good' },
  { label: 'Enérgico', from: 5, to: 6, tone: 'main' },
  { label: 'Rápido', from: 6, to: 8, tone: 'warn' },
];

/** Franjas de pace de natación (segundos por 100 m). Espejo de natacion-pace-100m.ts. */
export const ZONAS_NATACION = [
  { label: 'Avanzado', from: 50, to: 75, tone: 'main' },
  { label: 'Intermedio-avanzado', from: 75, to: 100, tone: 'good' },
  { label: 'Intermedio', from: 100, to: 130, tone: 'warn' },
  { label: 'Principiante', from: 130, to: 180, tone: 'bad' },
];

/** Franjas de SWOLF. Espejo de swolf-natacion-indice.ts. */
export const ZONAS_SWOLF = [
  { label: 'Elite', from: 20, to: 40, tone: 'main' },
  { label: 'Avanzado', from: 40, to: 56, tone: 'good' },
  { label: 'Intermedio', from: 56, to: 70, tone: 'warn' },
  { label: 'Principiante', from: 70, to: 90, tone: 'bad' },
];

/** Zancada = altura(cm) × este factor / 100. Espejo de ritmo-caminata.ts. */
export const FACTOR_ZANCADA = 0.415;
