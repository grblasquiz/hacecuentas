import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Con qué nota entro?"
 *
 * Hub deliberadamente pequeño (2 calculadoras): la nota de admisión a la
 * universidad y la nota media del expediente son dos preguntas distintas de la
 * misma familia, y ninguna encaja en el hub de costes de estudiar.
 *
 * NINGUNA fila va en euros: todo es 'plain' o 'unit' con unidad de puntos.
 */

/** Disclaimer — textual de src/lib/disclaimers.ts (dominio 'math'). */
const DISCLAIMER_MATE =
  'Resultado matemático a partir de los datos ingresados. Verificá unidades, supuestos y redondeos antes de un uso técnico.';

export const hub: HubData = {
  slug: 'es/educacion/nota-de-admision',
  title: 'Nota de admisión y nota media en España: EvAU sobre 14 y expediente',
  description:
    'Calcula tu nota de admisión a la universidad con las ponderaciones de la EvAU sobre 14 puntos, y la nota media de tu expediente universitario ponderada por créditos.',
  silo: 'Educación',
  siloHref: '/es/educacion',

  eyebrow: 'Guía académica',
  h1: '¿Con qué nota entro y qué nota tengo?',
  lede:
    'En España se manejan dos notas que se confunden todo el tiempo. La de admisión a la universidad se calcula sobre 14 puntos y mezcla el bachillerato, la fase obligatoria de la EvAU y hasta cuatro puntos de materias ponderadas. La del expediente universitario es otra cosa: una media ponderada por créditos que se lee sobre 10 y también sobre 4.',
  stamps: ['Ponderaciones oficiales de la EvAU', 'Media ponderada por créditos', '2 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué nota quieres calcular?',
    intro: 'Son dos escalas distintas: no se pueden comparar entre sí.',
    items: [
      {
        id: 'admision',
        label: 'Nota de admisión a la universidad',
        hint: 'Sobre 14 puntos',
        answer:
          'La nota de admisión es el 60% del bachillerato más el 40% de la fase obligatoria, y sobre eso hasta 4 puntos de ponderaciones.',
        yes: [
          '60% de la nota media del bachillerato',
          '40% de la nota de la fase obligatoria de la EvAU',
          'Hasta 4 puntos por las dos mejores materias ponderadas',
          'Cada materia pondera 0,1 o 0,2 según el grado al que optes',
        ],
        warn: [
          DISCLAIMER_MATE,
          'La ponderación de cada materia depende del grado y de la universidad: la misma asignatura pondera 0,2 en un sitio y 0,1 en otro',
          'Sólo cuentan las dos materias que más suman: el resto no aporta nada aunque estén aprobadas',
          'Para superar la EvAU hace falta un mínimo de 4 en la fase obligatoria y un 5 en la media ponderada con el bachillerato',
        ],
        plazo: 'la nota de corte de cada grado se publica al cerrar cada llamamiento de admisión.',
      },
      {
        id: 'expediente',
        label: 'Nota media del expediente universitario',
        hint: 'Ponderada por créditos',
        answer:
          'La media del expediente pondera cada asignatura por sus créditos, no por su número: una de 12 créditos pesa el doble que una de 6.',
        yes: [
          'Suma de nota por créditos dividida entre el total de créditos superados',
          'Escala de 0 a 10, con su equivalencia en la escala de 0 a 4',
          'Menciones: aprobado, notable, sobresaliente y matrícula de honor',
          'Las asignaturas convalidadas suelen quedar fuera del cómputo',
        ],
        warn: [
          DISCLAIMER_MATE,
          'Cada universidad tiene su reglamento: algunas incluyen las convalidadas y otras no, y eso cambia la media',
          'Las asignaturas suspensas computan como 0 en muchas normativas hasta que se aprueban',
        ],
        plazo: 'la media oficial es la que figura en tu certificación académica personal.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'Para la admisión, usa la nota media de bachillerato y la de la fase obligatoria. Para el expediente, la suma de nota por créditos.',
  fields: [
    { id: 'bachillerato', label: 'Nota media de bachillerato', type: 'number', value: '7,5', min: 0, max: 10, step: 0.01 },
    { id: 'faseObligatoria', label: 'Nota de la fase obligatoria de la EvAU', type: 'number', value: '6,5', min: 0, max: 10, step: 0.01 },
    { id: 'materia1', label: 'Nota de la mejor materia ponderada', type: 'number', value: '8', min: 0, max: 10, step: 0.01 },
    {
      id: 'peso1',
      label: 'Ponderación de esa materia',
      type: 'select',
      value: '0.2',
      options: [
        { value: '0.2', label: '0,2 (afín al grado)' },
        { value: '0.1', label: '0,1' },
        { value: '0', label: 'No pondera' },
      ],
    },
    { id: 'materia2', label: 'Nota de la segunda materia ponderada', type: 'number', value: '7', min: 0, max: 10, step: 0.01 },
    {
      id: 'peso2',
      label: 'Ponderación de la segunda materia',
      type: 'select',
      value: '0.2',
      options: [
        { value: '0.2', label: '0,2 (afín al grado)' },
        { value: '0.1', label: '0,1' },
        { value: '0', label: 'No pondera' },
      ],
    },
    {
      id: 'notaCorte',
      label: 'Nota de corte del grado que quieres',
      type: 'number',
      value: '10',
      min: 5,
      max: 14,
      step: 0.01,
      help: 'La del último llamamiento del curso anterior, publicada por la universidad.',
    },
    {
      id: 'sumaNotaCreditos',
      label: 'Suma de (nota × créditos) de tu expediente',
      type: 'number',
      value: '1440',
      min: 0,
      max: 5000,
      step: 1,
    },
    {
      id: 'creditos',
      label: 'Créditos superados',
      type: 'number',
      value: '180',
      min: 1,
      max: 500,
      step: 6,
    },
  ],
  fineprint: DISCLAIMER_MATE,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu nota',
    caption:
      'Las franjas marcan los tramos habituales de las notas de corte. Cuanto más a la derecha, más grados se abren.',
    bands: [
      { label: 'Menos de 5', from: 0, to: 5, tone: 'bad' },
      { label: '5 a 9', from: 5, to: 9, tone: 'warn' },
      { label: '9 a 12', from: 9, to: 12, tone: 'good' },
      { label: '12 a 14', from: 12, to: 14, tone: 'good' },
    ],
  },
  breakdownTitle: 'Cómo se compone tu nota',
  breakdownIntro: 'Todas las notas están en puntos: ninguna fila lleva euros.',

  faq: [
    {
      q: '¿Cómo se calcula la nota de admisión?',
      a: 'Se toma el 60% de la nota media del bachillerato y el 40% de la fase obligatoria de la EvAU: eso da la nota de acceso, sobre 10. A esa cifra se le suman hasta 4 puntos procedentes de las dos mejores materias ponderadas, lo que deja la nota de admisión sobre 14.',
    },
    {
      q: '¿Qué son las ponderaciones?',
      a: 'Un coeficiente de 0,2 o 0,1 que cada universidad asigna a cada materia para cada grado, según lo afín que sea. Una nota de 9 en una materia que pondera 0,2 aporta 1,8 puntos; la misma nota con 0,1 aporta 0,9. Sólo cuentan las dos materias que más sumen.',
    },
    {
      q: '¿La misma asignatura pondera igual en todas las universidades?',
      a: 'No, y es un error caro. Cada universidad publica su propia tabla de ponderaciones por grado, y varían. Antes de elegir de qué te examinas en la fase voluntaria hay que mirar la tabla de la universidad concreta a la que quieres entrar.',
    },
    {
      q: '¿Cuánto tengo que sacar para aprobar la EvAU?',
      a: 'Hace falta al menos un 4 en la media de la fase obligatoria y que la media ponderada con el expediente de bachillerato llegue a 5. Con eso ya tienes acceso a la universidad, aunque otra cosa es alcanzar la nota de corte del grado que quieres.',
    },
    {
      q: '¿La nota de corte es una nota fija?',
      a: 'No. Es la nota del último admitido en cada llamamiento, así que depende de cuánta gente solicite ese grado y de qué notas traigan. Sube y baja cada año, y por eso la del curso anterior sólo sirve como referencia.',
    },
    {
      q: '¿Puedo subir nota repitiendo la EvAU?',
      a: 'Sí, presentándote de nuevo a la fase voluntaria o a la obligatoria en convocatorias posteriores. Se conserva siempre la mejor calificación obtenida, así que repetir no puede bajarte la nota, sólo mejorarla.',
    },
    {
      q: '¿Cómo se calcula la nota media del expediente universitario?',
      a: 'Sumando el producto de cada nota por los créditos de la asignatura y dividiendo entre el total de créditos. Es una media ponderada, no aritmética: una asignatura de 12 créditos pesa el doble que una de 6, aunque en el expediente aparezcan como una línea cada una.',
    },
    {
      q: '¿Qué es la escala de 0 a 4?',
      a: 'Una conversión que se usa en becas, en baremos de acceso a máster y en homologaciones internacionales: aprobado equivale a 1, notable a 2, sobresaliente a 3 y matrícula de honor a 4. Muchas convocatorias piden la nota en esa escala en vez de sobre 10.',
    },
    {
      q: '¿Las asignaturas convalidadas cuentan para la media?',
      a: 'Depende del reglamento de cada universidad. Algunas las incorporan con la nota de origen, otras las excluyen del cómputo y otras las computan como aprobado. Es una de las razones por las que dos expedientes idénticos pueden dar medias distintas.',
    },
    {
      q: '¿Y las asignaturas suspensas?',
      a: 'En la mayoría de normativas computan como cero mientras no se aprueben, lo que hunde la media de forma temporal. Al superarlas, la nota sustituye al cero y la media se recalcula.',
    },
  ],

  sources: [
    {
      name: 'Real Decreto de acceso y admisión a las enseñanzas universitarias oficiales de Grado',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-14717',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ministerio de Ciencia, Innovación y Universidades — acceso y admisión',
      url: 'https://www.universidades.gob.es/acceso-y-admision/',
      publisher: 'Ministerio de Ciencia, Innovación y Universidades',
    },
    {
      name: 'Real Decreto 1125/2003 — sistema europeo de créditos y sistema de calificaciones',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-17643',
      publisher: 'Boletín Oficial del Estado',
    },
  ],

  replaces: [
    '/calculadora-evau-nota-media-ponderaciones-grado-espana',
    '/calculadora-nota-media-expediente-universitario-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Pesos oficiales del acceso a la universidad. */
export const ACCESO = {
  pesoBachillerato: 0.6,
  pesoFaseObligatoria: 0.4,
  maxPuntosPonderacion: 4,
  notaMaxima: 14,
  minimoFaseObligatoria: 4,
  minimoAcceso: 5,
};

/** Equivalencias de la escala de 0 a 4 (RD 1125/2003). */
export const MENCIONES: Array<{ desde: number; nombre: string; escala4: number }> = [
  { desde: 9, nombre: 'Sobresaliente', escala4: 3 },
  { desde: 7, nombre: 'Notable', escala4: 2 },
  { desde: 5, nombre: 'Aprobado', escala4: 1 },
  { desde: 0, nombre: 'Suspenso', escala4: 0 },
];
