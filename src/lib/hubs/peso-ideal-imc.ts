import type { HubData } from './types';

/**
 * Hub de decisión — "¿Estoy en mi peso?"
 * Arquetipo: CÁLCULO DOMINANTE (calculadora-imc se lleva casi todo el tráfico),
 * así que NO usa `cases`: la respuesta va en `answer`.
 *
 * Absorbe las URLs históricas de IMC, peso ideal y adultos mayores. La antigua
 * "edad metabólica" no se expone: no es una métrica clínica estandarizada.
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
  title: 'Calculadora de IMC y peso ideal: tabla OMS y rango saludable',
  description:
    'Calculá tu IMC, consultá la tabla de la OMS y conocé el rango de peso orientativo para tu altura. Gratis, privado y explicado paso a paso.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de salud',
  h1: '¿Estoy en mi peso? Veamos qué dice tu IMC.',
  lede:
    'Con tu peso y tu altura sale tu IMC, la categoría de la OMS y el rango de kilos orientativo para tu estatura. Si agregás cintura, también calculamos la relación cintura/altura.',
  stamps: ['Revisado 31-07-2026', 'Clasificación OMS para adultos', 'Cálculo privado'],

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
      help: 'La edad agrega contexto: en personas mayores el IMC debe interpretarse junto con el estado nutricional y la masa muscular.',
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
      help: 'Medí a mitad de camino entre la última costilla y la parte superior de la cadera, al terminar una respiración normal.',
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
      'En mayores de 65 años el resultado requiere contexto clínico: masa muscular, alimentación, enfermedades y evolución del peso',
      'Peso ideal por Devine, Robinson y Lorentz, mostrado como rango entre las tres fórmulas',
      'Índice cintura/altura (WHtR): por debajo de 0,5 es lo esperable',
      'La categoría es orientativa y no equivale a un diagnóstico individual',
    ],
    warn: [
      'Con mucha masa muscular el IMC sobreestima el riesgo: un atleta puede dar "sobrepeso" con poca grasa',
      'Un IMC normal con cintura sobre el 50% de la altura igual indica grasa abdominal de riesgo',
      'En adultos mayores, una baja de peso involuntaria o la pérdida de fuerza ameritan una evaluación profesional aunque el IMC parezca normal',
      'Durante el embarazo y antes de los 18 años se necesitan referencias específicas; esta calculadora es sólo para adultos no embarazados',
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
      a: 'Sirve como punto de partida, pero no conviene cambiar automáticamente la categoría con un corte único. En personas mayores importan también la pérdida de peso reciente, la alimentación, la fuerza y la masa muscular. Si hubo una baja involuntaria o fragilidad, consultá a un profesional.',
    },
    {
      q: '¿Por qué un atleta puede tener IMC alto sin estar excedido?',
      a: 'Porque, para un mismo volumen, el músculo es más denso que la grasa y el IMC no distingue la composición corporal. Una persona muy musculosa puede tener IMC alto con poca grasa. En ese caso conviene sumar una medida de cintura y una evaluación de composición corporal.',
    },
    {
      q: '¿Para qué sirve la cintura si ya tengo el IMC?',
      a: 'La relación cintura/altura agrega una aproximación de adiposidad central, que el IMC no capta. NICE recomienda intentar mantener la cintura por debajo de la mitad de la altura; entre 0,5 y 0,59 indica riesgo aumentado y 0,6 o más, riesgo aún mayor. Se interpreta mejor cuando el IMC es menor de 35.',
    },
    {
      q: '¿Cómo bajo el IMC de manera saludable?',
      a: 'No hace falta perseguir un número aislado. Si necesitás bajar de peso, priorizá cambios graduales que puedas sostener: alimentación variada, actividad física regular, fuerza, descanso y seguimiento profesional si tenés enfermedades, tomás medicación o el cambio de peso es importante.',
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
      name: 'NICE — Interpretación de la relación cintura/altura',
      url: 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity',
      publisher: 'National Institute for Health and Care Excellence',
      date: '2025',
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

  lastReviewed: '2026-07-31',
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
