import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta grasa corporal tengo?"
 * Arquetipo RAMIFICADO: hay cuatro maneras de estimarla y ninguna domina.
 *
 * Absorbe 8 calculadoras (ver hub.replaces).
 *
 * DIFERENCIA con /salud/peso-ideal-imc — no son el mismo hub:
 *   peso-ideal-imc responde "¿estoy en mi peso?" con IMC y peso ideal, o sea
 *   cuánto pesás para tu altura. Este responde la pregunta siguiente: de ese
 *   peso, cuánto es grasa y cuánto es músculo. Es la pregunta de quien entrena
 *   y ve que el IMC lo marca con sobrepeso teniendo masa muscular. Los dos hubs
 *   se linkean entre sí en el copy y en las FAQ.
 *
 * YMYL DE SALUD: el aviso del dominio `health` de src/lib/disclaimers.ts viaja
 * textual en hub.fineprint y como PRIMER `warn` de cada rama. No hay consejo
 * clínico en ninguna: el hub estima y remite al profesional.
 *
 * NOTAS DE CONTRATO:
 *  - Acá no hay plata: kg, cm y % van todos con `format: 'unit'` explícito.
 *  - `chart.type: 'scale'`: las franjas cambian según el sexo (ver ESCALA).
 */
export const hub: HubData = {
  slug: 'salud/grasa-corporal',
  title: '¿Cuánta grasa corporal tengo? Método Marina, pliegues y FFMI — 2026',
  description:
    'Estimá tu porcentaje de grasa corporal por circunferencias (método de la Marina de EE.UU.), por pliegues cutáneos (Jackson-Pollock), tu índice cintura-altura y tu FFMI de masa magra. Con las franjas del American Council on Exercise por sexo.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de composición corporal',
  h1: '¿Cuánta grasa corporal tengo?',
  lede:
    'El IMC te dice cuánto pesás para tu altura; no distingue un kilo de músculo de un kilo de grasa. Por eso alguien que entrena puede dar "sobrepeso" estando en forma. Acá vas un paso más allá: de tu peso, cuánto es grasa y cuánto es masa magra.',
  stamps: [
    'Actualizado 27-07-2026',
    'Franjas del ACE por sexo · Jackson-Pollock 3 pliegues',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Tu porcentaje de grasa corporal',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Las cuatro maneras usan los mismos datos de arriba. Elegí la que puedas medir con lo que tenés en casa: una cinta métrica alcanza para las dos primeras ramas.',
    items: [
      {
        id: 'navy',
        label: 'Por circunferencias, método Marina de EE.UU.',
        hint: 'Sólo cinta métrica. Es el método más práctico y el que mejor correlaciona sin equipo.',
        yes: [
          'Hombres: 495 ÷ (1,0324 − 0,19077 × log₁₀(cintura − cuello) + 0,15456 × log₁₀(altura)) − 450',
          'Mujeres: 495 ÷ (1,29579 − 0,35004 × log₁₀(cintura + cadera − cuello) + 0,22100 × log₁₀(altura)) − 450',
          'Clasificación en las franjas del American Council on Exercise, distintas para cada sexo',
          'Los kilos de grasa y los kilos de masa magra que salen de aplicar ese porcentaje a tu peso',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El error típico frente a un DEXA es de ±3 a ±4 puntos porcentuales: sirve para seguir la tendencia, no para un número exacto',
          'Medí siempre en ayunas, sin apretar la cinta y a la misma hora: dos centímetros de diferencia mueven el resultado más de un punto',
          'En personas muy musculosas la fórmula subestima la grasa, y en personas muy delgadas la sobreestima',
        ],
        plazo:
          'medí una vez por semana y mirá el promedio del mes: día a día el resultado se mueve por hinchazón y líquidos.',
        answer:
          'Con la altura, el cuello y la cintura (más la cadera si sos mujer) la fórmula de la Marina de EE.UU. estima tu porcentaje de grasa sin balanza especial ni calibre.',
      },
      {
        id: 'pliegues',
        label: 'Por pliegues cutáneos',
        hint: 'Necesitás un calibre. Es el método clásico de gimnasio, más preciso si la toma es buena.',
        yes: [
          'Jackson-Pollock de 3 pliegues: en hombres pecho, abdomen y muslo; en mujeres tríceps, suprailíaco y muslo',
          'Densidad corporal en hombres: 1,10938 − 0,0008267 × suma + 0,0000016 × suma² − 0,0002574 × edad',
          'Densidad corporal en mujeres: 1,0994921 − 0,0009929 × suma + 0,0000023 × suma² − 0,0001392 × edad',
          'Conversión de densidad a porcentaje por la ecuación de Siri: 495 ÷ densidad − 450',
          'La edad entra en la fórmula: a igual pliegue, más años dan más grasa estimada',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La toma de pliegues es la parte difícil: la variación entre dos personas midiendo al mismo sujeto llega a 4 puntos',
          'Tomá siempre del lado derecho, con el músculo relajado y leyendo a los dos segundos de cerrar el calibre',
          'Jackson-Pollock se validó en adultos de 18 a 61 años: fuera de ese rango el resultado pierde respaldo',
        ],
        plazo: 'que te mida siempre la misma persona y con el mismo calibre, o la comparación no vale.',
        answer:
          'La suma de tres pliegues más tu edad dan la densidad corporal, y la ecuación de Siri convierte esa densidad en porcentaje de grasa.',
      },
      {
        id: 'cintura',
        label: 'Índice cintura-altura y perímetro abdominal',
        hint: 'La medición de un solo número, la que mejor predice riesgo cardiometabólico.',
        yes: [
          'Índice cintura-altura (WHtR) = cintura ÷ altura, con el umbral práctico en 0,50',
          'La regla en una frase: tu cintura tiene que medir menos que la mitad de tu altura',
          'Perímetro abdominal contra los cortes de la OMS: hombres 94 y 102 cm, mujeres 80 y 88 cm',
          'Referencia IDF para población latinoamericana: hombres desde 90 cm, mujeres desde 80 cm',
          'Índice cintura-cadera (ICC): riesgo alto sobre 0,95 en hombres y sobre 0,85 en mujeres',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La cintura no distingue grasa subcutánea de grasa visceral, que es la que más pesa en el riesgo metabólico',
          'Un WHtR normal con porcentaje de grasa alto sigue siendo motivo de consulta: no alcanza con un solo indicador',
          'Medí a la altura del ombligo, al final de una espiración normal y sin contraer el abdomen',
        ],
        plazo:
          'una reducción del 5% al 10% del peso corporal suele bajar entre 3 y 5 cm de cintura en tres a seis meses.',
        answer:
          'Dividí tu cintura por tu altura: si el resultado es menor a 0,50 estás en zona de bajo riesgo. Es el indicador de una sola medida que mejor anticipa problemas cardiometabólicos.',
      },
      {
        id: 'ffmi',
        label: 'Masa magra y FFMI',
        hint: 'Para quien entrena: cuánto músculo tenés en relación a tu altura y dónde está el techo natural.',
        yes: [
          'Masa magra = peso × (1 − grasa ÷ 100); masa grasa = peso − masa magra',
          'FFMI = masa magra en kg ÷ altura en metros al cuadrado',
          'FFMI ajustado a 1,80 m (Kouri 1995): FFMI + 6,1 × (1,80 − tu altura en metros)',
          'Referencia en hombres: 20 es promedio, 22 está por encima, 25 es el techo natural descripto',
          'Referencia en mujeres: 16 es promedio, 18 está por encima, 22 es el tope habitual entrenando natural',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El FFMI arrastra el error de la estimación de grasa: si el porcentaje está mal, el FFMI también',
          'El techo de 25 sale de una muestra de fisicoculturistas de los años 90, no es una ley de la naturaleza',
          'Superarlo no prueba nada por sí solo: hay genética excepcional y hay errores de medición',
        ],
        plazo:
          'ganar masa magra es lento: entre 0,25 y 0,5 kg por mes en alguien entrenado, y más si recién empezás.',
        answer:
          'El FFMI mide tu músculo relativo a tu altura, que es justo lo que el IMC no puede ver. Dos personas con el mismo IMC pueden tener FFMI muy distintos.',
      },
    ],
  },

  inputsTitle: 'Cargá tus medidas',
  inputsIntro:
    'Con sexo, peso, altura, cuello y cintura ya tenés las dos primeras ramas. Los pliegues sólo hacen falta si tenés calibre.',
  fields: [
    {
      id: 'sexo',
      label: 'Sexo (las fórmulas y las franjas cambian)',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Masculino' },
        { value: 'f', label: 'Femenino' },
      ],
    },
    { id: 'peso', label: 'Peso', type: 'number', suffix: 'kg', min: 30, max: 300, step: 0.1, value: 80 },
    { id: 'altura', label: 'Altura', type: 'number', suffix: 'cm', min: 100, max: 250, step: 1, value: 178 },
    {
      id: 'edad',
      label: 'Edad',
      type: 'number',
      suffix: 'años',
      min: 15,
      max: 100,
      step: 1,
      value: 35,
      help: 'Entra en la fórmula de pliegues: a igual pliegue, más edad da más grasa estimada.',
    },
    {
      id: 'cuello',
      label: 'Perímetro de cuello',
      type: 'number',
      suffix: 'cm',
      min: 20,
      max: 80,
      step: 0.5,
      value: 39,
      help: 'Medí justo debajo de la nuez, con la cinta apenas inclinada hacia adelante.',
    },
    {
      id: 'cintura',
      label: 'Perímetro de cintura',
      type: 'number',
      suffix: 'cm',
      min: 40,
      max: 200,
      step: 0.5,
      value: 88,
      help: 'A la altura del ombligo, en horizontal, al final de una espiración normal y sin apretar.',
    },
    {
      id: 'cadera',
      label: 'Perímetro de cadera',
      type: 'number',
      suffix: 'cm',
      min: 40,
      max: 200,
      step: 0.5,
      value: 100,
      help: 'En la parte más ancha de los glúteos. Obligatorio para el método de la Marina en mujeres.',
    },
    {
      id: 'pliegue1',
      label: 'Pliegue 1 — pecho (hombres) o tríceps (mujeres)',
      type: 'number',
      suffix: 'mm',
      min: 1,
      max: 80,
      step: 0.5,
      value: 12,
    },
    {
      id: 'pliegue2',
      label: 'Pliegue 2 — abdomen (hombres) o suprailíaco (mujeres)',
      type: 'number',
      suffix: 'mm',
      min: 1,
      max: 80,
      step: 0.5,
      value: 22,
    },
    {
      id: 'pliegue3',
      label: 'Pliegue 3 — muslo (ambos sexos)',
      type: 'number',
      suffix: 'mm',
      min: 1,
      max: 80,
      step: 0.5,
      value: 16,
    },
    {
      id: 'porcionVisceral',
      label: 'Porción visceral de tu grasa total (opcional)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 60,
      step: 1,
      value: 12,
      help: 'Si tu balanza o un DEXA te lo informa. Debajo del 10% es distribución favorable; sobre 20%, elevada.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado. Todos los métodos de acá son estimaciones a partir de medidas externas: el error frente a un DEXA o una pesada hidrostática ronda los 3 a 4 puntos porcentuales.',

  chart: {
    type: 'scale',
    title: 'Dónde caés en la escala de grasa corporal',
    caption:
      'La escala arranca en 0% y usa las franjas del American Council on Exercise, que son distintas para cada sexo: grasa esencial, atleta, fitness, aceptable y obesidad. En hombres los cortes van en 6, 14, 18 y 25%; en mujeres, en 14, 21, 25 y 32%. El marcador es tu porcentaje estimado.',
    bands: [
      { label: 'Grasa esencial', from: 0, to: 6, tone: 'warn' },
      { label: 'Atleta', from: 6, to: 14, tone: 'good' },
      { label: 'Fitness', from: 14, to: 18, tone: 'good' },
      { label: 'Aceptable', from: 18, to: 25, tone: 'neutral' },
      { label: 'Obesidad', from: 25, to: 40, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu composición corporal, medida por medida',
  breakdownIntro:
    'Ninguna fila es plata: cada una lleva su unidad explícita (kg, cm, % o mm). Las barras comparan cada valor con el mayor.',

  faq: [
    {
      q: '¿Cuál es un porcentaje de grasa corporal normal?',
      a: 'Según el American Council on Exercise, en hombres: menos de 6% es grasa esencial, de 6 a 13% rango atleta, de 14 a 17% fitness, de 18 a 24% aceptable y 25% o más entra en obesidad. En mujeres los valores son más altos por fisiología, no por estar peor: menos de 14% esencial, de 14 a 20% atleta, de 21 a 24% fitness, de 25 a 31% aceptable y 32% o más obesidad.',
    },
    {
      q: '¿En qué se diferencia esto de la calculadora de IMC y peso ideal?',
      a: 'Son dos preguntas encadenadas. El IMC responde "¿estoy en mi peso?": divide tu peso por tu altura al cuadrado y te ubica en una franja poblacional, sin distinguir músculo de grasa. Este hub responde la siguiente: "de ese peso, ¿cuánto es grasa?". Por eso alguien que entrena puede dar 27 de IMC —técnicamente sobrepeso— con 12% de grasa y estar en forma. Si lo que querés es el IMC y el rango de kilos saludable para tu altura, ese cálculo está en <a href="/salud/peso-ideal-imc">¿estoy en mi peso? IMC y peso ideal</a>.',
    },
    {
      q: '¿Qué precisión tiene el método de la Marina de EE.UU.?',
      a: 'Su error estándar frente a la pesada hidrostática ronda los 3 a 4 puntos porcentuales. Es mucho para un número aislado y poco para seguir una tendencia: si medís siempre igual, la dirección del cambio es confiable aunque el valor absoluto no sea exacto. Su gran ventaja es que sólo pide una cinta métrica y no depende de la habilidad de quien mide, como sí pasa con los pliegues.',
    },
    {
      q: '¿Cómo se miden los tres pliegues de Jackson-Pollock?',
      a: 'Siempre del lado derecho, con el músculo relajado, tomando el pliegue con los dedos y leyendo el calibre a los dos segundos. En hombres van pecho (diagonal, a mitad de camino entre la axila y el pezón), abdomen (vertical, a 2 cm del ombligo) y muslo (vertical, a mitad de camino entre la cadera y la rodilla). En mujeres: tríceps (vertical, a mitad de brazo), suprailíaco (diagonal, sobre la cresta ilíaca) y muslo. Repetí cada toma tres veces y promediá.',
    },
    {
      q: '¿Qué es el índice cintura-altura y por qué importa tanto?',
      a: 'Es tu cintura dividida por tu altura, y la regla se dice en una frase: la cintura tiene que medir menos que la mitad de la altura. Por debajo de 0,50 el riesgo cardiometabólico es bajo; entre 0,50 y 0,60 está aumentado; y por encima de 0,60 es alto. Con una sola medición predice mejor el riesgo que el IMC, porque detecta la grasa abdominal, que es la que se asocia a diabetes tipo 2 e hipertensión.',
    },
    {
      q: '¿Cuál es la diferencia entre grasa subcutánea y visceral?',
      a: 'La subcutánea es la que se pellizca, está entre la piel y el músculo, y es metabólicamente bastante inerte. La visceral rodea los órganos del abdomen y drena directo al sistema porta hepático, lo que explica por qué impacta tanto más en el hígado, la insulina y los lípidos. Si la visceral es menos del 10% de tu grasa total, la distribución es favorable; entre 10 y 20% conviene vigilar la cintura; y por encima del 20% aparece asociación con marcadores de síndrome metabólico.',
    },
    {
      q: '¿Qué es el FFMI y para qué sirve?',
      a: 'Es el índice de masa libre de grasa: tu masa magra en kilos dividida por tu altura en metros al cuadrado. Es el IMC del músculo. Kouri lo ajustó a 1,80 m sumando 6,1 por cada metro de diferencia, para poder comparar personas de distinta estatura. En hombres 20 es promedio, 22 está por encima y 25 fue descripto como techo natural; en mujeres 16 es promedio y 22 es el tope habitual entrenando sin ayudas.',
    },
    {
      q: '¿Puedo tener IMC de sobrepeso y estar en forma?',
      a: 'Sí, y es lo más común en gente que hace fuerza. El músculo es más denso que la grasa: un mismo volumen pesa más. Un hombre de 1,78 m y 88 kg da 27,8 de IMC, que en la tabla de la OMS es sobrepeso; si su grasa corporal es del 12%, tiene 77 kg de masa magra y un FFMI ajustado por encima de 23, que es rango de atleta. El caso inverso también existe: peso normal con grasa alta y poco músculo, lo que se conoce como obesidad de peso normal. Si querés el número del IMC y el rango de kilos saludable para tu altura, está en <a href="/salud/peso-ideal-imc">¿estoy en mi peso?</a>.',
    },
    {
      q: '¿Cuánta grasa corporal se puede perder por mes sin perder músculo?',
      a: 'Con un déficit calórico moderado de 300 a 500 kcal diarias, una pérdida sostenible es de 0,5 a 1% del peso corporal por semana, o sea del 2 al 4% mensual. Más rápido que eso empieza a costar masa magra. Mantener el entrenamiento de fuerza y una ingesta de proteína de 1,6 a 2,2 g por kilo de peso es lo que mejor protege el músculo durante el déficit. Cualquier plan alimentario debería armarlo un nutricionista matriculado.',
    },
    {
      q: '¿Por qué las mujeres tienen porcentajes de grasa más altos?',
      a: 'Por fisiología, no por condición física. La grasa esencial —la que forma parte de membranas celulares, médula ósea y tejido reproductivo— es de alrededor del 3% en hombres y del 12% en mujeres, porque incluye el tejido mamario, la pelvis y el sostén hormonal del ciclo. Por eso todas las tablas corren las franjas unos 8 a 10 puntos hacia arriba en mujeres, y comparar el porcentaje entre sexos no tiene sentido.',
    },
    {
      q: '¿Sirven las balanzas de bioimpedancia?',
      a: 'Sirven para seguir tendencias, no para un valor absoluto. Miden la resistencia al paso de una corriente y la convierten a grasa con una ecuación poblacional, así que el estado de hidratación las mueve mucho: la misma persona puede dar 3 o 4 puntos distintos según la hora del día, si tomó agua o si acaba de entrenar. Si usás una, pesate siempre en las mismas condiciones —en ayunas, después de ir al baño, antes de entrenar— y mirá el promedio semanal.',
    },
    {
      q: '¿Cuál es el perímetro abdominal a partir del cual hay riesgo?',
      a: 'La OMS marca dos escalones. En hombres: riesgo aumentado desde 94 cm y sustancialmente elevado desde 102 cm. En mujeres: aumentado desde 80 cm y sustancialmente elevado desde 88 cm. La Federación Internacional de Diabetes usa cortes más exigentes para población latinoamericana, con 90 cm en hombres y 80 cm en mujeres, porque a igual cintura hay más riesgo metabólico que en poblaciones europeas.',
    },
  ],

  sources: [
    {
      name: 'Hodgdon JA, Beckett MB — Prediction of percent body fat for U.S. Navy men and women (Naval Health Research Center)',
      url: 'https://apps.dtic.mil/sti/citations/ADA143890',
      publisher: 'Naval Health Research Center',
      date: '1984',
    },
    {
      name: 'Jackson AS, Pollock ML — Generalized equations for predicting body density of men (Br J Nutr)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/718832/',
      publisher: 'PubMed',
      date: '1978',
    },
    {
      name: 'Jackson AS, Pollock ML, Ward A — Generalized equations for predicting body density of women',
      url: 'https://pubmed.ncbi.nlm.nih.gov/750124/',
      publisher: 'PubMed',
      date: '1980',
    },
    {
      name: 'ACE — Percent body fat norms for men and women',
      url: 'https://www.acefitness.org/resources/everyone/tools-calculators/percent-body-fat-calculator/',
      publisher: 'American Council on Exercise',
    },
    {
      name: 'ACSM — Guidelines for Exercise Testing and Prescription (composición corporal)',
      url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
      publisher: 'American College of Sports Medicine',
    },
    {
      name: 'OMS — Waist circumference and waist-hip ratio: report of a WHO expert consultation',
      url: 'https://www.who.int/publications/i/item/9789241501491',
      publisher: 'Organización Mundial de la Salud',
      date: '2008',
    },
    {
      name: 'Alberti KGMM et al. — Harmonizing the metabolic syndrome (Circulation), cortes IDF',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19805654/',
      publisher: 'PubMed',
      date: '2009',
    },
    {
      name: 'Kouri EM et al. — Fat-free mass index in users and nonusers of anabolic-androgenic steroids',
      url: 'https://pubmed.ncbi.nlm.nih.gov/7496846/',
      publisher: 'PubMed',
      date: '1995',
    },
    {
      name: 'Ashwell M, Gunn P, Gibson S — Waist-to-height ratio as a screening tool (Obesity Reviews)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22106927/',
      publisher: 'PubMed',
      date: '2012',
    },
  ],

  replaces: [
    '/calculadora-porcentaje-grasa-corporal',
    '/calculadora-indice-cintura-altura-whtr-riesgo',
    '/calculadora-cintura-cadera-rcc',
    '/calculadora-grasa-corporal-pliegues',
    '/calculadora-perimetro-abdominal-riesgo-cardiovascular',
    '/calculadora-ffmi-indice-masa-libre-grasa',
    '/calculadora-grasa-subcutanea-visceral-total-diferencia',
    '/calculadora-indice-cintura-estatura',
  ],

  lastReviewed: '2026-08-04',
  audience: 'global',
};

/**
 * Franjas del American Council on Exercise, por sexo, sobre las que se mapea
 * `position`. Son las mismas que usan src/lib/formulas/grasa-corporal.ts y
 * grasa-corporal-pliegues.ts.
 */
export const ESCALA: Record<string, { min: number; max: number; bands: Array<{ label: string; to: number; tone: string }> }> = {
  m: {
    min: 0,
    max: 40,
    bands: [
      { label: 'Grasa esencial (<6%)', to: 6, tone: 'prop' },
      { label: 'Atleta (6–13%)', to: 14, tone: 'good' },
      { label: 'Fitness (14–17%)', to: 18, tone: 'exit' },
      { label: 'Aceptable (18–24%)', to: 25, tone: 'warn' },
      { label: 'Obesidad (≥25%)', to: 40, tone: 'bad' },
    ],
  },
  f: {
    min: 0,
    max: 45,
    bands: [
      { label: 'Grasa esencial (<14%)', to: 14, tone: 'prop' },
      { label: 'Atleta (14–20%)', to: 21, tone: 'good' },
      { label: 'Fitness (21–24%)', to: 25, tone: 'exit' },
      { label: 'Aceptable (25–31%)', to: 32, tone: 'warn' },
      { label: 'Obesidad (≥32%)', to: 45, tone: 'bad' },
    ],
  },
};

/** Cortes de riesgo por perímetro y proporciones. */
export const CORTES = {
  /** OMS: perímetro abdominal, en cm. */
  oms: { m: { aumentado: 94, alto: 102 }, f: { aumentado: 80, alto: 88 } },
  /** IDF, población latinoamericana, en cm. */
  idf: { m: 90, f: 80 },
  /** Índice cintura-cadera. */
  icc: { m: { bajo: 0.85, alto: 0.95 }, f: { bajo: 0.75, alto: 0.85 } },
  /** Índice cintura-altura: umbral práctico único. */
  whtr: { saludable: 0.5, alto: 0.6, delgadez: 0.4 },
  /** FFMI ajustado: promedio y techo natural descripto por Kouri (1995). */
  ffmi: { m: { promedio: 20, sobre: 22, techo: 25 }, f: { promedio: 16, sobre: 18, techo: 22 } },
};
