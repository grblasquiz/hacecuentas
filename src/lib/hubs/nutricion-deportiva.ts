import type { HubData } from './types';

/**
 * Hub de decisión — "Qué tomo antes, durante y después de entrenar".
 *
 * Números espejados de:
 *   src/lib/formulas/cafeina-dosis-rendimiento.ts        (ISSN 3-6 mg/kg, tope EFSA 400 mg)
 *   src/lib/formulas/creatina-dosis-carga-mantenimiento.ts (ISSN 0,3 g/kg carga · 0,07 g/kg mant.)
 *   src/lib/formulas/gel-energetico-carrera-cuantos.ts    (ACSM 60 g CHO/h, gel de 30 g)
 *   src/lib/formulas/hidratacion-corredor.ts             (tasa base 700 ml/h + factores)
 */

export const DISCLAIMER_DOSE =
  'Las dosis son referencias generales, no una indicación médica ni una receta. No te automediques ni modifiques una pauta profesional; consultá con un médico o farmacéutico.';

export const hub: HubData = {
  slug: 'nutricion/nutricion-deportiva',
  title: '¿Cuánta cafeína, creatina, geles y agua necesito? — Nutrición deportiva por peso',
  description:
    'Tu dosis de cafeína y creatina según el peso corporal con los protocolos ISSN, cuántos geles llevar en carrera según la recomendación ACSM y cuánta agua y sodio reponer por hora.',
  silo: 'Nutrición',
  siloHref: '/nutricion',

  eyebrow: 'Suplementos e hidratación',
  h1: 'Qué tomar antes, durante y después de entrenar',
  lede:
    'Arrancamos por la consulta más frecuente: cuánta cafeína conviene tomar antes de entrenar según tu peso. Si tu duda es otra —creatina, geles o hidratación en carrera— la cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Protocolos ISSN · ACSM · tope EFSA', '4 calculadoras adentro'],

  resultLabel: 'Tu dosis',

  cases: {
    title: '¿Qué estás por tomar?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'cafeina',
        label: 'Cafeína antes de entrenar',
        hint: '3 a 6 mg por kilo',
        answer: 'La dosis ergogénica de cafeína va de 3 a 6 mg por kilo de peso corporal.',
        yes: [
          'Rango en miligramos según tu peso y tu tolerancia habitual',
          'Equivalencia en tazas de café de filtro (unos 95 mg cada una)',
          'Ventana de toma: entre 30 y 60 minutos antes del esfuerzo',
        ],
        warn: [
          DISCLAIMER_DOSE,
          'El tope diario que la EFSA considera seguro para un adulto sano es de 400 mg: la dosis se recorta ahí aunque tu peso pida más',
          'Si tomás medicación, tenés hipertensión, arritmias, o estás embarazada o amamantando, el tope es otro: consultá antes',
        ],
        plazo: 'tomala 30 a 60 minutos antes; el pico en sangre llega alrededor de los 45 minutos.',
      },
      {
        id: 'creatina',
        label: 'Creatina monohidrato',
        hint: 'Carga o mantenimiento',
        answer: 'Con carga saturás en 5 días; sin carga, en unos 28.',
        yes: [
          'Fase de carga: 0,3 g por kilo por día, repartidos en 4 tomas, durante 5 días',
          'Mantenimiento: 0,07 g por kilo por día, con piso de 3 g y techo de 10 g',
          'Cuánto te dura un pote de 300 g en mantenimiento',
        ],
        warn: [
          DISCLAIMER_DOSE,
          'La creatina retiene agua intracelular: es normal subir 1 a 2 kg de peso en la primera semana y no es grasa',
          'Si tenés enfermedad renal diagnosticada o tomás medicación crónica, consultá antes de suplementarte',
        ],
        plazo: 'la saturación con carga tarda 5 días; sin carga, unos 28 días.',
      },
      {
        id: 'geles',
        label: 'Geles energéticos en carrera',
        hint: '60 g de carbohidrato por hora',
        answer: 'Por encima de 75 minutos de carrera hacen falta 60 g de carbohidrato por hora.',
        yes: [
          'Cuántos geles de 30 g necesitás según la duración estimada de la carrera',
          'Gramos totales de carbohidrato del plan',
          'Por debajo de 1 hora y cuarto, el glucógeno propio alcanza y no hacen falta geles',
        ],
        warn: [
          DISCLAIMER_DOSE,
          'Cada gel se toma con 150 a 200 ml de agua: sin líquido el gel concentra el estómago y aparecen molestias digestivas',
          'Nunca estrenes un gel el día de la carrera: probalo antes en los fondos largos',
        ],
        plazo: 'primer gel alrededor del minuto 40, y después uno cada 25 a 30 minutos.',
      },
      {
        id: 'hidratacion',
        label: 'Agua y sodio en carrera',
        hint: 'Tasa de sudoración',
        answer: 'La reposición se calcula por tasa de sudoración, no por sed.',
        yes: [
          'Mililitros por hora estimados según peso, ritmo y temperatura',
          'Volumen total de agua para la distancia que vas a correr',
          'Sodio a reponer, tomando unos 500 mg por litro de sudor',
        ],
        warn: [
          DISCLAIMER_DOSE,
          'Tomar mucha agua sin sodio en carreras largas puede provocar hiponatremia: no es una molestia menor',
          'La tasa de sudoración es muy individual: lo estimado acá es un punto de partida, no una medición',
        ],
        plazo: 'tomá 150 a 250 ml cada 15 a 20 minutos; no esperes a tener sed.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro: 'Los campos que no aplican a tu caso se ignoran. Podés dejar los valores de ejemplo.',
  fields: [
    { id: 'peso', label: 'Tu peso corporal (kg)', type: 'number', min: 30, max: 200, step: 0.5, value: 75 },
    {
      id: 'tolerancia',
      label: 'Tu tolerancia a la cafeína',
      type: 'select',
      value: 'media',
      options: [
        { value: 'baja', label: 'Baja — casi no tomo café' },
        { value: 'media', label: 'Media — uno o dos cafés por día' },
        { value: 'alta', label: 'Alta — tomo café todos los días' },
      ],
    },
    {
      id: 'protocolo',
      label: 'Protocolo de creatina',
      type: 'select',
      value: 'carga',
      options: [
        { value: 'carga', label: 'Con fase de carga (5 días)' },
        { value: 'mantenimiento', label: 'Directo a mantenimiento' },
      ],
    },
    { id: 'horas', label: 'Duración estimada de la carrera (horas)', type: 'number', min: 0.25, max: 24, step: 0.25, value: 4 },
    { id: 'distancia', label: 'Distancia de la carrera (km)', type: 'number', min: 1, step: 0.1, value: 42.2 },
    { id: 'ritmo', label: 'Tu ritmo previsto (min/km)', type: 'number', min: 2, max: 15, step: 0.1, value: 5.5 },
    { id: 'temperatura', label: 'Temperatura prevista (°C)', type: 'number', min: -20, max: 50, value: 22 },
  ],
  fineprint: DISCLAIMER_DOSE,

  chart: {
    type: 'bars',
    title: 'Tu dosis contra las alternativas',
    caption:
      'Las barras comparan tu resultado con los otros escenarios posibles: las dosis de cada nivel de tolerancia, las fases del protocolo de creatina, los geles según duración o los mililitros por hora a distintas temperaturas.',
  },
  breakdownTitle: 'De dónde sale el número',
  breakdownIntro: 'Cada fila muestra el componente del cálculo y la referencia que lo respalda.',

  faq: [
    {
      q: '¿Cuánta cafeína hay que tomar para mejorar el rendimiento?',
      a: 'La posición de la ISSN ubica la dosis ergogénica entre 3 y 6 mg por kilo de peso corporal, tomada de 30 a 60 minutos antes del esfuerzo. Para 75 kg son unos 225 a 375 mg, el equivalente a 2 a 4 cafés de filtro.',
    },
    {
      q: '¿Cuál es el tope diario seguro de cafeína?',
      a: 'La EFSA considera seguros hasta 400 mg diarios para un adulto sano, y hasta 200 mg en una sola toma. Por eso la dosis se recorta en 400 mg aunque el peso corporal pida más: por encima de ese punto no rinde mejor y aparecen taquicardia, temblor e insomnio.',
    },
    {
      q: '¿Más cafeína rinde más?',
      a: 'No. La curva de beneficio se aplana alrededor de los 6 mg por kilo y a partir de ahí sólo crecen los efectos adversos. Si nunca la usaste antes de entrenar, empezá por el extremo bajo del rango para probar tolerancia.',
    },
    {
      q: '¿Cuánta creatina tomar por día?',
      a: 'En mantenimiento, unos 0,07 g por kilo de peso, con piso práctico de 3 g y techo de 10 g. Para 75 kg son unos 5 g diarios, la dosis clásica de una cucharadita rasa.',
    },
    {
      q: '¿Hace falta hacer fase de carga con la creatina?',
      a: 'No es obligatoria, sólo cambia la velocidad. Con carga —0,3 g por kilo por día repartidos en 4 tomas durante 5 días— el músculo satura en menos de una semana; sin carga, tomando la dosis de mantenimiento desde el día uno, se llega al mismo punto en unos 28 días.',
    },
    {
      q: '¿La creatina hace subir de peso?',
      a: 'Sube el peso de báscula, no la grasa. La creatina arrastra agua al interior de la célula muscular, lo que suele traducirse en 1 a 2 kg en la primera semana de carga. Es un efecto esperado y reversible.',
    },
    {
      q: '¿Cuántos geles energéticos llevo a una carrera?',
      a: 'La recomendación ACSM para esfuerzos de más de 75 minutos es de unos 60 g de carbohidrato por hora. Con geles estándar de 30 g, eso son 2 geles por hora: para una maratón de 4 horas, unos 8 geles.',
    },
    {
      q: '¿Desde qué duración hacen falta geles?',
      a: 'Por debajo de aproximadamente una hora y cuarto el glucógeno muscular alcanza para sostener el esfuerzo y no hace falta reponer. A partir de ahí, cada hora sin carbohidrato aumenta el riesgo de quedarse sin combustible en la parte final.',
    },
    {
      q: '¿Cuánta agua hay que tomar corriendo?',
      a: 'Depende de la tasa de sudoración, que varía con el peso, el ritmo y la temperatura. El punto de partida son unos 700 ml por hora para un corredor de 75 kg a ritmo moderado y 20-25 °C, y puede superar el litro por hora con calor y ritmo rápido.',
    },
    {
      q: '¿Por qué hay que reponer sodio y no sólo agua?',
      a: 'Porque el sudor arrastra alrededor de 500 mg de sodio por litro. En carreras largas, tomar mucha agua sin electrolitos diluye el sodio en sangre y puede provocar hiponatremia, que se manifiesta con náuseas, confusión y en casos graves es una urgencia médica.',
    },
    {
      q: '¿Puedo tomar cafeína y creatina juntas?',
      a: 'Se pueden usar en el mismo plan: actúan por mecanismos distintos y en los estudios no se anulan de forma relevante. Lo que sí conviene es separar la toma de creatina de una dosis alta de cafeína si notás molestias digestivas.',
    },
    {
      q: '¿Los geles se toman con agua o con bebida isotónica?',
      a: 'Con agua. El gel ya viene concentrado en carbohidrato; sumarle una isotónica también concentrada eleva demasiado la osmolaridad en el estómago y es la receta habitual del corte digestivo. Reservá la isotónica para los tramos sin gel.',
    },
  ],

  sources: [
    {
      name: 'Guest N. et al. — ISSN Position Stand: Caffeine and Exercise Performance',
      url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-020-00383-4',
      publisher: 'Journal of the International Society of Sports Nutrition',
      date: '2021',
    },
    {
      name: 'EFSA — Scientific Opinion on the safety of caffeine (tope de 400 mg/día)',
      url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4102',
      publisher: 'European Food Safety Authority',
      date: '2015',
    },
    {
      name: 'Kreider R. et al. — ISSN Position Stand: Safety and Efficacy of Creatine Supplementation',
      url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z',
      publisher: 'Journal of the International Society of Sports Nutrition',
      date: '2017',
    },
    {
      name: 'ACSM Joint Position Statement — Nutrition and Athletic Performance',
      url: 'https://journals.lww.com/acsm-msse/fulltext/2016/03000/nutrition_and_athletic_performance.25.aspx',
      publisher: 'American College of Sports Medicine / AND / DC',
      date: '2016',
    },
    {
      name: 'ACSM Position Stand — Exercise and Fluid Replacement',
      url: 'https://journals.lww.com/acsm-msse/fulltext/2007/02000/exercise_and_fluid_replacement.22.aspx',
      publisher: 'American College of Sports Medicine',
    },
  ],

  replaces: [
    '/calculadora-cafeina-dosis-rendimiento',
    '/calculadora-creatina-dosis-carga-mantenimiento',
    '/calculadora-gel-energetico-carrera-cuantos',
    '/calculadora-hidratacion-corredor-maraton-carrera',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-bcaa-pre-workout-gramos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** mg de cafeína por kg según tolerancia — espejo de cafeina-dosis-rendimiento.ts */
export const CAFEINA: Record<string, { min: number; max: number }> = {
  baja: { min: 2, max: 3 },
  media: { min: 3, max: 5 },
  alta: { min: 4, max: 6 },
};
/** Tope diario EFSA en mg. */
export const CAFEINA_TOPE = 400;
/** mg de cafeína de un café de filtro. */
export const CAFE_MG = 95;

/** Creatina — espejo de creatina-dosis-carga-mantenimiento.ts */
export const CREATINA = {
  cargaPorKg: 0.3,
  tomasCarga: 4,
  diasCarga: 5,
  mantenimientoPorKg: 0.07,
  minMantenimiento: 3,
  maxMantenimiento: 10,
  potePorGramos: 300,
  diasSaturacionSinCarga: 28,
};

/** Geles — espejo de gel-energetico-carrera-cuantos.ts */
export const GELES = { choPorHora: 60, choPorGel: 30, horasMinimas: 1.25 };

/** Hidratación — espejo de hidratacion-corredor.ts */
export const HIDRATACION = {
  tasaBase: 700,
  pesoRef: 75,
  sodioPorLitro: 500,
  temp: [
    { hasta: 10, factor: 0.7 },
    { hasta: 15, factor: 0.8 },
    { hasta: 20, factor: 0.9 },
    { hasta: 25, factor: 1.0 },
    { hasta: 30, factor: 1.2 },
    { hasta: 35, factor: 1.3 },
  ],
  tempFactorMax: 1.5,
  ritmo: [
    { menorA: 4, factor: 1.3 },
    { menorA: 5, factor: 1.2 },
    { menorA: 6, factor: 1.1 },
    { menorA: 7, factor: 1.0 },
  ],
  ritmoFactorLento: 0.8,
};
