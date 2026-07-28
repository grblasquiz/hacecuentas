import type { HubData } from './types';

/**
 * Hub de decisión — "Me voy del trabajo: ¿qué me tienen que pagar?" (LATAM + España).
 *
 * Decisión de arquitectura: UN hub con el país como rama, no seis hubs por país.
 * El precedente de hubs por país (sueldo-neto-chile, sueldo-neto-mexico,
 * renta-colombia) aplica cuando cada país trae varias calculadoras propias y
 * la pregunta se responde distinto en cada uno. Acá la PREGUNTA es idéntica en
 * los seis mercados ("me voy / me echan, ¿qué me corresponde?") y lo único que
 * cambia son los nombres de los conceptos y las fórmulas. Además el reparto es
 * 3 calcs MX, 2 CO, 2 PE y 1 de CL, BO y ES: tres hubs de una sola calc serían
 * thin content. El país es una rama, no un hub.
 *
 * Las liquidaciones son plata (YMYL): disclaimer laboral textual de
 * src/lib/disclaimers.ts en el fineprint y como primer warn de cada rama.
 */

const DISCLAIMER_LABORAL =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const hub: HubData = {
  slug: 'trabajo/liquidacion-latam',
  title: 'Me voy del trabajo: ¿qué me tienen que pagar? — México, Colombia, Perú, Chile, Bolivia y España',
  description:
    'Finiquito, liquidación, cesantías, prima, CTS, gratificación, indemnización y desahucio: elegí tu país y calculá lo que te corresponde cuando terminás la relación laboral.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación laboral por país',
  h1: 'Terminás el trabajo: veamos qué te tienen que pagar.',
  lede:
    'Cada país arma la liquidación con conceptos distintos: en México es el finiquito, en Colombia las cesantías y la prima, en Perú la CTS y la gratificación, en Chile la indemnización por años de servicio, en Bolivia el desahucio y en España los 20 días por año. Elegí el tuyo y ajustá los datos.',
  stamps: ['Actualizado 28-07-2026', '6 países cubiertos', '11 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿En qué país trabajás?',
    intro: 'Partimos por México. Si trabajás en otro país, cambialo: cambian los conceptos y las fórmulas.',
    items: [
      {
        id: 'mx',
        label: 'México',
        hint: 'Finiquito y liquidación · LFT',
        answer:
          'En México el finiquito son las partes proporcionales; la liquidación agrega 3 meses más 20 días por año si el despido fue injustificado.',
        yes: [
          'Salarios devengados y no pagados',
          'Aguinaldo proporcional: 15 días de salario por año (Art. 87 LFT), prorrateado',
          'Vacaciones proporcionales según la tabla del Art. 76 reformado, más la prima vacacional del 25%',
          'Prima de antigüedad: 12 días de salario por año, proporcional en las fracciones, con la base topeada en 2 salarios mínimos de la zona (Arts. 162 y 486 LFT)',
          'Si el despido fue injustificado: 3 meses de salario más 20 días por año (Arts. 48 y 50 LFT)',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'La prima de antigüedad sólo corresponde por despido o por renuncia con 15 años o más de servicio',
          'El ISR de la liquidación se muestra como estimación de tasa efectiva: la retención real depende de tu acumulado anual',
        ],
        plazo: 'el patrón debe pagarte el finiquito al terminar la relación; ante negativa tenés 2 meses para demandar (Art. 518 LFT).',
      },
      {
        id: 'co',
        label: 'Colombia',
        hint: 'Cesantías, prima y vacaciones · CST',
        answer:
          'En Colombia se liquidan cesantías, sus intereses del 12%, la prima de servicios pendiente y las vacaciones.',
        yes: [
          'Cesantías: un mes de salario por año, proporcional a los días trabajados',
          'Intereses sobre cesantías: 12% anual, proporcional (Ley 52 de 1975)',
          'Prima de servicios del semestre en curso (Art. 306 CST)',
          'Vacaciones causadas y no disfrutadas',
          'Si ganás hasta 2 SMLMV, el auxilio de transporte entra en la base de cesantías y prima',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'La indemnización por despido sin justa causa (Art. 64 CST) NO está incluida acá: se calcula aparte y depende de tu salario en SMLMV y del tipo de contrato',
        ],
        plazo: 'si no te pagan al terminar el contrato corre la indemnización moratoria: un día de salario por cada día de mora (Art. 65 CST).',
      },
      {
        id: 'pe',
        label: 'Perú',
        hint: 'CTS y gratificación · D.S. 001-97-TR',
        answer:
          'En Perú se liquidan la CTS trunca, la gratificación trunca con su bonificación del 9% y las vacaciones pendientes.',
        yes: [
          'CTS trunca del semestre: base dividida 12, por los meses computables',
          'La base de CTS suma un sexto de la última gratificación',
          'Gratificación trunca del semestre (Ley 27735) más la bonificación extraordinaria del 9% (Ley 29351)',
          'Vacaciones truncas y no gozadas',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'La indemnización por despido arbitrario (1,5 remuneraciones por año, tope 12) NO está incluida: se reclama por la vía judicial',
          'Si cobrás asignación familiar, sumá el 10% de la RMV a tu remuneración antes de calcular',
        ],
        plazo: 'la CTS se deposita hasta el 15 de mayo y el 15 de noviembre; al cesar se paga trunca dentro de las 48 horas.',
      },
      {
        id: 'cl',
        label: 'Chile',
        hint: 'Finiquito · Art. 161 y 163 CT',
        answer:
          'En Chile la indemnización por años de servicio sólo corresponde si te despiden por necesidades de la empresa, con tope de 11 años.',
        yes: [
          'Indemnización por años de servicio: un sueldo por año, con tope de 11 años (Art. 163 CT)',
          'La fracción mayor a 6 meses cuenta como año completo',
          'Indemnización sustitutiva del aviso previo: un sueldo, si no te avisaron con 30 días',
          'Feriado proporcional: los días hábiles pendientes se pagan en días corridos (factor 7/5)',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Por renuncia voluntaria (Art. 159 N°2) NO corresponde indemnización por años ni aviso: sólo feriado y haberes pendientes',
          'No aplicamos el tope de 90 UF sobre la base de cálculo del Art. 172 CT: si tu remuneración lo supera, la indemnización real va a ser menor',
        ],
        plazo: 'el finiquito debe firmarse ante ministro de fe dentro de los 10 días hábiles del término del contrato.',
      },
      {
        id: 'bo',
        label: 'Bolivia',
        hint: 'Finiquito LGT · DS 110',
        answer:
          'En Bolivia la indemnización por tiempo de servicio se paga aunque renuncies; el desahucio de 3 sueldos sólo si te despiden sin causa.',
        yes: [
          'Indemnización por tiempo de servicio: un sueldo promedio por año, sin tope desde el DS 110/2009',
          'Se paga proporcional a partir de los 90 días de antigüedad, incluso si renunciás',
          'Desahucio de 3 sueldos si el despido fue sin causa justificada (Art. 12 LGT)',
          'Aguinaldo proporcional y vacaciones pendientes',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Con despido por causa justificada (Art. 16 LGT) se pierde la indemnización y el desahucio',
          'El sueldo promedio es el de los últimos 3 meses, incluyendo bonos y comisiones habituales',
        ],
        plazo: 'el finiquito se paga dentro de los 15 días del retiro; pasado ese plazo corre una multa del 30% (DS 28699).',
      },
      {
        id: 'es',
        label: 'España',
        hint: 'Despido objetivo · Art. 52 y 53 ET',
        answer:
          'En España el despido objetivo paga 20 días de salario por año, con tope de 12 mensualidades.',
        yes: [
          'Indemnización: 20 días de salario por año de servicio (Art. 53.1.b ET)',
          'Tope de 12 mensualidades, equivalente a 360 días de salario',
          'La fracción de año se prorratea por meses',
          '15 días de salario si no te dieron el preaviso (Art. 53.1.c ET)',
          'Vacaciones devengadas y no disfrutadas',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Si el despido se declara improcedente la indemnización sube a 33 días por año con tope de 24 mensualidades: eso no se calcula acá',
          'Si tenés antigüedad anterior a febrero de 2012 puede corresponderte el tramo de 45 días por año de la regla transitoria',
        ],
        plazo: 'tenés 20 días hábiles desde el despido para impugnarlo: es un plazo de caducidad y no se prorroga.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Los valores de ejemplo son de referencia: cambiá el sueldo por el tuyo en la moneda de tu país.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo bruto mensual (en tu moneda)',
      value: '20.000',
      thousands: true,
      help: 'En México usamos este importe dividido 30 como salario diario. En Bolivia poné el promedio de los últimos 3 meses.',
    },
    { id: 'anios', label: 'Años de antigüedad', type: 'number', min: 0, value: 4 },
    { id: 'meses', label: 'Meses sueltos además de los años', type: 'number', min: 0, max: 11, value: 7 },
    {
      id: 'mesesAnio',
      label: 'Meses trabajados en el año en curso',
      type: 'number',
      min: 0,
      max: 12,
      value: 7,
      help: 'Manda el aguinaldo y las vacaciones proporcionales (México, Bolivia) y las cesantías (Colombia).',
    },
    {
      id: 'mesesSem',
      label: 'Meses trabajados en el semestre en curso',
      type: 'number',
      min: 0,
      max: 6,
      value: 1,
      help: 'Lo usan la CTS y la gratificación de Perú, y la prima de servicios de Colombia.',
    },
    { id: 'diasVac', label: 'Días de vacaciones o feriado pendientes', type: 'number', min: 0, value: 10 },
    {
      id: 'diasPend',
      label: 'Días de sueldo trabajados y no pagados',
      type: 'number',
      min: 0,
      max: 31,
      value: 15,
      help: 'Los días del último período que todavía no cobraste. Poné 0 si te pagaron todo.',
    },
    {
      id: 'motivo',
      label: '¿Cómo termina la relación?',
      type: 'select',
      value: 'despido',
      options: [
        { value: 'despido', label: 'Me despiden sin causa' },
        { value: 'renuncia', label: 'Renuncio' },
        { value: 'mutuo', label: 'Mutuo acuerdo' },
      ],
    },
    {
      id: 'zonaMx',
      label: 'Zona geográfica (sólo México)',
      type: 'select',
      value: 'general',
      options: [
        { value: 'general', label: 'Zona general' },
        { value: 'frontera', label: 'Zona Libre de la Frontera Norte' },
      ],
      help: 'Define el tope de 2 salarios mínimos de la prima de antigüedad (Art. 486 LFT).',
    },
    {
      id: 'aviso',
      label: '¿Te dieron el preaviso?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'si', label: 'Sí, con el plazo legal' },
        { value: 'no', label: 'No me avisaron' },
      ],
      help: 'Chile: 30 días. España: 15 días. Si no te avisaron, se paga en dinero.',
    },
  ],
  fineprint: DISCLAIMER_LABORAL,

  chart: {
    type: 'donut',
    title: 'Composición de la liquidación',
    caption:
      'Separa lo que cobrás por la ruptura (indemnización, desahucio, aviso) de lo que ya venías devengando (aguinaldo, prima, cesantías, CTS, vacaciones) y de los descuentos.',
  },
  breakdownTitle: 'Qué compone tu liquidación',
  breakdownIntro: 'Cada concepto lleva el artículo de ley del país que elegiste. Los importes van en la moneda local.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre finiquito y liquidación en México?',
      a: 'El finiquito es lo que se paga siempre que termina la relación: salarios pendientes, aguinaldo proporcional, vacaciones y prima vacacional. La liquidación agrega los conceptos indemnizatorios del despido injustificado: 3 meses de salario (Art. 48 LFT) más 20 días por año trabajado (Art. 50 LFT). Si renunciás cobrás finiquito, no liquidación.',
    },
    {
      q: 'En Colombia, ¿me tienen que pagar las cesantías al salir?',
      a: 'Sí. Las cesantías acumuladas del año en curso que todavía no se consignaron al fondo se liquidan y se pagan directamente al trabajador, junto con los intereses del 12% anual proporcional. Las de años anteriores ya están en tu fondo de cesantías y las retirás desde ahí.',
    },
    {
      q: '¿La prima de servicios se paga si me voy en la mitad del semestre?',
      a: 'Sí, proporcional a los días trabajados del semestre. La prima es un mes de salario por año (medio mes por semestre) y al terminar el contrato se liquida la parte causada, aunque no llegues al 30 de junio o al 20 de diciembre.',
    },
    {
      q: '¿Qué es la CTS trunca en Perú?',
      a: 'Es la parte de la CTS del semestre en curso que se te paga al cesar, en lugar de esperar al depósito de mayo o noviembre. Se calcula dividiendo la base (remuneración computable más un sexto de la última gratificación) por 12 y multiplicando por los meses computables del semestre.',
    },
    {
      q: 'En Chile, ¿cobro indemnización si renuncio?',
      a: 'No. La indemnización por años de servicio corresponde cuando el empleador invoca el Art. 161 (necesidades de la empresa) o el caso fortuito. Si renunciás por el Art. 159 N°2 sólo cobrás el feriado proporcional y las remuneraciones devengadas, salvo que tu contrato individual pacte algo mejor.',
    },
    {
      q: '¿Por qué en Bolivia cobro indemnización aunque renuncie?',
      a: 'Porque el Decreto Supremo 110 de 2009 reconoció el derecho a la indemnización por tiempo de servicio también en el retiro voluntario, a partir de los 90 días de antigüedad. Lo que no corresponde por renuncia es el desahucio de 3 sueldos, que es exclusivo del despido sin causa.',
    },
    {
      q: '¿Cuánto es el tope de la indemnización por despido objetivo en España?',
      a: 'Doce mensualidades, es decir 360 días de salario. Con 20 días por año, el tope se alcanza a los 18 años de antigüedad: a partir de ahí la indemnización deja de crecer. Si el despido se declara improcedente la regla cambia a 33 días por año con tope de 24 mensualidades.',
    },
    {
      q: '¿Los conceptos de la liquidación pagan impuesto a las ganancias o su equivalente?',
      a: 'Depende del país y del concepto. En México la indemnización está exenta de ISR hasta 90 UMA por año de servicio (Art. 93 LISR) y la prima de antigüedad tiene su propia exención; el aguinaldo exenta 30 UMA. En Perú la gratificación no sufre descuentos de ONP, AFP ni EsSalud, y la CTS es intangible. En España la indemnización por despido está exenta de IRPF hasta el mínimo legal obligatorio, con tope de 180.000 euros.',
    },
    {
      q: '¿Qué pasa si el empleador no me paga en plazo?',
      a: 'Casi todos los sistemas tienen recargo. En Colombia el Art. 65 CST hace correr un día de salario por cada día de mora. En Bolivia el DS 28699 fija una multa del 30% pasados los 15 días. En México la mora habilita el reclamo ante el Centro de Conciliación. En Chile la Ley Bustos impide poner término al contrato si hay cotizaciones impagas.',
    },
    {
      q: '¿Sirve esta calculadora si trabajo en Argentina?',
      a: 'No: Argentina tiene su propio esquema de indemnización, preaviso, integración y SAC. Para ese caso usá la calculadora de indemnización por despido y la de liquidación final, que aplican la Ley de Contrato de Trabajo.',
    },
    {
      q: '¿Los días de vacaciones se pagan brutos o netos?',
      a: 'Se liquidan sobre la remuneración bruta y después se les aplican los descuentos que correspondan en cada país. En Colombia y Perú las vacaciones no gozadas se pagan sin descuento de seguridad social cuando son indemnizatorias; en México se descuenta ISR sobre la parte gravada.',
    },
    {
      q: '¿Qué documentación tengo que pedir al salir?',
      a: 'Constancia de la relación laboral y del último salario, recibo detallado con cada concepto liquidado y las constancias de aportes. En Chile el finiquito se firma ante ministro de fe; en Bolivia se presenta ante el Ministerio de Trabajo; en México conviene revisar el acta ante el Centro de Conciliación antes de firmar.',
    },
  ],

  sources: [
    {
      name: 'Ley Federal del Trabajo — arts. 48, 50, 76, 79, 80, 87 y 162',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
      publisher: 'Cámara de Diputados de México',
    },
    {
      name: 'Código Sustantivo del Trabajo — arts. 249, 253, 306 y 65 (prima, cesantías y mora)',
      url: 'https://www.mintrabajo.gov.co/normatividad/leyes-y-decretos-ley',
      publisher: 'Ministerio del Trabajo de Colombia',
    },
    {
      name: 'Decreto 1469 de 2025 — salario mínimo y auxilio de transporte 2026',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo de Colombia',
      date: '29-12-2025',
    },
    {
      name: 'D.S. 001-97-TR (TUO de la Ley de CTS) y Leyes 27735 y 29351 (gratificaciones)',
      url: 'https://www.gob.pe/mtpe',
      publisher: 'Ministerio de Trabajo y Promoción del Empleo del Perú',
    },
    {
      name: 'Código del Trabajo de Chile — arts. 159, 161, 163 y 172',
      url: 'https://www.dt.gob.cl/legislacion/1624/w3-propertyvalue-22270.html',
      publisher: 'Dirección del Trabajo de Chile',
    },
    {
      name: 'Ley General del Trabajo de Bolivia y Decreto Supremo 110/2009',
      url: 'https://www.mintrabajo.gob.bo/',
      publisher: 'Ministerio de Trabajo, Empleo y Previsión Social de Bolivia',
    },
    {
      name: 'Estatuto de los Trabajadores — arts. 52 y 53 (despido objetivo)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
      publisher: 'Boletín Oficial del Estado de España',
    },
    {
      name: 'Unidad de Medida y Actualización vigente',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'Salarios mínimos generales y de la Zona Libre de la Frontera Norte vigentes',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI · publicados en el DOF',
      date: '19-12-2025',
    },
  ],

  replaces: [
    '/calculadora-finiquito-liquidacion-mexico-2026',
    '/calculadora-aguinaldo-mexico-2026',
    '/calculadora-prima-vacacional-mexico-2026',
    '/calculadora-prima-servicios-colombia-2026',
    '/calculadora-liquidacion-cesantias-colombia-2026',
    '/calculadora-cts-peru-compensacion-tiempo-servicios-2026',
    '/calculadora-gratificacion-peru-julio-diciembre-2026',
    '/calculadora-finiquito-renuncia-chile-articulo-162',
    '/calculadora-finiquito-bolivia-desvinculacion',
    '/calculadora-indemnizacion-despido-objetivo-espana-20-dias',
    '/calculadora-prima-de-antiguedad-mexico',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};

/**
 * Constantes por país. Los valores fiscales caducan: el año de referencia va
 * en `anio` y la fuente en `sources` del hub.
 *
 * MX: salario mínimo general diario y UMA diaria — espejo de src/lib/data/mexico-2026.ts.
 * CO: SMLMV y auxilio de transporte — espejo de src/lib/data/colombia-2026.ts.
 */
export const PAISES: Record<string, any> = {
  mx: {
    nombre: 'México',
    moneda: 'MXN',
    simbolo: '$',
    locale: 'es-MX',
    anio: 2026,
    smDiario: 315.04,
    smDiarioFrontera: 440.87,
    umaDiaria: 117.31,
    exentoSeparacionUmas: 90,
    diasAguinaldo: 15,
    primaVacacionalPct: 25,
    isrEfectivoEstimado: 0.15,
  },
  co: {
    nombre: 'Colombia',
    moneda: 'COP',
    simbolo: '$',
    locale: 'es-CO',
    anio: 2026,
    smlmv: 1750905,
    auxilioTransporte: 249095,
    interesCesantias: 0.12,
  },
  pe: {
    nombre: 'Perú',
    moneda: 'PEN',
    simbolo: 'S/',
    locale: 'es-PE',
    anio: 2026,
    bonificacionExtraordinaria: 0.09,
  },
  cl: {
    nombre: 'Chile',
    moneda: 'CLP',
    simbolo: '$',
    locale: 'es-CL',
    anio: 2026,
    topeAnios: 11,
    factorFeriado: 1.4,
  },
  bo: {
    nombre: 'Bolivia',
    moneda: 'BOB',
    simbolo: 'Bs',
    locale: 'es-BO',
    anio: 2026,
    desahucioSueldos: 3,
    mesesMinimosIndemnizacion: 3,
  },
  es: {
    nombre: 'España',
    moneda: 'EUR',
    simbolo: '€',
    locale: 'es-ES',
    anio: 2026,
    diasPorAnio: 20,
    topeDias: 360,
    diasPreaviso: 15,
  },
};

/**
 * Tabla de vacaciones del Art. 76 LFT (reforma 2023): años cumplidos → días.
 * Espejo de src/lib/formulas/prima-vacacional-mexico.ts.
 */
export const MX_VACACIONES: Array<[number, number]> = [
  [1, 12],
  [2, 14],
  [3, 16],
  [4, 18],
  [5, 20],
  [10, 22],
  [15, 24],
  [20, 26],
  [25, 28],
  [30, 30],
];
