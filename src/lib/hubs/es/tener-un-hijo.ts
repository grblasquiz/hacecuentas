import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto cuesta tener un hijo y qué me devuelven?"
 *
 * Absorbe 6 calculadoras. La pensión de alimentos tras divorcio no encaja en la
 * pregunta principal: se absorbe SÓLO por URL y se resuelve con una fila del
 * desglose y dos FAQ, sin romper el foco del hub.
 *
 * Constantes: espejo de
 * src/lib/formulas/permiso-paternidad-maternidad-espana-2026-semanas.ts,
 * deduccion-maternidad-1200-euros-espana.ts,
 * cheque-guarderia-0-3-anos-espana-deduccion.ts y
 * pension-alimenticia-divorcio-espana-tabla.ts.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'family'). */
const DISCLAIMER_FAMILIA =
  'Información general. En decisiones de salud, fertilidad, embarazo o crianza, consulta al profesional correspondiente.';

/** Disclaimer YMYL fiscal — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/familia/tener-un-hijo',
  title: 'Tener un hijo en España: permiso, guardería, deducciones y vuelta al cole',
  description:
    'Calcula lo que cuesta cada etapa de un hijo en España y lo que recuperas: permiso por nacimiento, deducción por maternidad, cheque guardería, beca comedor y vuelta al cole.',
  silo: 'Familia',
  siloHref: '/es/familia',

  eyebrow: 'Guía de costes y ayudas',
  h1: 'Voy a tener un hijo: ¿cuánto cuesta y qué me devuelven?',
  lede:
    'El gasto de un hijo no llega de golpe: cambia por etapas. El primer año pesa el permiso y la caída de ingresos; de los cero a los tres, la guardería; a partir de infantil, el material, el comedor y la vuelta al cole. Cada etapa tiene su ayuda o su deducción, y casi ninguna se aplica sola: hay que pedirla.',
  stamps: ['Prestaciones de la Seguridad Social', 'Deducciones estatales del IRPF', '6 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿En qué etapa estás?',
    intro: 'Cada etapa tiene un gasto dominante y una ayuda distinta.',
    items: [
      {
        id: 'nacimiento',
        label: 'Acaba de nacer',
        hint: 'Permiso por nacimiento y cuidado del menor',
        answer:
          'El permiso por nacimiento son 16 semanas para cada progenitor, pagadas al 100% de la base reguladora.',
        yes: [
          '16 semanas por progenitor: 6 obligatorias e ininterrumpidas tras el parto y 10 flexibles',
          'Prestación del 100% de la base reguladora, exenta de IRPF',
          'Dos semanas más por cada hijo adicional en parto múltiple',
          'Las 10 semanas flexibles pueden repartirse hasta que el menor cumpla 12 meses',
        ],
        warn: [
          DISCLAIMER_FAMILIA,
          'El permiso es intransferible: lo que no use un progenitor se pierde, no pasa al otro',
          'La prestación se calcula sobre la base de cotización del mes anterior, con tope: los sueldos altos cobran menos del 100% real',
          'Hay que solicitarla al INSS; no se activa sola por dar el parte de nacimiento',
        ],
        plazo: 'la prestación se solicita al INSS dentro de los tres meses siguientes al nacimiento.',
      },
      {
        id: 'guarderia',
        label: 'De 0 a 3 años',
        hint: 'Guardería y deducción por maternidad',
        answer:
          'La deducción por maternidad son 100 € al mes por hijo menor de tres años, con hasta 1.000 € más por gastos de guardería.',
        yes: [
          'Deducción por maternidad de 100 € al mes por hijo menor de tres años, hasta 1.200 € al año',
          'Incremento de hasta 1.000 € al año por gastos de custodia en guardería o centro autorizado',
          'Se puede cobrar de forma anticipada mes a mes con el modelo 140',
          'Muchas comunidades tienen además su propia deducción autonómica por guardería',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La deducción base está limitada por las cotizaciones a la Seguridad Social del período: si trabajas pocos meses, se recorta',
          'El incremento por guardería exige que el centro esté autorizado por la administración educativa: los cuidados a domicilio no cuentan',
          'Es una deducción, no una ayuda directa: si no la pides anticipada, la cobras un año después en la declaración',
        ],
        plazo: 'la solicitud del abono anticipado se presenta con el modelo 140.',
      },
      {
        id: 'escolar',
        label: 'Ya va al colegio',
        hint: 'Vuelta al cole y beca comedor',
        answer:
          'A partir de infantil el gasto se concentra en septiembre: material, libros, ropa y comedor.',
        yes: [
          'Material escolar, libros, uniforme y actividades extraescolares',
          'Comedor escolar, con beca según los umbrales de renta de tu comunidad',
          'Ayudas de libros de texto, casi siempre autonómicas o municipales',
          'La beca de comedor puede cubrir el 100%, el 75% o el 50% según el tramo de renta',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Los umbrales de renta de la beca de comedor los fija cada comunidad autónoma y varían mucho entre territorios',
          'Los plazos de solicitud suelen abrirse en primavera, meses antes del curso: perderlos deja sin ayuda todo el año',
        ],
        plazo: 'las convocatorias de comedor y libros suelen resolverse antes del inicio del curso.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'La base reguladora es tu base de cotización mensual. Si no la sabes, usa tu salario bruto mensual como referencia.',
  fields: [
    { id: 'base', label: 'Base reguladora mensual', prefix: '€', value: '2.000', thousands: true },
    { id: 'hijos', label: 'Hijos menores de 3 años', type: 'number', value: '1', min: 0, max: 6, step: 1 },
    {
      id: 'mesesAlta',
      label: 'Meses del año trabajando de alta en la Seguridad Social',
      type: 'number',
      value: '12',
      min: 0,
      max: 12,
      step: 1,
    },
    { id: 'guarderia', label: 'Gasto anual de guardería', prefix: '€', value: '3.000', thousands: true },
    {
      id: 'hijosEscolares',
      label: 'Hijos en edad escolar',
      type: 'number',
      value: '1',
      min: 0,
      max: 6,
      step: 1,
    },
    {
      id: 'rentaFamiliar',
      label: 'Renta familiar anual',
      prefix: '€',
      value: '30.000',
      thousands: true,
      help: 'Se usa para estimar el tramo de la beca de comedor.',
    },
    {
      id: 'umbralComedor',
      label: 'Umbral de renta de la beca de comedor en tu comunidad',
      prefix: '€',
      value: '11.000',
      thousands: true,
      help: 'Lo fija cada comunidad autónoma. Consúltalo en tu convocatoria.',
    },
    {
      id: 'multiple',
      label: 'Hijos nacidos en el mismo parto',
      type: 'number',
      value: '1',
      min: 1,
      max: 4,
      step: 1,
    },
  ],
  fineprint: DISCLAIMER_FAMILIA + ' ' + DISCLAIMER_FISCAL,

  chart: {
    type: 'bars',
    title: 'Gasto y ayudas del año',
    caption:
      'Compara lo que te gastas en el año con lo que recuperas por deducciones y becas: rara vez se compensa, pero la diferencia es grande si lo pides todo.',
  },
  breakdownTitle: 'Coste y ayudas, etapa por etapa',
  breakdownIntro:
    'Los importes son anuales salvo donde se indica. Las filas de semanas y porcentaje llevan su unidad.',

  faq: [
    {
      q: '¿Cuántas semanas de permiso me corresponden?',
      a: 'Dieciséis semanas por progenitor. Las seis primeras son obligatorias, ininterrumpidas y a jornada completa inmediatamente después del parto; las otras diez pueden repartirse de forma flexible hasta que el menor cumpla doce meses, en períodos semanales y previo aviso a la empresa.',
    },
    {
      q: '¿Se puede ceder el permiso al otro progenitor?',
      a: 'No. El permiso por nacimiento y cuidado del menor es individual e intransferible: lo que no disfruta un progenitor se pierde. Es precisamente lo que buscaba la equiparación de permisos.',
    },
    {
      q: '¿Cuánto se cobra durante el permiso?',
      a: 'El 100% de la base reguladora, que es la base de cotización del mes anterior. Está exenta de IRPF. Ojo con el tope: la base de cotización tiene un máximo mensual, así que quien gana por encima de ese tope cobra bastante menos del 100% de su salario real.',
    },
    {
      q: '¿Qué es la deducción por maternidad de 1.200 €?',
      a: 'Cien euros al mes por cada hijo menor de tres años para quien trabaja por cuenta propia o ajena y está de alta en la Seguridad Social. Se puede cobrar anticipadamente mes a mes solicitándolo con el modelo 140, o aplicarla de una vez en la declaración de la renta.',
    },
    {
      q: '¿Y el cheque guardería?',
      a: 'No es un cheque sino un incremento de la deducción por maternidad: hasta 1.000 € al año por hijo por los gastos de custodia en guardería o centro de educación infantil autorizado. Sólo cuenta si el centro está autorizado y si el gasto está facturado a tu nombre.',
    },
    {
      q: '¿Puedo cobrar las dos cosas a la vez?',
      a: 'Sí: la base de 1.200 € y el incremento de hasta 1.000 € por guardería son compatibles y se suman, hasta 2.200 € por hijo y año. Lo que no se puede es superar el importe de las cotizaciones a la Seguridad Social pagadas en el período.',
    },
    {
      q: '¿Cuánto cuesta la vuelta al cole?',
      a: 'Depende muchísimo del centro y de si hay uniforme o libros incluidos, pero el grueso son material escolar, libros de texto, mochila y ropa, concentrado todo en septiembre. Casi todas las comunidades y muchos ayuntamientos convocan ayudas de material o de libros con plazos que se abren antes del verano.',
    },
    {
      q: '¿Cómo funcionan los tramos de la beca de comedor?',
      a: 'Se compara la renta familiar con un umbral que fija cada comunidad y que sube con el número de miembros de la familia. Por debajo de algo más de la mitad del umbral suele cubrirse el 100%; después hay tramos del 75% y del 50%; y superando el umbral no hay beca. Familias numerosas, monoparentales o con discapacidad reconocida tienen umbrales mejorados.',
    },
    {
      q: '¿Cuánto se paga de pensión de alimentos tras un divorcio?',
      a: 'No hay una fórmula legal cerrada. Los juzgados usan como orientación las tablas del Consejo General del Poder Judicial, que cruzan los ingresos de ambos progenitores con el número de hijos y devuelven un porcentaje de la renta. El juez ajusta después según los gastos reales del menor, la custodia acordada y la capacidad de cada parte.',
    },
    {
      q: '¿La pensión de alimentos cambia con la custodia compartida?',
      a: 'Sí. En custodia compartida con ingresos parecidos suele no haber pensión y se reparten los gastos, aunque es habitual fijar una cuenta común para los gastos del menor. Si hay desequilibrio de ingresos importante, se fija una pensión que lo compense aun con custodia compartida.',
    },
    {
      q: '¿Las ayudas por hijo son estatales o autonómicas?',
      a: 'Las dos cosas, y se acumulan. La deducción por maternidad y el incremento por guardería son estatales; encima, casi todas las comunidades tienen deducciones autonómicas por nacimiento, por guardería o por familia numerosa, y los ayuntamientos suman ayudas de material y comedor. Este cálculo sólo recoge las estatales.',
    },
  ],

  sources: [
    {
      name: 'Seguridad Social — prestación por nacimiento y cuidado del menor',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/475d5d1f-d0b4-4c9f-9f8c-b8c4b0f0e5a3',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
    {
      name: 'Ley 35/2006 del IRPF — deducción por maternidad y por gastos de custodia',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Modelo 140 — abono anticipado de la deducción por maternidad',
      url: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G303.shtml',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Becas y ayudas al estudio del Ministerio de Educación',
      url: 'https://www.becaseducacion.gob.es/',
      publisher: 'Ministerio de Educación, Formación Profesional y Deportes',
    },
    {
      name: 'Tablas orientadoras para la determinación de las pensiones alimenticias',
      url: 'https://www.poderjudicial.es/cgpj/es/Temas/Tablas-orientadoras-para-la-determinacion-de-las-pensiones-alimenticias-de-los-hijos-en-los-procesos-de-familia/',
      publisher: 'Consejo General del Poder Judicial',
    },
  ],

  replaces: [
    '/calculadora-permiso-paternidad-maternidad-espana-2026-semanas',
    '/calculadora-cheque-guarderia-0-3-anos-espana-deduccion',
    '/calculadora-deduccion-maternidad-1200-euros-espana',
    '/calculadora-coste-vuelta-al-cole-2026',
    '/calculadora-beca-comedor-escolar-espana-renta-umbrales',
    '/calculadora-pension-alimenticia-divorcio-espana-tabla',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Permiso por nacimiento. Espejo de permiso-paternidad-maternidad-espana-2026-semanas.ts. */
export const PERMISO = {
  semanasObligatorias: 6,
  semanasOpcionales: 10,
  semanasExtraPorHijoAdicional: 2,
  pctPrestacion: 1,
  mesesParaDisfrutarFlexible: 12,
};

/** Deducciones estatales por hijo. Espejo de deduccion-maternidad-1200-euros-espana.ts. */
export const DEDUCCIONES = {
  maternidadMensualPorHijo: 100,
  maternidadTopeAnualPorHijo: 1200,
  guarderiaTopeAnualPorHijo: 1000,
};

/**
 * Tramos de la beca de comedor sobre el ratio renta/umbral.
 * Espejo de beca-comedor-escolar-espana-renta-umbrales.ts.
 */
export const BECA_COMEDOR = {
  tramos: [
    [0.55, 1],
    [0.8, 0.75],
    [1, 0.5],
    [Infinity, 0],
  ] as Array<[number, number]>,
  /** Coste anual de referencia del comedor escolar, editable por el usuario. */
  costeAnualReferencia: 1000,
};

/** Coste de referencia de la vuelta al cole por hijo (material, libros y ropa). */
export const VUELTA_AL_COLE_POR_HIJO = 400;

/**
 * Tabla orientadora del CGPJ: por tramo de ingresos del progenitor no custodio,
 * porcentaje de la renta según número de hijos (1, 2, 3 o 4).
 * Espejo de pension-alimenticia-divorcio-espana-tabla.ts.
 */
export const TABLA_CGPJ: Array<{ hasta: number; pct: number[] }> = [
  { hasta: 799, pct: [0.17, 0.24, 0.29, 0.33] },
  { hasta: 1299, pct: [0.2, 0.28, 0.34, 0.38] },
  { hasta: 1999, pct: [0.23, 0.3, 0.36, 0.41] },
  { hasta: 2999, pct: [0.25, 0.33, 0.39, 0.44] },
  { hasta: 4999, pct: [0.27, 0.35, 0.42, 0.47] },
  { hasta: Infinity, pct: [0.29, 0.38, 0.45, 0.5] },
];
