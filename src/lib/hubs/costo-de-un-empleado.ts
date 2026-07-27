import type { HubData } from './types';

/**
 * Hub para EMPLEADORES: qué desembolsa la empresa por un empleado registrado.
 *
 * Las alícuotas patronales (decreto 814/2001 con la unificación de la ley
 * 27.430) y la alícuota de ART por riesgo se IMPORTAN del módulo real
 * (src/lib/formulas/aportes-patronales-cargas-sociales.ts) desde la página.
 * Acá no se copia ningún porcentaje: si cambia la norma, cambia en un solo
 * lugar y este hub lo refleja solo.
 */
export const hub: HubData = {
  slug: 'trabajo/costo-de-un-empleado',
  title: '¿Cuánto me cuesta realmente un empleado? — Costo laboral 2026',
  description:
    'Calculá el costo laboral total de un empleado registrado en Argentina: sueldo bruto, contribuciones patronales del decreto 814/01, ART, seguro de vida obligatorio y provisiones de aguinaldo y vacaciones. Con costo por hora real y cuánto tenés que facturar para pagarlo.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación para empleadores',
  h1: '¿Cuánto me cuesta realmente un empleado?',
  lede:
    'El sueldo bruto es apenas la base. Encima van las contribuciones patronales, la ART, el seguro de vida obligatorio y las provisiones del aguinaldo y las vacaciones: el costo real ronda una vez y media el bruto. Partimos del caso más común y lo ajustás con tus datos.',
  stamps: ['Actualizado 27-07-2026', 'Dec. 814/01 · Ley 27.430 · Ley 24.557', '8 calculadoras adentro'],

  resultLabel: 'Costo mensual total para la empresa',

  cases: {
    title: '¿Qué querés saber?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'mensual',
        label: 'Cuánto me sale por mes en total',
        hint: 'El caso más consultado',
        answer: 'El costo mensual real es el bruto más contribuciones, ART, seguro de vida y provisiones.',
        yes: [
          'Sueldo bruto: la base sobre la que se calcula todo lo demás',
          'Contribuciones patronales del decreto 814/01: SIPA, INSSJP, Fondo Nacional de Empleo y asignaciones familiares (20,8% en el inciso a, 17,6% en el b)',
          'Obra social a cargo del empleador (ley 23.660)',
          'ART según el riesgo de tu actividad (ley 24.557) y seguro colectivo de vida obligatorio',
          'Provisión mensual del aguinaldo y de las vacaciones pagas',
        ],
        warn: [
          'Los aportes del trabajador (17%) NO son costo tuyo: salen del bruto, se los retenés y los depositás',
          'La alícuota patronal depende de la actividad y del tamaño: comercio y servicios grandes van al inciso a, el resto al inciso b',
          'La ART varía muchísimo por actividad: la de una constructora no se parece a la de un estudio contable',
          'Convenios con adicionales por antigüedad o presentismo suben la base de todo el cálculo',
        ],
        plazo: 'las cargas del mes se declaran e ingresan con el F.931 al mes siguiente, según la terminación de tu CUIT.',
      },
      {
        id: 'hora',
        label: 'Cuánto me cuesta la hora real',
        hint: 'Para presupuestar y cotizar',
        answer: 'La hora real se obtiene dividiendo el costo total mensual por las horas efectivamente trabajadas.',
        yes: [
          'Costo hora real = costo mensual total ÷ horas trabajadas al mes',
          'La jornada legal completa da unas 176 horas mensuales (48 semanales × 4,33 menos francos)',
          'Sirve de piso para cotizar un trabajo por hora o por proyecto',
          'Comparalo con el costo hora bruto: la diferencia es la mochila que se suele olvidar',
        ],
        warn: [
          'Si descontás vacaciones, feriados y ausentismo, las horas realmente productivas bajan y la hora real sube',
          'Nunca cotices sobre el costo hora bruto: cotizás por debajo del costo desde el primer minuto',
          'El tiempo no facturable (reuniones, capacitación, administración) también hay que repartirlo en las horas que sí facturás',
        ],
        plazo: 'la jornada máxima legal es de 8 horas diarias y 48 semanales (ley 11.544); lo que exceda se paga con recargo.',
      },
      {
        id: 'facturar',
        label: 'Cuánto tengo que facturar para pagarlo',
        hint: 'Punto de equilibrio',
        answer: 'Con tu margen bruto, la facturación necesaria es el costo mensual dividido por ese margen.',
        yes: [
          'Facturación necesaria = costo mensual total ÷ margen bruto',
          'El margen bruto es lo que queda después del costo de lo que vendés, antes de gastos fijos',
          'Con margen del 30%, cada peso de costo laboral exige más de tres pesos de facturación',
          'El resultado es el piso: todavía no cubre alquiler, impuestos ni tu propio retiro',
        ],
        warn: [
          'Si usás el margen neto en lugar del bruto, el número te va a dar más alto pero ya incluye gastos que quizás contaste dos veces',
          'La facturación necesaria sube todos los meses que suben paritarias, aunque tu precio de venta se quede quieto',
          'Ojo con el IVA y con Ingresos Brutos: la facturación necesaria de acá está expresada en términos netos',
        ],
        plazo: 'revisá este número cada vez que se homologa una paritaria de tu convenio.',
      },
      {
        id: 'capacitacion',
        label: 'Vale la pena capacitarlo',
        hint: 'ROI de capacitación',
        answer: 'El ROI compara el beneficio anual esperado contra el costo del curso más las horas no productivas.',
        yes: [
          'Costo total = costo del programa + las horas de capacitación valuadas al costo hora real',
          'ROI = (beneficio anual − costo total) ÷ costo total, expresado en porcentaje',
          'El payback dice en cuántos meses se recupera la inversión',
          'Las horas de curso se pagan igual: por eso entran al costo, no son gratis',
        ],
        warn: [
          'Un ROI negativo no siempre significa no hacerlo: puede haber retorno intangible (rotación, clima, calidad)',
          'El beneficio anual es una estimación tuya, no un dato: si lo inflás, el ROI miente',
          'Si el empleado se va a los tres meses, el beneficio anual no llega a realizarse',
        ],
        plazo: 'medí el beneficio recién a los 6-12 meses del curso: antes es demasiado pronto para atribuirle resultados.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'bruto', label: 'Sueldo bruto mensual del empleado', prefix: '$', value: '1.500.000', thousands: true },
    {
      id: 'actividad',
      label: 'Actividad de la empresa',
      type: 'select',
      value: 'comercio',
      options: [
        { value: 'comercio', label: 'Comercio o servicios grandes (inciso a)' },
        { value: 'servicios', label: 'Servicios — PyME (inciso b)' },
        { value: 'industria', label: 'Industria (inciso b)' },
        { value: 'agro', label: 'Agro (inciso b)' },
      ],
      help: 'Define la alícuota patronal del decreto 814/01.',
    },
    {
      id: 'riesgo',
      label: 'Riesgo de la actividad (ART)',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'bajo', label: 'Bajo — oficina, administración' },
        { value: 'medio', label: 'Medio — comercio, logística liviana' },
        { value: 'alto', label: 'Alto — construcción, industria pesada' },
      ],
    },
    { id: 'horasMes', label: 'Horas trabajadas por mes', type: 'number', min: 1, max: 300, value: 176, suffix: 'horas' },
    { id: 'margen', label: 'Margen bruto de tu negocio', type: 'number', min: 1, max: 100, value: 30, suffix: '%' },
    { id: 'costoCurso', label: 'Costo del programa de capacitación', prefix: '$', value: '400.000', thousands: true },
    { id: 'horasCurso', label: 'Horas de capacitación (pagas)', type: 'number', min: 0, max: 500, value: 40, suffix: 'horas' },
    { id: 'beneficioCurso', label: 'Beneficio anual esperado del curso', prefix: '$', value: '3.000.000', thousands: true },
  ],
  fineprint:
    'Es una orientación. Reducciones de contribuciones, adicionales de convenio y la alícuota real de tu ART pueden mover el resultado.',

  chart: {
    type: 'stacked',
    title: 'De qué se compone el costo del empleado',
    caption:
      'La barra parte el costo mensual en sus bloques: el sueldo bruto que ve el empleado y, apilado al lado, todo lo que sale de la empresa aparte —contribuciones patronales, obra social, ART, seguro de vida y las provisiones de aguinaldo y vacaciones—.',
  },
  breakdownTitle: 'Cómo se arma el costo real',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Cuánto cuesta realmente un empleado en Argentina?',
      a: 'Entre un 40% y un 55% más que su sueldo bruto, según la actividad y el riesgo de la ART. A las contribuciones patronales del decreto 814/01 se les suman la obra social del empleador, la ART, el seguro colectivo de vida obligatorio y las provisiones del aguinaldo y las vacaciones. Un bruto de un millón difícilmente cueste menos de un millón y medio.',
    },
    {
      q: '¿Cuál es el porcentaje de contribuciones patronales en 2026?',
      a: 'El decreto 814/01, con la unificación de la ley 27.430, tiene dos incisos. El inciso a (comercio y servicios grandes) se compone de 12,71% de SIPA, 1,62% de INSSJP, 1,07% de Fondo Nacional de Empleo y 5,40% de asignaciones familiares: 20,8% en total. El inciso b (PyMEs, industria, agro y servicios chicos) es 10,77% + 1,50% + 0,89% + 4,44% = 17,6%. Aparte van el 6% de obra social del empleador (ley 23.660) y la alícuota de ART, así que la carga patronal completa ronda el 26,8% en el inciso a y el 23,6% en el inciso b, más ART.',
    },
    {
      q: '¿Los aportes del empleado son costo para la empresa?',
      a: 'No. El 17% que se le descuenta al trabajador —11% de jubilación, 3% de PAMI y 3% de obra social— sale de su sueldo bruto: la empresa sólo actúa de agente de retención y lo deposita. Contarlo como costo propio infla el número y lleva a decisiones de precio equivocadas.',
    },
    {
      q: '¿Cómo calculo el costo por hora real de un empleado?',
      a: 'Dividí el costo mensual total —no el bruto— por las horas efectivamente trabajadas en el mes. Con jornada completa son unas 176 horas. Si querés el costo por hora productiva, descontá antes vacaciones, feriados, ausentismo y tiempo no facturable: la cifra sube bastante y es la que sirve para cotizar.',
    },
    {
      q: '¿Cuánto tengo que facturar para pagar un empleado?',
      a: 'Dividí el costo mensual total por tu margen bruto expresado en decimales. Con un margen del 30%, un empleado que cuesta dos millones por mes exige facturar unos seis millones y medio sólo para cubrirlo, antes del alquiler, los impuestos y tu propio retiro.',
    },
    {
      q: '¿Cuánto hay que provisionar de aguinaldo y vacaciones?',
      a: 'El aguinaldo es un doceavo del sueldo por mes, y conviene provisionarlo con sus contribuciones incluidas, porque el SAC también las devenga. Las vacaciones se pagan a razón del sueldo dividido 25 por día (art. 155 LCT): con 14 días anuales, prorrateado da algo más de un 4,5% mensual del bruto.',
    },
    {
      q: '¿Cuánto se paga de ART?',
      a: 'Depende del riesgo de la actividad y del historial de siniestros de la empresa. Como referencia, una actividad de riesgo bajo (oficina) ronda el 1% del bruto, una de riesgo medio el 2,5% y una de riesgo alto —construcción, industria pesada— puede superar el 5%. La cuota real la fija cada aseguradora sobre la masa salarial.',
    },
    {
      q: '¿Conviene capacitar a un empleado o contratar a alguien ya formado?',
      a: 'Comparalo con números: el ROI de la capacitación es el beneficio anual esperado menos el costo del curso y las horas no productivas, dividido por ese costo. Si el payback es menor a un año y la persona tiene baja probabilidad de irse, capacitar suele ganar. Contratar formado ahorra tiempo, pero paga una prima de mercado que se arrastra en el sueldo todos los meses.',
    },
    {
      q: '¿Cómo mido si el equipo produce lo suficiente?',
      a: 'Dividí el costo laboral total del período por las unidades producidas o los proyectos entregados: eso te da el costo laboral por unidad, el piso real de tu precio. Si el costo por unidad sube mientras el precio se queda quieto, el margen se está evaporando aunque la facturación crezca.',
    },
    {
      q: '¿Hay reducciones o beneficios en las contribuciones patronales?',
      a: 'Sí. El régimen prevé una detracción de la base imponible por trabajador y hay beneficios específicos para PyMEs y para ciertas zonas y actividades promovidas. Como cambian con frecuencia, esta estimación no las aplica: si tu empresa accede a alguna, el costo real va a ser algo menor que el de acá.',
    },
    {
      q: '¿Y si en vez de emplear contrato un monotributista?',
      a: 'El costo aparente baja, pero si la relación tiene dependencia real —horario, exclusividad, dirección— es empleo encubierto y el riesgo es una demanda por relación laboral no registrada, con indemnización, multas de la ley 24.013 e intereses. El ahorro se pierde varias veces en un solo juicio.',
    },
  ],

  sources: [
    {
      name: 'Decreto 814/2001 — alícuotas de contribuciones patronales',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/65000-69999/67980/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto actualizado',
    },
    {
      name: 'Ley 27.430 — reforma tributaria: unificación de alícuotas patronales y detracción',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/305000-309999/305262/norma.htm',
      publisher: 'InfoLeg',
      date: '2017',
    },
    {
      name: 'Ley 24.241 — Sistema Integrado Previsional Argentino (SIPA)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/639/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley 24.557 de Riesgos del Trabajo — cobertura de ART',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/27971/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley 23.660 — obras sociales: contribución del empleador',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/62/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Decreto 1567/1974 — seguro colectivo de vida obligatorio',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64060/norma.htm',
      publisher: 'InfoLeg',
    },
  ],

  replaces: [
    '/calculadora-aportes-patronales-empleado-registrado-cargas-sociales-2026',
    '/calculadora-costo-laboral-total-empleador-cargas',
    '/calculadora-costo-laboral-empleado',
    '/calculadora-costo-hora-empleado-real',
    '/calculadora-costo-total-empleado-empresa-argentina',
    '/calculadora-roi-capacitacion-empleados',
    '/calculadora-productividad-ingreso-por-hora',
    '/calculadora-productividad-empleados-output-hora',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Qué mide el total de cada rama. */
export const CASE_MATH: Record<string, { foco: 'mensual' | 'hora' | 'facturar' | 'capacitacion'; nota: string }> = {
  mensual: { foco: 'mensual', nota: 'costo mensual total, con provisiones' },
  hora: { foco: 'hora', nota: 'costo total ÷ horas trabajadas del mes' },
  facturar: { foco: 'facturar', nota: 'facturación neta necesaria para cubrirlo' },
  capacitacion: { foco: 'capacitacion', nota: 'modelo Phillips: beneficio contra costo total' },
};

/** Actividades que van por el inciso a del dec. 814/01; el resto, inciso b. */
export const INCISO_A = ['comercio'];

/** Días de vacaciones anuales del primer tramo (art. 150 LCT) usados en la provisión. */
export const DIAS_VACACIONES_BASE = 14;
/** Divisor del día de vacaciones (art. 155 LCT). */
export const DIVISOR_VACACIONES = 25;

/**
 * Seguro colectivo de vida obligatorio (dec. 1567/74): prima mensual por
 * trabajador. Es un importe fijo chico que la SSN actualiza; va como
 * REFERENCIAL, no como dato normativo.
 */
export const SEGURO_VIDA_MENSUAL = 700;
