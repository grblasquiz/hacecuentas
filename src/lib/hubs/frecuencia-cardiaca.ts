import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuál es mi zona de frecuencia cardíaca?"
 * Arquetipo RAMIFICADO: seis caminos (zonas, FC máxima, zona 2, FC en reposo,
 * VO2max con test de Cooper y umbral de lactato).
 *
 * Absorbe 11 calculadoras sueltas de frecuencia cardíaca y capacidad aeróbica
 * (ver hub.replaces).
 *
 * YMYL — SALUD: el disclaimer va textual en `fineprint` y como PRIMER `warn` de
 * cada rama. El hub estima e informa; no prescribe entrenamiento ni diagnostica.
 *
 * NOTAS DE CONTRATO:
 *  - Casi nada acá es plata: TODAS las filas declaran `format: 'unit'` (lpm,
 *    años, ml/kg/min, metros, %). El runtime hace Object.assign y una fila sin
 *    formato propio se imprimiría en pesos.
 *  - El gráfico es `scale`: cada rama devuelve segmentos con `from`/`to` en
 *    unidades absolutas y una `position` 0-100 sobre el ancho total de la barra.
 *
 * EL NUDO DE LAS TRES FÓRMULAS: en el catálogo viejo convivían 220−edad (Fox),
 * 208−0,7×edad (Tanaka) y ninguna calc usaba Gellish. Dan resultados distintos
 * para la misma persona y esa diferencia es justo lo que la gente viene a
 * comparar, así que el hub calcula las tres, adopta Tanaka como principal
 * (es la de mayor validación: n=18.712) y muestra las otras dos al lado.
 */
export const hub: HubData = {
  slug: 'salud/frecuencia-cardiaca',
  title: '¿Cuál es mi zona de frecuencia cardíaca? Zonas, FC máxima y VO2max',
  description:
    'Calculá tus 5 zonas de entrenamiento por Karvonen y por porcentaje de FC máxima, tu frecuencia cardíaca máxima con Tanaka, Fox y Gellish comparadas, tu zona 2, si tu FC en reposo es normal, tu VO2max con el test de Cooper y tu umbral de lactato.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de salud',
  h1: '¿Cuál es mi zona de frecuencia cardíaca?',
  lede:
    'Toda la cuenta arranca en un número estimado: tu frecuencia cardíaca máxima. A partir de ahí salen las cinco zonas, la zona 2 de la que habla todo el mundo y el umbral. Acá vas a ver las tres fórmulas de FC máxima que circulan y en qué se diferencian, en vez de que te demos una sola sin decirte de dónde salió.',
  stamps: ['Actualizado 27-07-2026', 'Tanaka, Fox y Gellish comparadas', '11 calculadoras adentro'],

  resultLabel: 'Tu zona de entrenamiento',

  cases: {
    title: '¿Qué querés averiguar?',
    intro: 'Partimos por la pregunta más frecuente. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'zonas',
        label: 'Mis 5 zonas de entrenamiento',
        hint: 'El caso más común',
        answer:
          'Con tu FC de reposo, las zonas salen por Karvonen: reserva cardíaca por el porcentaje, más la FC de reposo.',
        yes: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Las 5 zonas calculadas por Karvonen, que usa tu reserva cardíaca (FC máxima menos FC de reposo)',
          'Las mismas zonas calculadas por porcentaje simple de FC máxima, para que veas la diferencia',
          'La reserva cardíaca, que es el margen real con el que trabajás',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Karvonen y el porcentaje simple no dan lo mismo: Karvonen levanta las zonas bajas y las acerca a tu pulso real de reposo. Ninguna de las dos está "mal", pero no las mezcles entre sesiones',
          'Toda la cuenta cuelga de una FC máxima ESTIMADA por edad, y esa estimación tiene una dispersión de ±10 a 12 lpm entre personas de la misma edad',
          'Si tomás betabloqueantes u otra medicación que baja la frecuencia, estas zonas no te aplican',
        ],
        plazo: 'medí tu FC de reposo recién despierto, acostado y antes de levantarte: es el único momento en que el número es comparable de un día al otro.',
      },
      {
        id: 'fcmax',
        label: 'Solo mi frecuencia cardíaca máxima',
        hint: 'Tanaka vs Fox vs Gellish',
        answer:
          'Tanaka (208 − 0,7 × edad) es la fórmula más validada; Fox (220 − edad) es la clásica y sobreestima a los jóvenes y subestima a los mayores.',
        yes: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Tanaka 2001: 208 − 0,7 × edad. La adoptamos como principal por su validación (18.712 personas)',
          'Fox 1971: 220 − edad. La clásica, la que aparece en casi todos lados',
          'Gellish 2007: 207 − 0,7 × edad. Casi paralela a Tanaka, unos 1 lpm por debajo',
          'Las 5 zonas derivadas de la fórmula principal',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Las tres son ESTIMACIONES por edad. La única FC máxima real es la que se mide en un test de esfuerzo supervisado',
          'A los 20 años Fox da bastante más que Tanaka y a los 60 bastante menos: es el mismo cruce que hace que las zonas te queden mal si usás la fórmula equivocada para tu edad',
          'No intentes verificarla vos solo llevando el pulso al máximo: un test de esfuerzo se hace con supervisión médica',
        ],
        plazo: 'si tenés más de 40 años, antecedentes cardíacos o venís de estar sedentario, hacete un apto médico antes de entrenar en intensidad.',
      },
      {
        id: 'zona2',
        label: 'Mi zona 2 de base aeróbica',
        hint: 'Karvonen vs porcentaje simple',
        answer:
          'La zona 2 va del 60% al 70% de la intensidad, y con Karvonen te queda más alta que con el porcentaje simple.',
        yes: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El rango de zona 2 por Karvonen, que incorpora tu FC de reposo',
          'El mismo rango por porcentaje simple de FC máxima',
          'La diferencia entre ambos, que es de bastantes latidos y explica por qué dos apps te dan zonas distintas',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La zona 2 fisiológica se define por lactato (por debajo de 2 mmol/l), no por un porcentaje: el porcentaje es una aproximación',
          'El test conversacional sigue siendo el mejor control gratuito: si no podés hablar en frases completas, estás por encima de zona 2',
          'Con calor, deshidratación o sueño de mala calidad el pulso sube para el mismo esfuerzo: la zona no se mueve, tu ritmo sí',
        ],
        plazo: 'la adaptación aeróbica de zona 2 se ve recién a las 6-8 semanas de trabajo constante.',
      },
      {
        id: 'reposo',
        label: '¿Mi pulso en reposo es normal?',
        hint: 'Por edad y nivel de actividad',
        answer:
          'En un adulto sano el rango normal va de 60 a 100 lpm, y baja bastante en gente entrenada.',
        yes: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El rango esperable para tu nivel de actividad',
          'Dónde caés vos dentro de ese rango',
          'La reserva cardíaca que te queda, que es lo que después define tus zonas',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Una FC de reposo baja en alguien entrenado es normal; la misma cifra en alguien sedentario, con mareos o desmayos, no lo es y hay que consultar',
          'Un salto sostenido de 5 a 10 lpm por encima de tu valor habitual suele avisar fatiga acumulada, infección o falta de sueño',
          'Por encima de 100 lpm en reposo de forma persistente se llama taquicardia y amerita consulta médica',
        ],
        plazo: 'tomá el valor tres mañanas seguidas y promedialas: una sola medición no dice nada.',
      },
      {
        id: 'vo2',
        label: 'Mi VO2max con el test de Cooper',
        hint: '12 minutos corriendo',
        answer:
          'El test de Cooper estima el VO2max con la distancia recorrida en 12 minutos: (metros − 504,9) ÷ 44,73.',
        yes: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Tu VO2max estimado en ml/kg/min a partir de la distancia',
          'Tu categoría según las tablas ACSM para tu sexo y década de edad',
          'La comparación con los rangos de un futbolista amateur, semipro y profesional',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El test de Cooper es un esfuerzo máximo de 12 minutos: no lo hagas sin apto médico ni si venís de estar mucho tiempo sedentario',
          'La fórmula fue validada en pista llana. Un test en cinta, en subida o con viento da un resultado que no es comparable',
          'La estimación depende mucho de tu economía de carrera: alguien con buena técnica recorre más metros con el mismo VO2max',
        ],
        plazo: 'repetilo con 8 a 12 semanas de diferencia, en la misma pista y a horario parecido, para que la comparación tenga sentido.',
      },
      {
        id: 'umbral',
        label: 'Mi umbral de lactato',
        hint: 'El techo que podés sostener',
        answer:
          'El umbral de lactato cae entre el 81% y el 91% de la FC máxima según tu nivel de entrenamiento.',
        yes: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Tu FC de umbral estimada según nivel',
          'El porcentaje de tu FC máxima al que cae',
          'La franja de trabajo para elevarlo, unos 3 puntos porcentuales a cada lado',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El umbral verdadero se mide con lactato en sangre o con un test de campo de 30 minutos: acá es una estimación por nivel declarado',
          'Cuanto más entrenado estás, más alto cae el umbral respecto de tu FC máxima: por eso el nivel que elijas cambia el resultado',
          'Es el predictor de rendimiento en 10K a maratón, pero entrenar siempre ahí acumula fatiga rápido',
        ],
        plazo: 'una o dos sesiones semanales de umbral son suficientes; el resto del volumen va en zona 2.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'edad', label: 'Edad', type: 'number', min: 10, max: 100, value: 35 },
    {
      id: 'fcReposo',
      label: 'Frecuencia cardíaca en reposo (lpm)',
      type: 'number',
      min: 30,
      max: 120,
      value: 62,
      help: 'Medila recién despierto, acostado, antes de levantarte. Si no la sabés, dejá 62: es el promedio de un adulto activo.',
    },
    {
      id: 'nivel',
      label: 'Tu nivel de entrenamiento',
      type: 'select',
      value: 'moderado',
      options: [
        { value: 'sedentario', label: 'Sedentario o recién arranco' },
        { value: 'moderado', label: 'Moderado: 2 a 3 veces por semana' },
        { value: 'activo', label: 'Activo: 4 a 5 veces por semana' },
        { value: 'atleta', label: 'Atleta o competidor' },
      ],
    },
    {
      id: 'sexo',
      label: 'Sexo (para las tablas de VO2max)',
      type: 'select',
      value: 'hombre',
      options: [
        { value: 'hombre', label: 'Hombre' },
        { value: 'mujer', label: 'Mujer' },
      ],
    },
    {
      id: 'distancia',
      label: 'Metros recorridos en 12 minutos (test de Cooper)',
      type: 'number',
      min: 400,
      max: 5000,
      value: 2400,
      help: 'Sólo hace falta para la rama de VO2max.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',

  chart: {
    type: 'scale',
    title: 'Dónde caés vos',
    caption:
      'La barra muestra las franjas del caso elegido y el marcador señala tu valor. Las franjas indican su rango en las unidades de la rama.',
  },
  breakdownTitle: 'De dónde sale el número',
  breakdownIntro: 'Cada fila muestra el paso intermedio, con su unidad, para que puedas rehacer la cuenta.',

  faq: [
    {
      q: '¿Cuál es la fórmula correcta de frecuencia cardíaca máxima: 220 − edad o 208 − 0,7 × edad?',
      a: 'Las dos son estimaciones, pero Tanaka (208 − 0,7 × edad) está mejor validada: se derivó de un metaanálisis de 351 estudios y se confirmó en 514 personas, con una muestra total de 18.712. La clásica 220 − edad, atribuida a Fox, nunca se publicó como resultado de un estudio propio y tiene un error mayor en los extremos: sobreestima a los veinteañeros y subestima a los mayores de 55. A los 25 años Fox da 195 y Tanaka 190; a los 65, Fox da 155 y Tanaka 162.',
    },
    {
      q: '¿Qué es la fórmula de Gellish y en qué se diferencia de Tanaka?',
      a: 'Gellish (2007) propone 207 − 0,7 × edad, prácticamente paralela a Tanaka pero un latido por debajo en todo el rango. Se derivó de un seguimiento longitudinal de 132 adultos a lo largo de 25 años. En la práctica, elegir entre Gellish y Tanaka mueve el resultado un solo latido: la decisión que sí importa es no usar 220 − edad si estás en los extremos de edad.',
    },
    {
      q: '¿Por qué Karvonen me da zonas más altas que el porcentaje simple?',
      a: 'Porque Karvonen no toma un porcentaje de tu FC máxima sino de tu reserva cardíaca (FC máxima menos FC de reposo) y después le suma la FC de reposo. Al partir desde tu pulso de reposo en vez de desde cero, el piso de cada zona sube. Con FC máxima 190 y reposo 60, la zona 2 por porcentaje simple va de 114 a 133 lpm; por Karvonen, de 138 a 151. Son 20 latidos de diferencia y explica por qué dos apps te muestran zonas distintas.',
    },
    {
      q: '¿Cuál de los dos métodos debería usar?',
      a: 'Karvonen si conocés tu FC de reposo con cierta confianza: personaliza el cálculo y es el estándar en entrenamiento de resistencia. El porcentaje simple si no la tenés o si tu app o reloj ya lo usa. Lo importante es no mezclarlos: elegí uno y quedate con ese, porque la comparación entre sesiones sólo tiene sentido con el mismo método.',
    },
    {
      q: '¿Cuál es mi zona 2 y cómo sé que estoy ahí?',
      a: 'La zona 2 va del 60% al 70% de la intensidad y es donde se construye la base aeróbica. El control gratuito y sorprendentemente fiable es el test conversacional: tenés que poder hablar en frases completas sin quedarte sin aire. Si tenés que cortar la frase para respirar, ya estás en zona 3.',
    },
    {
      q: '¿Cuál es una frecuencia cardíaca en reposo normal?',
      a: 'En un adulto sano el rango normal aceptado va de 60 a 100 lpm. Con entrenamiento regular baja: alguien que corre cuatro o cinco veces por semana suele estar entre 50 y 70, y un atleta de resistencia puede estar entre 35 y 60. Por debajo de 60 sin entrenamiento, o por encima de 100 de forma persistente, conviene consultar.',
    },
    {
      q: '¿Qué es la reserva cardíaca?',
      a: 'Es la diferencia entre tu frecuencia cardíaca máxima y la de reposo: el margen de latidos con el que tu corazón puede responder al esfuerzo. Con FC máxima 190 y reposo 60, la reserva es de 130 lpm. Cuanto más entrenado estás, más grande es la reserva, porque la máxima casi no se mueve pero la de reposo baja.',
    },
    {
      q: '¿Cómo se calcula el VO2max con el test de Cooper?',
      a: 'Corrés 12 minutos en pista llana tratando de cubrir la mayor distancia posible y aplicás la fórmula de Cooper (1968): VO2max = (metros − 504,9) ÷ 44,73. Con 2.400 m da unos 42,4 ml/kg/min. Es una estimación indirecta: el valor exacto se mide con analizador de gases en laboratorio.',
    },
    {
      q: '¿Qué VO2max tiene un futbolista profesional?',
      a: 'Los rangos de referencia son 45 a 55 ml/kg/min en amateur, 52 a 60 en semiprofesional y 60 a 70 en profesional de élite. Los mediocampistas, que son los que más metros recorren por partido, suelen estar en la franja alta de su categoría.',
    },
    {
      q: '¿Qué es el umbral de lactato y para qué sirve saberlo?',
      a: 'Es la intensidad más alta que podés sostener sin que el lactato se acumule más rápido de lo que lo eliminás. Cae entre el 81% de la FC máxima en principiantes y el 91% en atletas de élite. Es el mejor predictor de rendimiento en carreras de 10K a maratón, mucho mejor que el VO2max solo, porque marca a qué porcentaje de tu techo podés correr durante una hora.',
    },
    {
      q: '¿Por qué mi reloj me da una FC máxima distinta a la de esta calculadora?',
      a: 'Porque muchos relojes usan el máximo real que registraron en tus entrenamientos, no una fórmula por edad. Si alguna vez tu sensor tuvo una lectura errónea, ese pico falso te queda fijado como máxima. Si el número del reloj es mucho más alto que las tres fórmulas, revisá si viene de una sesión con lectura de muñeca inestable.',
    },
    {
      q: '¿Los betabloqueantes cambian estas zonas?',
      a: 'Sí, y bastante. Los betabloqueantes y otros fármacos que actúan sobre la frecuencia bajan tanto la FC de reposo como la máxima, así que ninguna fórmula por edad te aplica. En ese caso el control de intensidad se hace por percepción del esfuerzo o con zonas fijadas por un profesional a partir de un test real.',
    },
  ],

  sources: [
    {
      name: 'Tanaka H, Monahan KD, Seals DR — Age-predicted maximal heart rate revisited',
      url: 'https://www.jacc.org/doi/10.1016/S0735-1097%2800%2901054-8',
      publisher: 'Journal of the American College of Cardiology 2001;37(1):153-156',
      date: '2001',
    },
    {
      name: 'Gellish RL et al. — Longitudinal modeling of the relationship between age and maximal heart rate',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17762377/',
      publisher: 'Medicine & Science in Sports & Exercise 2007;39(5):822-829',
      date: '2007',
    },
    {
      name: 'Karvonen MJ, Kentala E, Mustala O — The effects of training on heart rate',
      url: 'https://pubmed.ncbi.nlm.nih.gov/13470504/',
      publisher: 'Annales Medicinae Experimentalis et Biologiae Fenniae 1957;35(3):307-315',
      date: '1957',
    },
    {
      name: 'Cooper KH — A means of assessing maximal oxygen intake',
      url: 'https://jamanetwork.com/journals/jama/article-abstract/337382',
      publisher: 'JAMA 1968;203(3):201-204',
      date: '1968',
    },
    {
      name: 'Target Heart Rates Chart',
      url: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates',
      publisher: 'American Heart Association',
    },
    {
      name: "ACSM's Guidelines for Exercise Testing and Prescription — normas de VO2max por edad y sexo",
      url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
      publisher: 'American College of Sports Medicine',
    },
  ],

  replaces: [
    '/calculadora-vo2max-test-cooper-12-minutos',
    '/calculadora-fc-maxima-zonas-karvonen',
    '/calculadora-zona2-cardio-frecuencia-edad-vo2max',
    '/calculadora-frecuencia-cardiaca-zonas-entrenamiento',
    '/calculadora-frecuencia-cardiaca-reposo-categorias-deportistas-edad',
    '/calculadora-umbral-lactato-estimado',
    '/calculadora-frecuencia-cardiaca-maxima-edad',
    '/calculadora-vo2max-predecir-carrera-cooper-12min',
    '/calculadora-ritmo-cardiaco-maximo-edad-formula',
    '/calculadora-vo2-max-test-cooper',
    '/calculadora-vo2-max-futbolista-profesional-vs-amateur',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Las tres fórmulas de FC máxima que conviven en el catálogo viejo.
 * `principal: true` marca la que el hub adopta como respuesta.
 */
export const FORMULAS_FCMAX: Array<{
  id: string;
  label: string;
  expr: string;
  a: number;
  b: number;
  principal?: boolean;
}> = [
  { id: 'tanaka', label: 'Tanaka (2001)', expr: '208 − 0,7 × edad', a: 208, b: 0.7, principal: true },
  { id: 'fox', label: 'Fox (220 − edad)', expr: '220 − edad', a: 220, b: 1 },
  { id: 'gellish', label: 'Gellish (2007)', expr: '207 − 0,7 × edad', a: 207, b: 0.7 },
];

/** Zonas de entrenamiento como fracción de intensidad (AHA / ACSM). */
export const ZONAS: Array<{ id: string; label: string; low: number; high: number }> = [
  { id: 'z1', label: 'Z1 Recuperación', low: 0.5, high: 0.6 },
  { id: 'z2', label: 'Z2 Base aeróbica', low: 0.6, high: 0.7 },
  { id: 'z3', label: 'Z3 Aeróbico', low: 0.7, high: 0.8 },
  { id: 'z4', label: 'Z4 Umbral', low: 0.8, high: 0.9 },
  { id: 'z5', label: 'Z5 Máximo', low: 0.9, high: 1.0 },
];

/**
 * Un solo selector de nivel alimenta dos cosas que en el catálogo viejo iban
 * por separado: el rango normal de FC en reposo y el porcentaje de FC máxima
 * al que cae el umbral de lactato (LT2).
 */
export const NIVELES: Record<
  string,
  { label: string; reposoMin: number; reposoMax: number; lt2: number }
> = {
  sedentario: { label: 'Sedentario', reposoMin: 60, reposoMax: 100, lt2: 0.81 },
  moderado: { label: 'Moderado', reposoMin: 55, reposoMax: 80, lt2: 0.86 },
  activo: { label: 'Activo', reposoMin: 50, reposoMax: 70, lt2: 0.89 },
  atleta: { label: 'Atleta', reposoMin: 35, reposoMax: 60, lt2: 0.91 },
};

/** Test de Cooper (1968): VO2max = (metros − 504,9) / 44,73. */
export const COOPER = { intercept: 504.9, slope: 44.73 };

/**
 * Umbrales de clasificación de VO2max por sexo y década (tablas ACSM).
 * Orden: [muy pobre, pobre, regular, buena, excelente] — por encima del último
 * valor la categoría es "Superior".
 */
export const VO2_TABLAS: Record<string, Record<string, number[]>> = {
  hombre: {
    '20': [33, 37, 42, 46, 52],
    '30': [31, 35, 39, 45, 49],
    '40': [28, 32, 36, 42, 46],
    '50': [25, 29, 33, 39, 43],
    '60': [22, 26, 30, 36, 40],
  },
  mujer: {
    '20': [28, 32, 36, 41, 46],
    '30': [26, 30, 34, 39, 44],
    '40': [24, 28, 32, 37, 41],
    '50': [21, 25, 29, 34, 38],
    '60': [18, 22, 26, 31, 35],
  },
};

export const VO2_ETIQUETAS = ['Muy pobre', 'Pobre', 'Regular', 'Buena', 'Excelente', 'Superior'];

/** Rangos de VO2max esperables en fútbol, por nivel competitivo. */
export const VO2_FUTBOL: Array<{ label: string; min: number; max: number }> = [
  { label: 'Amateur', min: 45, max: 55 },
  { label: 'Semiprofesional', min: 52, max: 60 },
  { label: 'Profesional élite', min: 60, max: 70 },
];

/** Ancho de la franja de trabajo alrededor del umbral, en puntos de %FCmax. */
export const UMBRAL_BANDA = 0.03;
