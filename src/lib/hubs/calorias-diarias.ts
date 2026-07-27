import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántas calorías necesito por día?"
 * Arquetipo: RAMIFICADO. La pregunta es siempre la misma, pero el número que
 * buscás cambia según el objetivo: mantener, bajar, ganar músculo o llegar a
 * un peso objetivo en una fecha.
 *
 * Absorbe 5 calculadoras: TDEE (Mifflin-St Jeor), agua diaria, déficit
 * calórico, superávit para masa muscular y peso objetivo de competición.
 *
 * CONTENIDO YMYL DE SALUD: el disclaimer de dominio 'health' de
 * src/lib/disclaimers.ts va literal en `fineprint` y como PRIMER `warn` de
 * cada rama. Nada de indicaciones clínicas, dosis ni planes personalizados.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata: todas las filas declaran `format: 'unit'` con su unidad
 *    (kcal, ml, kg, g, %). El runtime hace Object.assign y una fila sin
 *    `format` propio caería a pesos.
 *  - `chart.type: 'stacked'` = una sola barra partida. Los tres segmentos son
 *    metabolismo basal + actividad + efecto térmico de los alimentos: de ahí
 *    sale el número, no de una tabla mágica.
 */
export const hub: HubData = {
  slug: 'nutricion/calorias-diarias',
  title: '¿Cuántas calorías necesito por día? Calculadora de TDEE — 2026',
  description:
    'Calculá tus calorías diarias con Mifflin-St Jeor: metabolismo basal, gasto por actividad y efecto térmico. Ajustá el número para mantener el peso, bajar, ganar masa muscular o llegar a un peso objetivo, con tu meta de agua incluida.',
  silo: 'Nutrición',
  siloHref: '/nutricion',

  eyebrow: 'Guía y estimación nutricional',
  h1: '¿Cuántas calorías necesito por día?',
  lede:
    'Tu gasto diario sale de tres partes: lo que quemás en reposo, lo que sumás moviéndote y lo que gasta el cuerpo en digerir. Partimos del caso más común —mantener el peso— y lo ajustás según tu objetivo.',
  stamps: ['Actualizado 27-07-2026', 'Mifflin-St Jeor · OMS/FAO', '5 calculadoras adentro'],

  resultLabel: 'Tus calorías objetivo por día',

  cases: {
    title: '¿Qué querés lograr?',
    intro: 'Partimos de mantener el peso. Si tu objetivo es otro, cambialo.',
    items: [
      {
        id: 'mantener',
        label: 'Mantener el peso',
        hint: 'El caso más común',
        answer: 'Tus calorías de mantenimiento son tu gasto total diario (TDEE).',
        yes: [
          'Metabolismo basal por Mifflin-St Jeor: 10×peso + 6,25×altura − 5×edad, +5 si sos varón y −161 si sos mujer',
          'Factor de actividad sobre el basal: 1,2 sedentario · 1,375 ligero · 1,55 moderado · 1,725 intenso · 1,9 muy intenso',
          'Efecto térmico de los alimentos: alrededor del 10% de lo que comés',
          'Meta de agua estimada en 35 ml por kilo, ajustada por actividad y clima',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Mifflin-St Jeor es una estimación poblacional: el gasto real de dos personas iguales en papel puede diferir 10-15%',
          'Si tenés mucha masa muscular o mucha grasa, la fórmula pierde precisión: ahí conviene una ecuación con masa magra',
        ],
        plazo: 'si el peso se mantiene estable durante 2 o 3 semanas comiendo ese número, tu estimación está bien calibrada.',
      },
      {
        id: 'bajar',
        label: 'Bajar de peso',
        hint: 'Déficit de 500 kcal por día',
        answer: 'Con 500 kcal menos por día se pierde alrededor de 0,45 kg por semana.',
        yes: [
          'Déficit estándar de 500 kcal/día sobre tu gasto total',
          '1 kg de grasa equivale a unas 7.700 kcal: el déficit semanal dividido 7.700 da los kilos por semana',
          'Piso de seguridad: 1.500 kcal en varones y 1.200 en mujeres, aunque el déficit pida menos',
          'Proteína alta y entrenamiento de fuerza para conservar músculo mientras bajás',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Por debajo del piso de 1.500/1.200 kcal no bajes por tu cuenta: requiere seguimiento profesional',
          'Un déficit mayor a 1.000 kcal/día acelera la pérdida de masa muscular y el efecto rebote',
          'El peso en la balanza se mueve por líquidos: mirá la tendencia semanal, no el día a día',
        ],
        plazo: 'una pérdida sostenible va de 0,5 a 1 kg por semana; revisá el número cada 4 semanas porque el gasto baja cuando baja el peso.',
      },
      {
        id: 'ganar',
        label: 'Ganar masa muscular',
        hint: 'Superávit controlado',
        answer: 'Un superávit de 250 a 400 kcal por día es el rango de volumen limpio.',
        yes: [
          'Calorías objetivo = tu gasto total más el superávit que elijas',
          'Ganancia estimada: superávit × 30 días ÷ 7.700 kcal por kilo',
          'Proteína de referencia para hipertrofia: 1,6 a 2,2 g por kilo de peso (usamos 1,8)',
          'El superávit sin entrenamiento de fuerza suma grasa, no músculo',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Arriba de 500 kcal de superávit la proporción de grasa ganada crece rápido',
          'La ganancia de músculo tiene techo fisiológico: 0,5 a 1 kg por mes en principiantes, mucho menos en avanzados',
        ],
        plazo: 'evaluá cada 4 a 6 semanas: si subís más de 0,5 kg por semana, el superávit está alto.',
      },
      {
        id: 'objetivo',
        label: 'Llegar a un peso objetivo',
        hint: 'Con fecha puesta',
        answer: 'El déficit sale de los kilos a perder y del plazo que te pongas.',
        yes: [
          'Déficit diario = (peso actual − peso objetivo) × 7.700 ÷ (semanas × 7)',
          'Calorías objetivo = tu gasto total menos ese déficit diario',
          'La calculadora te avisa si el plan queda por debajo del piso de seguridad',
          'Sirve también para llegar a un peso de competición en una fecha fija',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Un plazo corto convierte un objetivo razonable en un déficit peligroso: si el número cae bajo el piso, estirá las semanas',
          'Las bajadas rápidas de peso para competir (deshidratación, corte de agua) no entran acá y tienen riesgo real',
          'El gasto baja a medida que bajás de peso: el déficit calculado hoy rinde menos dentro de dos meses',
        ],
        plazo: 'recalculá cada 4 semanas con tu peso nuevo para que el déficit siga siendo el que planeaste.',
      },
    ],
  },

  inputsTitle: 'Completá tus datos',
  inputsIntro: 'Peso, altura, edad y actividad alcanzan. Los últimos campos sólo pesan en algunas ramas.',
  fields: [
    { id: 'peso', label: 'Peso actual', type: 'number', suffix: 'kg', min: 30, max: 300, step: 0.1, value: 75 },
    { id: 'altura', label: 'Altura', type: 'number', suffix: 'cm', min: 120, max: 230, step: 1, value: 172 },
    { id: 'edad', label: 'Edad', type: 'number', suffix: 'años', min: 15, max: 100, step: 1, value: 35 },
    {
      id: 'sexo',
      label: 'Sexo (cambia la constante de Mifflin-St Jeor)',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Masculino' },
        { value: 'f', label: 'Femenino' },
      ],
    },
    {
      id: 'actividad',
      label: 'Nivel de actividad',
      type: 'select',
      value: 'moderado',
      options: [
        { value: 'sedentario', label: 'Sedentario — poco o nada de ejercicio' },
        { value: 'ligero', label: 'Ligero — 1 a 3 días por semana' },
        { value: 'moderado', label: 'Moderado — 3 a 5 días por semana' },
        { value: 'intenso', label: 'Intenso — 6 o 7 días por semana' },
        { value: 'muy_intenso', label: 'Muy intenso — doble turno o trabajo físico' },
      ],
      help: 'Contá el ejercicio real de una semana promedio, no el de tu mejor semana.',
    },
    {
      id: 'pesoObjetivo',
      label: 'Peso objetivo',
      type: 'number',
      suffix: 'kg',
      min: 30,
      max: 300,
      step: 0.1,
      value: 70,
      help: 'Sólo se usa en la rama "Llegar a un peso objetivo".',
    },
    {
      id: 'semanas',
      label: 'Plazo para llegar',
      type: 'number',
      suffix: 'semanas',
      min: 1,
      max: 104,
      step: 1,
      value: 12,
      help: 'Sólo se usa en la rama "Llegar a un peso objetivo".',
    },
    {
      id: 'superavit',
      label: 'Superávit para masa muscular',
      type: 'number',
      suffix: 'kcal',
      min: 0,
      max: 1000,
      step: 25,
      value: 350,
      help: 'Sólo se usa en la rama "Ganar masa muscular". 250 a 400 es el rango de volumen limpio.',
    },
    {
      id: 'clima',
      label: 'Clima donde vivís (para la meta de agua)',
      type: 'select',
      value: 'templado',
      options: [
        { value: 'frio', label: 'Frío' },
        { value: 'templado', label: 'Templado' },
        { value: 'caluroso', label: 'Caluroso' },
      ],
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',

  chart: {
    type: 'stacked',
    title: 'De dónde sale tu gasto diario',
    caption:
      'La barra parte tu gasto total en tres: el metabolismo basal (lo que quemás acostado, y es la mayor parte), el gasto por actividad y el efecto térmico de los alimentos, que es alrededor del 10% de lo que comés. Las calorías objetivo de tu rama se calculan sobre ese total.',
  },
  breakdownTitle: 'Tus números, uno por uno',
  breakdownIntro:
    'Cada fila trae su unidad: kcal para energía, ml para agua, kg para peso y g para proteína. Las barras comparan cada valor con el más grande.',

  faq: [
    {
      q: '¿Cuántas calorías necesito por día?',
      a: 'Depende de tu peso, altura, edad, sexo y actividad. Un varón de 75 kg, 172 cm y 35 años con actividad moderada gasta alrededor de 2.640 kcal por día; una mujer con esos mismos datos, cerca de 2.380. La calculadora arma tu número con Mifflin-St Jeor y lo ajusta a tu objetivo.',
    },
    {
      q: '¿Qué es el TDEE y en qué se diferencia del metabolismo basal?',
      a: 'El metabolismo basal (BMR) es lo que gastás en reposo absoluto: respirar, bombear sangre, mantener la temperatura. El TDEE es el gasto total del día e incluye además el ejercicio, el movimiento cotidiano y el efecto térmico de la comida. El basal suele ser el 60-70% del TDEE.',
    },
    {
      q: '¿Por qué usan Mifflin-St Jeor y no Harris-Benedict?',
      a: 'Porque Mifflin-St Jeor (1990) es la ecuación predictiva más precisa para adultos sanos según la revisión de la Academy of Nutrition and Dietetics: acierta dentro del 10% del gasto medido en más casos que Harris-Benedict, que fue calibrada en 1919 y tiende a sobreestimar.',
    },
    {
      q: '¿Cuántas calorías tengo que comer para bajar un kilo por semana?',
      a: 'Un kilo de grasa equivale a unas 7.700 kcal, así que bajar 1 kg por semana pide un déficit de unas 1.100 kcal por día, que ya es agresivo. Lo habitual y sostenible es un déficit de 500 kcal/día, que da alrededor de 0,45 kg por semana.',
    },
    {
      q: '¿Cuál es el mínimo de calorías al que puedo bajar?',
      a: 'Como piso de seguridad general se usan 1.500 kcal en varones y 1.200 en mujeres. Por debajo de eso cuesta cubrir vitaminas, minerales y proteína, y la pérdida de masa muscular se acelera. Bajar de ese piso requiere seguimiento profesional, no una calculadora.',
    },
    {
      q: '¿Cuánto superávit necesito para ganar masa muscular?',
      a: 'Entre 250 y 400 kcal por día sobre tu gasto es el rango de volumen limpio: da alrededor de 1 a 1,5 kg por mes de ganancia total con una proporción razonable de músculo. Arriba de 500 kcal la ganancia extra es mayormente grasa, y sin entrenamiento de fuerza el superávit no construye músculo.',
    },
    {
      q: '¿Cuánta proteína me corresponde?',
      a: 'Para hipertrofia la referencia es 1,6 a 2,2 g por kilo de peso corporal por día; la calculadora usa 1,8 g/kg como valor medio. En déficit conviene ir a la parte alta de ese rango para conservar músculo. Para una persona sedentaria el requerimiento baja a 0,8-1 g/kg.',
    },
    {
      q: '¿Cuánta agua tengo que tomar por día?',
      a: 'La referencia práctica es 35 ml por kilo de peso, ajustada hacia arriba si entrenás fuerte o hace calor, y algo hacia abajo en climas fríos. Para 75 kg con actividad moderada y clima templado son alrededor de 3 litros, contando lo que aportan infusiones y comidas.',
    },
    {
      q: '¿Las calorías del ejercicio se suman aparte?',
      a: 'No, y es el error más común. El factor de actividad que elegís ya incluye tu ejercicio semanal promedio: si además sumás las calorías que marca el reloj, contás el mismo gasto dos veces y el déficit desaparece.',
    },
    {
      q: '¿Cada cuánto tengo que recalcular mis calorías?',
      a: 'Cada 4 semanas o cada 4-5 kg de cambio de peso. A medida que bajás, el gasto baja también: el mismo plan que funcionaba al principio deja de generar déficit. Si el peso se estancó tres semanas seguidas, recalculá antes de recortar más.',
    },
    {
      q: '¿La calculadora sirve para chicos, embarazadas o adultos mayores?',
      a: 'No con estos números. Mifflin-St Jeor está validada en adultos sanos: en embarazo y lactancia hay que sumar un requerimiento extra, en la infancia y adolescencia se usan ecuaciones específicas por edad, y en adultos mayores con sarcopenia la estimación pierde precisión. En esos casos corresponde una evaluación profesional.',
    },
  ],

  sources: [
    {
      name: 'Mifflin MD et al. — A new predictive equation for resting energy expenditure in healthy individuals',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
      publisher: 'Am J Clin Nutr (PubMed)',
      date: '1990',
    },
    {
      name: 'Frankenfield D et al. — Comparison of predictive equations for resting metabolic rate in healthy adults',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15883556/',
      publisher: 'J Am Diet Assoc (PubMed)',
      date: '2005',
    },
    {
      name: 'FAO/OMS/UNU — Human energy requirements (informe de consulta de expertos)',
      url: 'https://www.fao.org/4/y5686e/y5686e00.htm',
      publisher: 'FAO',
      date: '2004',
    },
    {
      name: 'OMS — Alimentación sana (recomendaciones generales)',
      url: 'https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Guías Alimentarias para la Población Argentina (GAPA)',
      url: 'https://www.argentina.gob.ar/salud/alimentacion-saludable/guias-alimentarias',
      publisher: 'Ministerio de Salud, Argentina',
    },
    {
      name: 'Morton RW et al. — Systematic review of protein supplementation and resistance training (rango 1,6 g/kg)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/',
      publisher: 'Br J Sports Med (PubMed)',
      date: '2018',
    },
    {
      name: 'EFSA — Dietary reference values for water',
      url: 'https://www.efsa.europa.eu/en/efsajournal/pub/1459',
      publisher: 'EFSA Journal',
      date: '2010',
    },
    {
      name: 'Hall KD et al. — Quantification of the effect of energy imbalance on bodyweight (regla de las 7.700 kcal)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/21872751/',
      publisher: 'The Lancet (PubMed)',
      date: '2011',
    },
  ],

  replaces: [
    '/calculadora-calorias-diarias-tdee',
    '/calculadora-agua-diaria-necesaria',
    '/calculadora-deficit-calorico-perder-peso',
    '/calculadora-peso-objetivo-competicion',
    '/calculadora-superavit-calorico-masa-muscular',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Factores de actividad de Mifflin-St Jeor y su multiplicador de hidratación. */
export const ACTIVIDAD: Record<string, { factor: number; agua: number; label: string }> = {
  sedentario: { factor: 1.2, agua: 1, label: 'sedentario' },
  ligero: { factor: 1.375, agua: 1, label: 'ligero' },
  moderado: { factor: 1.55, agua: 1.15, label: 'moderado' },
  intenso: { factor: 1.725, agua: 1.3, label: 'intenso' },
  muy_intenso: { factor: 1.9, agua: 1.3, label: 'muy intenso' },
};

/** Multiplicadores de la meta de agua por clima. */
export const CLIMA: Record<string, number> = { frio: 0.95, templado: 1, caluroso: 1.15 };

/** Constantes nutricionales usadas por el compute(). */
export const NUTRI = {
  /** kcal equivalentes a 1 kg de masa corporal (Hall/Wishnofsky). */
  KCAL_POR_KG: 7700,
  /** Efecto térmico de los alimentos: ~10% de la ingesta. */
  TEF: 0.1,
  /** Déficit estándar de la rama "bajar de peso". */
  DEFICIT_ESTANDAR: 500,
  /** Piso de seguridad sin supervisión profesional. */
  PISO_M: 1500,
  PISO_F: 1200,
  /** g de proteína por kg para hipertrofia (medio del rango 1,6–2,2). */
  PROTEINA_G_KG: 1.8,
  /** ml de agua por kg de peso. */
  AGUA_ML_KG: 35,
};
