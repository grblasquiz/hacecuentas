import type { HubData } from './types';

/**
 * Hub de decisión — "¿Estoy en mi peso?"
 * Arquetipo: CÁLCULO DOMINANTE (calculadora-imc se lleva casi todo el tráfico),
 * así que NO usa `cases`: la respuesta va en `answer`.
 *
 * Absorbe 4 calculadoras: IMC (OMS), peso ideal (Devine/Robinson/Lorentz),
 * IMC en adultos mayores (ESPEN 2018) y edad metabólica (Mifflin / Katch-McArdle).
 *
 * NOTAS DE CONTRATO:
 *  - El runtime ya soporta `format: 'unit'` + `unit` + `decimals` (por fila y a
 *    nivel resultado): este hub los usa para kg y años. `ref` queda sólo para
 *    referencias reales (año de la fórmula), nunca para la unidad.
 *  - `chart.type: 'scale'` sí tiene render propio: barra con franjas + marcador
 *    en `position`. Las franjas viajan con `from`/`to` en unidades de IMC.
 *  - `HubChart.bands` no se renderiza hoy (la escala real se arma en compute()
 *    desde SCALE); se deja declarado porque es el dato correcto.
 */
export const hub: HubData = {
  slug: 'salud/peso-ideal-imc',
  title: '¿Estoy en mi peso? IMC, rango saludable y peso ideal — 2026',
  description:
    'Calculá tu IMC con la clasificación de la OMS, el rango de peso saludable para tu altura, tu peso ideal por Devine, Robinson y Lorentz, el ajuste 23–28 si tenés 65 o más y tu edad metabólica estimada.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de salud',
  h1: '¿Estoy en mi peso? Veamos qué dice tu IMC.',
  lede:
    'Con tu peso y tu altura sale tu IMC, la categoría de la OMS y el rango de kilos saludable para tu estatura. Si sumás edad y grasa corporal, además ajustamos el rango para adultos mayores y estimamos tu edad metabólica.',
  stamps: ['Actualizado 27-07-2026', 'Rangos OMS vigentes (sin cambios desde 1997)', '4 calculadoras adentro'],

  resultLabel: 'Tu índice de masa corporal',

  inputsTitle: 'Completá tus datos',
  inputsIntro: 'Peso y altura alcanzan. Los demás campos afinan el resultado.',
  fields: [
    { id: 'peso', label: 'Peso', type: 'number', suffix: 'kg', min: 20, max: 300, step: 0.1, value: 70 },
    { id: 'altura', label: 'Altura', type: 'number', suffix: 'cm', min: 100, max: 250, step: 1, value: 170 },
    {
      id: 'sexo',
      label: 'Sexo (para las fórmulas de peso ideal)',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Masculino' },
        { value: 'f', label: 'Femenino' },
      ],
    },
    {
      id: 'edad',
      label: 'Edad',
      type: 'number',
      suffix: 'años',
      min: 18,
      max: 110,
      step: 1,
      value: 35,
      help: 'Con 65 o más ajustamos el rango saludable a 23–28 de IMC para proteger frente a la sarcopenia.',
    },
    {
      id: 'cintura',
      label: 'Cintura (opcional)',
      type: 'number',
      suffix: 'cm',
      min: 40,
      max: 200,
      step: 1,
      value: 85,
      help: 'Medí en horizontal a la altura del ombligo, sin apretar. Con esto sale el índice cintura/altura (WHtR).',
    },
    {
      id: 'grasa',
      label: 'Grasa corporal (opcional)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 70,
      step: 0.1,
      value: 22,
      help: 'Si la sabés, la edad metabólica se calcula con Katch-McArdle en vez de Mifflin-St Jeor. Dejá 0 si no la tenés.',
    },
  ],
  fineprint:
    'Es una orientación, no un diagnóstico. El IMC no distingue músculo de grasa: consultá con un profesional de la salud antes de tomar decisiones.',

  chart: {
    type: 'scale',
    title: 'Dónde caés en la escala de IMC',
    caption:
      'La escala va de 15 a 40 de IMC con las franjas de la OMS: bajo peso por debajo de 18,5; normal de 18,5 a 24,9; sobrepeso de 25 a 29,9; obesidad de 30 en adelante. Tu posición queda marcada sobre esa escala.',
    bands: [
      { label: 'Bajo peso', from: 15, to: 18.5, tone: 'warn' },
      { label: 'Peso normal', from: 18.5, to: 25, tone: 'good' },
      { label: 'Sobrepeso', from: 25, to: 30, tone: 'warn' },
      { label: 'Obesidad', from: 30, to: 40, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu peso frente a las referencias',
  breakdownIntro:
    'Todos los valores están en kilos, salvo la última fila. Las barras comparan cada referencia con la más alta.',

  answer: {
    title: 'Qué mirar además del número',
    copy:
      'El IMC ubica tu peso respecto de tu altura y sirve como primer tamiz poblacional, pero no mide composición corporal. Leelo junto con la cintura, la masa muscular y tu edad.',
    yes: [
      'IMC = peso en kg dividido por la altura en metros al cuadrado (fórmula OMS)',
      'Rango saludable estándar: IMC 18,5 a 24,9 — la calculadora lo traduce a kilos para tu altura',
      'De 65 años en adelante el rango sube a 23–28 (OMS) y ESPEN 2018 marca 22–27 como saludable',
      'Peso ideal por Devine, Robinson y Lorentz, más el promedio de las tres',
      'Índice cintura/altura (WHtR): por debajo de 0,5 es lo esperable',
      'Edad metabólica estimada a partir del gasto en reposo',
    ],
    warn: [
      'Con mucha masa muscular el IMC sobreestima el riesgo: un atleta puede dar "sobrepeso" con poca grasa',
      'Un IMC normal con cintura sobre el 50% de la altura igual indica grasa abdominal de riesgo',
      'En adultos mayores, un IMC por debajo de 22 es señal de riesgo nutricional, no de "estar flaco"',
      'La edad metabólica no es una métrica clínica estandarizada: sirve para seguimiento, no para diagnóstico',
    ],
    plazo: 'una pérdida sostenible es de 0,5 a 1 kg por semana; más rápido que eso se pierde músculo.',
  },

  faq: [
    {
      q: '¿Cuál es la tabla de IMC de la OMS?',
      a: 'Para adultos: menos de 18,5 es bajo peso; de 18,5 a 24,9 peso normal; de 25 a 29,9 sobrepeso; de 30 a 34,9 obesidad grado I; de 35 a 39,9 grado II; y 40 o más grado III. Los rangos siguen vigentes en 2026 sin cambios desde 1997.',
    },
    {
      q: '¿Cuánto debería pesar para mi altura?',
      a: 'Multiplicá tu altura en metros al cuadrado por 18,5 para el mínimo y por 24,9 para el máximo. Para 1,70 m eso da entre 53,5 y 72 kg. El hub te lo calcula solo y además te muestra el peso ideal de las tres fórmulas clásicas.',
    },
    {
      q: '¿Cuál de las fórmulas de peso ideal es la correcta?',
      a: 'Ninguna es "la correcta": Devine (1974) se usa en farmacología para dosificar, Robinson (1983) en estudios epidemiológicos y Lorentz es la más usada en Europa por su simplicidad. Por eso mostramos las tres y su promedio, y lo comparamos contra el rango de la OMS.',
    },
    {
      q: '¿El IMC es igual para hombres y mujeres?',
      a: 'Sí. La OMS usa el mismo rango 18,5–24,9 para ambos sexos en adultos. El sexo sí cambia las fórmulas de peso ideal (Devine, Robinson y Lorentz tienen coeficientes distintos), por eso el hub te lo pregunta.',
    },
    {
      q: '¿El IMC sirve en personas mayores de 65 años?',
      a: 'Con un ajuste. La OMS sugiere ampliar el rango saludable a 23–28 y el consenso ESPEN 2018 marca 22–27 como saludable en mayores de 65: mantener algo más de peso protege frente a la sarcopenia. Por debajo de 22 hay riesgo nutricional.',
    },
    {
      q: '¿Por qué un atleta puede tener IMC alto sin estar excedido?',
      a: 'Porque el músculo pesa más que la grasa y el IMC no distingue una masa de la otra. Un fisicoculturista con 8% de grasa puede dar 29 de IMC. En ese caso conviene mirar porcentaje de grasa corporal o relación cintura-cadera antes de actuar sobre el número.',
    },
    {
      q: '¿Para qué sirve la cintura si ya tengo el IMC?',
      a: 'El índice cintura/altura (WHtR) detecta grasa abdominal, que el IMC no ve. El umbral práctico es 0,5: si tu cintura supera la mitad de tu altura hay riesgo cardiometabólico aumentado aunque el IMC dé normal.',
    },
    {
      q: '¿Qué es la edad metabólica y cómo se calcula acá?',
      a: 'Es a qué edad correspondería tu gasto energético en reposo. Sin porcentaje de grasa se usa Mifflin-St Jeor y el resultado coincide con tu edad real; con grasa corporal se usa Katch-McArdle, que es más precisa en personas musculosas o con sobrepeso, y ahí el número se despega.',
    },
    {
      q: '¿Cómo bajo el IMC de manera saludable?',
      a: 'Con un déficit calórico moderado de 300 a 500 kcal por día más actividad combinada: 3 o 4 sesiones de cardio y 2 o 3 de fuerza por semana. La pérdida sostenible es de 0,5 a 1 kg por semana; más rápido implica perder masa muscular y efecto rebote.',
    },
    {
      q: '¿Existe una versión del IMC específica para Argentina?',
      a: 'No. El Ministerio de Salud de la Nación y la Sociedad Argentina de Nutrición usan los mismos rangos que la OMS. La diferencia aparece en la interpretación clínica, cuando se combina con perímetro de cintura y análisis de sangre.',
    },
    {
      q: '¿Cuánto puede variar mi IMC en un día?',
      a: 'Muy poco: el peso diario se mueve 1 o 2 kg por líquidos y comida. Si te pesás siempre a la misma hora, idealmente en ayunas, el IMC es estable. Para seguimiento importa la tendencia semanal o mensual, no la medición aislada.',
    },
  ],

  sources: [
    {
      name: 'OMS — Obesidad y sobrepeso (clasificación del IMC)',
      url: 'https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Ministerio de Salud de la Nación — Alimentación saludable, sobrepeso y obesidad',
      url: 'https://www.argentina.gob.ar/salud/alimentacion-saludable',
      publisher: 'Ministerio de Salud, Argentina',
    },
    {
      name: 'Robinson JD et al. — Determination of ideal body weight (1983)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/6869387/',
      publisher: 'PubMed',
      date: '1983',
    },
    {
      name: 'Winter JE et al. — BMI and all-cause mortality in older adults: a meta-analysis (Am J Clin Nutr 2014)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/24452240/',
      publisher: 'PubMed',
      date: '2014',
    },
    {
      name: 'ESPEN — Clinical Nutrition 2018: nutritional support for older persons',
      url: 'https://www.espen.org/guidelines-home/espen-guidelines',
      publisher: 'ESPEN',
      date: '2018',
    },
    {
      name: 'Cruz-Jentoft AJ et al. — Sarcopenia: revised European consensus (EWGSOP2)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30312372/',
      publisher: 'PubMed',
      date: '2019',
    },
    {
      name: 'Mifflin MD et al. — A new predictive equation for resting energy expenditure',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
      publisher: 'PubMed',
      date: '1990',
    },
  ],

  replaces: [
    '/calculadora-imc',
    '/calculadora-peso-ideal',
    '/calculadora-imc-adultos-mayores-edad-tabla',
    '/calculadora-edad-metabolica',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Franjas OMS de la escala, con el rango sobre el que se mapea `position`. */
export const SCALE = {
  min: 15,
  max: 40,
  bands: [
    { label: 'Bajo peso (<18,5)', to: 18.5, tone: 'prop' },
    { label: 'Peso normal (18,5–24,9)', to: 25, tone: 'good' },
    { label: 'Sobrepeso (25–29,9)', to: 30, tone: 'warn' },
    { label: 'Obesidad (≥30)', to: 40, tone: 'main' },
  ],
};
