import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto me cuesta estudiar y llego a beca?"
 *
 * Absorbe 5 calculadoras: grado público vs privado, FP de grado medio y
 * superior, máster oficial vs título propio, becas MEC y beca Erasmus.
 *
 * Constantes: espejo de
 * src/lib/formulas/universidad-publica-vs-privada-coste-grado-espana.ts,
 * master-oficial-titulo-propio-precio-espana.ts,
 * becas-mec-2026-espana-renta-familiar-rendimiento.ts y
 * beca-erasmus-mensualidad-pais-destino-2026.ts.
 *
 * El precio del crédito lo fija cada comunidad autónoma: se deja como campo
 * editable con valores de referencia.
 */

/** Disclaimer — textual de src/lib/disclaimers.ts (dominio 'math'). */
const DISCLAIMER_MATE =
  'Resultado matemático a partir de los datos ingresados. Verificá unidades, supuestos y redondeos antes de un uso técnico.';

export const hub: HubData = {
  slug: 'es/educacion/cuanto-cuesta-estudiar',
  title: 'Cuánto cuesta estudiar en España: grado, FP, máster y becas',
  description:
    'Calcula el coste real de una carrera, una FP o un máster en España, en pública y en privada, y cuánto te descuenta la beca MEC o la ayuda Erasmus según tu renta familiar.',
  silo: 'Educación',
  siloHref: '/es/educacion',

  eyebrow: 'Guía de costes y becas',
  h1: '¿Cuánto me va a costar estudiar y llego a beca?',
  lede:
    'El precio de estudiar en España depende de tres cosas que casi nunca se miran juntas: los créditos que tiene el título, el precio del crédito que fija tu comunidad autónoma y si entras o no en beca. Entre una pública con beca y una privada sin ella hay una diferencia de decenas de miles de euros por el mismo título.',
  stamps: ['Precio del crédito por comunidad', 'Umbrales de las becas del Ministerio', '5 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué vas a estudiar?',
    intro:
      'El precio del crédito lo fija cada comunidad autónoma dentro de una horquilla estatal: los valores que ves son de referencia y conviene sustituirlos por el de tu universidad.',
    items: [
      {
        id: 'grado',
        label: 'Un grado universitario',
        hint: 'Normalmente 240 créditos',
        answer:
          'Un grado son 240 créditos repartidos en cuatro cursos: el coste sale de multiplicar créditos por el precio del crédito de tu comunidad.',
        yes: [
          'Créditos del título por el precio del crédito de tu comunidad',
          'Recargo por segunda y tercera matrícula de una asignatura suspensa',
          'Tasas administrativas y seguro escolar',
          'En privada, precio cerrado por curso en vez de por crédito',
        ],
        warn: [
          DISCLAIMER_MATE,
          'El precio del crédito varía mucho entre comunidades autónomas: el mismo grado puede costar el doble cambiando de región',
          'No incluye alojamiento ni manutención, que suelen pesar más que la matrícula si estudias fuera de casa',
          'Repetir asignaturas encarece la matrícula de forma progresiva',
        ],
        plazo: 'la beca del Ministerio se solicita normalmente entre marzo y mayo, antes de matricularse.',
      },
      {
        id: 'fp',
        label: 'Formación profesional',
        hint: 'Grado medio o superior',
        answer:
          'La FP pública es casi gratuita en grado medio y con tasas moderadas en grado superior; la privada cobra por curso.',
        yes: [
          'Grado medio público: matrícula gratuita o tasas simbólicas',
          'Grado superior público: tasas anuales que fija cada comunidad',
          'Material, uniforme y seguro escolar',
          'FP privada o concertada: precio cerrado mensual o por curso',
        ],
        warn: [
          DISCLAIMER_MATE,
          'Las tasas de grado superior varían mucho por comunidad autónoma y algunas las han suprimido',
          'La FP dual tiene beca de empresa que puede cubrir buena parte del coste',
        ],
        plazo: 'la admisión en FP pública se resuelve en verano, con varias adjudicaciones.',
      },
      {
        id: 'master',
        label: 'Un máster',
        hint: 'Oficial u título propio',
        answer:
          'Un máster oficial público cuesta una fracción de uno privado o de un título propio, y sólo el oficial da acceso al doctorado.',
        yes: [
          'Máster oficial en universidad pública: precio del crédito regulado',
          'Máster oficial en privada: precio cerrado, mucho más alto',
          'Título propio: precio libre, sin reconocimiento oficial',
          'Sólo el máster oficial da acceso al doctorado y puntúa en oposiciones',
        ],
        warn: [
          DISCLAIMER_MATE,
          'Un título propio no es equivalente a un máster oficial aunque se venda con el mismo nombre: no habilita para el doctorado',
          'Los másteres habilitantes para ejercer una profesión son siempre oficiales: comprueba la habilitación antes de pagar',
        ],
        plazo: 'las preinscripciones de máster oficial suelen abrirse en primavera.',
      },
      {
        id: 'erasmus',
        label: 'Un curso de Erasmus',
        hint: 'Ayuda según el país de destino',
        answer:
          'La ayuda Erasmus se paga por mes y cambia según el coste de vida del país de destino, en tres grupos.',
        yes: [
          'Ayuda mensual europea según el grupo de país de destino',
          'Complementos por situación socioeconómica y por movilidad verde',
          'Suele sumarse una ayuda de la propia universidad o de la comunidad autónoma',
          'La matrícula se paga en la universidad de origen, no en la de destino',
        ],
        warn: [
          DISCLAIMER_MATE,
          'La ayuda cubre una parte del coste: en países caros no llega ni para el alquiler',
          'El pago suele llegar fraccionado y con retraso: hay que ir con colchón',
        ],
        plazo: 'las convocatorias de movilidad se resuelven con casi un año de antelación.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'Sustituye el precio del crédito por el de tu universidad: es el dato que más cambia el resultado.',
  fields: [
    { id: 'creditos', label: 'Créditos del título', type: 'number', value: '240', min: 30, max: 360, step: 6 },
    {
      id: 'precioCredito',
      label: 'Precio del crédito en tu comunidad',
      prefix: '€',
      value: '18',
      thousands: true,
      help: 'En pública suele ir de 12 a 35 € el crédito en grado, y en torno a 27 € en máster oficial.',
    },
    {
      id: 'tipoCentro',
      label: 'Tipo de centro',
      type: 'select',
      value: 'publica',
      options: [
        { value: 'publica', label: 'Pública (precio por crédito)' },
        { value: 'privada_low', label: 'Privada económica' },
        { value: 'privada_mid', label: 'Privada media' },
        { value: 'privada_top', label: 'Privada de precio alto' },
      ],
    },
    {
      id: 'miembros',
      label: 'Miembros de la unidad familiar',
      type: 'number',
      value: '4',
      min: 1,
      max: 10,
      step: 1,
    },
    { id: 'rentaFamiliar', label: 'Renta familiar anual', prefix: '€', value: '30.000', thousands: true },
    {
      id: 'grupoErasmus',
      label: 'Grupo del país de destino (Erasmus)',
      type: 'select',
      value: 'grupo2',
      options: [
        { value: 'grupo1', label: 'Grupo 1 · coste alto (nórdicos, Irlanda)' },
        { value: 'grupo2', label: 'Grupo 2 · coste medio (Alemania, Francia, Italia)' },
        { value: 'grupo3', label: 'Grupo 3 · coste bajo (Polonia, Chequia, Grecia)' },
      ],
    },
    { id: 'mesesErasmus', label: 'Meses de estancia Erasmus', type: 'number', value: '9', min: 2, max: 12, step: 1 },
    { id: 'costeVida', label: 'Coste de vida mensual estimado fuera de casa', prefix: '€', value: '700', thousands: true },
  ],
  fineprint: DISCLAIMER_MATE,

  chart: {
    type: 'bars',
    title: 'Lo que pagas y lo que te descuentan',
    caption:
      'La matrícula es sólo una parte: alojamiento y manutención suelen pesar más, y la beca descuenta de todo el conjunto.',
  },
  breakdownTitle: 'El coste real de tu título',
  breakdownIntro:
    'Los importes son del título completo salvo donde se indica. Las filas de créditos y meses llevan su unidad.',

  faq: [
    {
      q: '¿Cuánto cuesta un grado en una universidad pública?',
      a: 'Depende del precio del crédito que fije tu comunidad autónoma, que se mueve dentro de una horquilla estatal. Con 240 créditos, la diferencia entre la comunidad más barata y la más cara supera con holgura los dos mil euros por la carrera completa, por el mismo título.',
    },
    {
      q: '¿Y en una privada?',
      a: 'La privada cobra un precio cerrado por curso que multiplica varias veces el de la pública. Además suele haber tasas de reserva de plaza y de material. En la carrera completa la diferencia con la pública se cuenta en decenas de miles de euros.',
    },
    {
      q: '¿Qué pasa si suspendo una asignatura?',
      a: 'Que la vuelves a pagar, y más cara: la segunda matrícula tiene un recargo y la tercera y la cuarta, mayor todavía. Es el gasto oculto que más descoloca a las familias, porque nadie lo presupuesta al empezar.',
    },
    {
      q: '¿La FP es gratis?',
      a: 'El grado medio público lo es prácticamente, salvo tasas simbólicas y material. El grado superior público sí tiene tasas anuales que fija cada comunidad, aunque varias las han suprimido. En centros privados y concertados se paga una cuota mensual como en cualquier colegio privado.',
    },
    {
      q: '¿Qué diferencia hay entre un máster oficial y un título propio?',
      a: 'El oficial está verificado por la ANECA, aparece en el Registro de Universidades, da acceso al doctorado y puntúa en oposiciones y bolsas de empleo público. El título propio lo diseña libremente la universidad, no tiene ese reconocimiento y suele costar bastante más que un oficial público.',
    },
    {
      q: '¿Cómo funcionan los umbrales de la beca del Ministerio?',
      a: 'Hay tres umbrales de renta familiar que suben con el número de miembros de la unidad. Por debajo del primero se accede a las cuantías completas, entre el primero y el segundo a cuantías parciales, y entre el segundo y el tercero sólo a la beca de matrícula. Por encima del tercero no hay beca.',
    },
    {
      q: '¿La beca depende sólo de la renta?',
      a: 'No: hay también un umbral de patrimonio familiar y requisitos académicos de nota mínima de acceso y de créditos superados cada curso. Suspender demasiado hace perder la beca aunque la renta siga siendo baja, y en algunos casos obliga a devolverla.',
    },
    {
      q: '¿Cuánto da la beca Erasmus?',
      a: 'Una cantidad mensual europea que depende del grupo de coste de vida del país de destino, más los complementos por situación socioeconómica o por viajar en transporte sostenible. Encima suele haber ayudas adicionales de la propia universidad y de la comunidad autónoma.',
    },
    {
      q: '¿La beca Erasmus cubre el curso?',
      a: 'Casi nunca. En países del grupo de coste alto la ayuda no llega ni para el alquiler, así que hay que contar con aportación familiar o ahorro. Además el pago llega fraccionado y con retraso, y una parte se cobra al volver, tras justificar la estancia.',
    },
    {
      q: '¿Se puede tener beca del Ministerio y Erasmus a la vez?',
      a: 'Sí, son compatibles: la del Ministerio cubre matrícula y cuantías por renta, y la Erasmus es una ayuda a la movilidad. De hecho, ser becario del Ministerio suele dar derecho al complemento socioeconómico de la Erasmus.',
    },
    {
      q: '¿Qué gasto se lleva más dinero de verdad?',
      a: 'El alojamiento, si estudias fuera de casa. Una habitación en una ciudad universitaria grande cuesta al año bastante más que la matrícula completa de un grado público. Por eso comparar sólo el precio de la matrícula da una idea muy engañosa del coste real.',
    },
  ],

  sources: [
    {
      name: 'Becas y ayudas al estudio — umbrales y cuantías',
      url: 'https://www.becaseducacion.gob.es/becas-y-ayudas/informacion-general/cuantias-umbrales.html',
      publisher: 'Ministerio de Educación, Formación Profesional y Deportes',
    },
    {
      name: 'Ministerio de Ciencia, Innovación y Universidades — precios públicos universitarios',
      url: 'https://www.universidades.gob.es/',
      publisher: 'Ministerio de Ciencia, Innovación y Universidades',
    },
    {
      name: 'Registro de Universidades, Centros y Títulos (RUCT)',
      url: 'https://www.educacion.gob.es/ruct/home',
      publisher: 'Ministerio de Ciencia, Innovación y Universidades',
    },
    {
      name: 'Erasmus+ — ayudas a la movilidad de estudiantes',
      url: 'https://www.sepie.es/',
      publisher: 'Servicio Español para la Internacionalización de la Educación',
    },
    {
      name: 'TodoFP — formación profesional del sistema educativo',
      url: 'https://www.todofp.es/',
      publisher: 'Ministerio de Educación, Formación Profesional y Deportes',
    },
  ],

  replaces: [
    '/calculadora-universidad-publica-vs-privada-coste-grado-espana',
    '/calculadora-fp-grado-medio-superior-precio-publica-privada',
    '/calculadora-master-oficial-titulo-propio-precio-espana',
    '/calculadora-becas-mec-2026-espana-renta-familiar-rendimiento',
    '/calculadora-beca-erasmus-mensualidad-pais-destino-2026',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Coste anual de referencia en centros privados. Espejo de la fórmula vieja. */
export const PRIVADA_ANUAL: Record<string, number> = {
  privada_low: 8000,
  privada_mid: 12000,
  privada_top: 16000,
};

/** Tasas anuales de referencia de la FP pública. */
export const FP_TASAS = {
  gradoMedio: 0,
  gradoSuperiorAnual: 120,
  materialAnual: 250,
};

/** Precio del crédito de referencia en máster. Espejo de la fórmula vieja. */
export const MASTER_CREDITO = {
  oficial_publico: 27,
  oficial_privado: 180,
  titulo_propio: 90,
};

/**
 * Umbrales de renta familiar de las becas del Ministerio, por número de
 * miembros de la unidad. Espejo de becas-mec-2026-espana-renta-familiar-rendimiento.ts.
 */
export const UMBRALES_BECA: Record<string, { u1: number; u2: number; u3: number }> = {
  1: { u1: 8422, u2: 13236, u3: 14112 },
  2: { u1: 13623, u2: 22594, u3: 24089 },
  3: { u1: 18884, u2: 30668, u3: 32697 },
  4: { u1: 24089, u2: 38413, u3: 46044 },
  5: { u1: 28189, u2: 43410, u3: 52543 },
  6: { u1: 31928, u2: 47808, u3: 58695 },
  7: { u1: 35483, u2: 52208, u3: 64849 },
  8: { u1: 38831, u2: 56303, u3: 70697 },
};

export const INCREMENTO_UMBRAL = { u1: 3348, u2: 4095, u3: 3391 };

/** Cuantía de referencia de la beca completa (matrícula más cuantías). */
export const BECA_CUANTIA = {
  completa: 3500,
  parcial: 1700,
  soloMatricula: 0,
};

/** Ayuda Erasmus mensual por grupo de país. Espejo de la fórmula vieja. */
export const ERASMUS_MENSUAL: Record<string, number> = {
  grupo1: 310,
  grupo2: 270,
  grupo3: 230,
};

/** Recargo de matrícula por repetir asignatura. */
export const RECARGO_MATRICULA = { segunda: 1.3, tercera: 1.9 };
