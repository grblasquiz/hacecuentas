import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto me cuesta realmente tener a alguien en nómina?"
 *
 * Absorbe 8 calculadoras del lado patrón que respondían pedazos de la misma
 * cuenta: el costo total, las cuotas del IMSS, el ISN estatal, el SDI y el
 * factor de integración, el caso de la persona trabajadora del hogar y el
 * recálculo anual de la prima de riesgo de trabajo.
 *
 * Todas las constantes salen de la fuente única src/lib/data/mexico-2026.ts,
 * igual que las fórmulas originales (LSS, Ley INFONAVIT, LFT y leyes de
 * hacienda estatales 2026).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/** UMA 2026 (INEGI, DOF 09-ene-2026). */
export const UMA_MX = { diaria: MEXICO_2026.uma.diaria, mensual: MEXICO_2026.uma.mensual };

/** Factor de mensualización que usan CONASAMI e IMSS: 30,4 días. */
export const FACTOR_MENSUAL_MX = MEXICO_2026.salarioMinimo.factorMensual;

/** Salario mínimo general y de la Zona Libre de la Frontera Norte (CONASAMI, DOF 09-dic-2025). */
export const SALARIO_MINIMO_MX = {
  generalDiario: MEXICO_2026.salarioMinimo.generalDiario,
  zlfnDiario: MEXICO_2026.salarioMinimo.zlfnDiario,
};

/**
 * Salario mínimo PROFESIONAL 2026 de persona trabajadora del hogar
 * (CONASAMI, DOF 09-dic-2025). Es el piso del SBC en esa rama: superior al general.
 * Espejo de la constante de src/lib/formulas/imss-trabajadoras-hogar-mexico.ts.
 */
export const SM_HOGAR_MX = { generalDiario: 342.47, zlfnDiario: 440.87 };

/** Cuotas patronales del IMSS (LSS Arts. 25, 106, 107, 147, 168, 211). */
export const IMSS_PATRON_MX = {
  eymCuotaFijaUma: MEXICO_2026.imss.patron.eymCuotaFijaUma,
  eymExcedente: MEXICO_2026.imss.patron.eymExcedente,
  eymPrestacionesDinero: MEXICO_2026.imss.patron.eymPrestacionesDinero,
  gastosMedicosPensionados: MEXICO_2026.imss.patron.gastosMedicosPensionados,
  invalidezVida: MEXICO_2026.imss.patron.invalidezVida,
  guarderias: MEXICO_2026.imss.patron.guarderias,
  retiro: MEXICO_2026.imss.patron.retiro,
  riesgoTrabajoClaseI: MEXICO_2026.imss.patron.riesgoTrabajoClaseI,
  infonavit: MEXICO_2026.imss.infonavitPatron,
  topeSbcUmas: MEXICO_2026.imss.topeSbcUmas,
};

/** Cuota obrera total sin el excedente de 3 UMA (LSS Arts. 107, 25, 147, 168). */
export const IMSS_OBRERO_MX = {
  totalSinExcedente: MEXICO_2026.imss.obrero.totalSinExcedente,
  eymExcedente: MEXICO_2026.imss.obrero.eymExcedente,
};

/**
 * Tabla progresiva de CEAV patronal 2026 (reforma de pensiones 2020).
 * `Infinity` se serializa como `null` al cruzar a `define:vars`.
 */
export const CEAV_MX = MEXICO_2026.imss.patron.ceavTabla2026.map((t) => ({
  hastaUmas: Number.isFinite(t.hastaUmas) ? t.hastaUmas : null,
  tasa: t.tasa,
}));

/** ISN por estado 2026 (leyes de hacienda estatales). */
export const ISN_MX = MEXICO_2026.isnPorEstado;

/** Prestaciones mínimas de la LFT que integran el SBC. */
export const LFT_MX = {
  aguinaldoDiasMinimo: MEXICO_2026.lft.aguinaldoDiasMinimo,
  primaVacacional: MEXICO_2026.lft.primaVacacional,
  vacacionesPorAnio: MEXICO_2026.lft.vacacionesPorAnio,
  vacacionesIncrementoQuinquenal: MEXICO_2026.lft.vacacionesIncrementoQuinquenal,
};

/** Parámetros de la fórmula de siniestralidad (LSS Art. 72). */
export const PRIMA_RT_MX = MEXICO_2026.primaRiesgoTrabajo;

const ESTADOS = Object.keys(MEXICO_2026.isnPorEstado);

export const hub: HubData = {
  slug: 'mx/trabajo/costo-de-un-empleado',
  title: 'Factor de integración 2026: SDI y costo patronal en México',
  description:
    'Calcula el factor de integración 2026, salario diario integrado (SDI) y costo patronal con IMSS, INFONAVIT, ISN y prestaciones en México.',
  silo: 'Trabajo',
  siloHref: '/mx/trabajo',

  eyebrow: 'México · SDI y costo patronal 2026',
  h1: 'Factor de integración 2026 y costo patronal en México',
  lede:
    'El sueldo bruto es apenas una parte. Encima van las cuotas patronales del IMSS, el 5% del INFONAVIT, el impuesto sobre nóminas de tu estado y la provisión de aguinaldo y prima vacacional. Elige tu caso y pon el sueldo: te desglosamos peso por peso.',
  stamps: [
    'Cuotas IMSS · LSS Arts. 106, 147, 168, 211',
    'Tabla CEAV patronal 2026',
    `ISN estatal · ${ESTADOS.length} estados`,
    '8 calculadoras fusionadas',
  ],

  resultLabel: 'Costo mensual para el patrón',

  cases: {
    title: '¿Qué caso necesitas calcular?',
    intro: 'Empezamos por el caso más común: un trabajador dado de alta en el IMSS con prestaciones de ley.',
    items: [
      {
        id: 'nomina',
        label: 'Trabajador en nómina (prestaciones de ley)',
        hint: 'Empleado dado de alta en el IMSS, con aguinaldo, vacaciones y prima vacacional de ley.',
        yes: [
          'Cuotas patronales del IMSS: cuota fija de enfermedades y maternidad, excedente sobre 3 UMA, prestaciones en dinero, gastos médicos de pensionados, invalidez y vida, guarderías, CEAV y riesgo de trabajo',
          'Aportación de retiro (SAR) del 2% y aportación al INFONAVIT del 5% del salario base de cotización',
          'Impuesto sobre nóminas del estado donde pagas la nómina',
          'Provisión mensual de aguinaldo y prima vacacional, prorrateadas',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El salario base de cotización está topado en 25 UMA diarias (LSS Art. 28): arriba de ese tope las cuotas dejan de crecer',
          'Si das prestaciones superiores a la ley (más días de aguinaldo, vales, fondo de ahorro), sube el factor de integración y con él todas las cuotas',
        ],
        plazo: 'las cuotas del IMSS se pagan a más tardar el día 17 del mes siguiente; INFONAVIT y retiro, de forma bimestral.',
        answer:
          'Sobre el sueldo bruto hay que sumar entre un 25% y un 40% de carga patronal, según el estado y el nivel de salario.',
      },
      {
        id: 'hogar',
        label: 'Persona trabajadora del hogar',
        hint: 'Afiliación obligatoria al IMSS (programa PTHH) y aportación al INFONAVIT desde 2026.',
        yes: [
          'Cuota mensual del IMSS del programa de personas trabajadoras del hogar, con el salario mínimo profesional del oficio como piso del salario base de cotización',
          'Aportación patronal del 5% al INFONAVIT, obligatoria desde 2026 y simultánea al alta',
          'Los mismos ramos de aseguramiento que cualquier trabajador: enfermedades y maternidad, riesgo de trabajo, invalidez y vida, guarderías y CEAV',
          'La opción de absorber la cuota obrera en vez de retenérsela a la persona trabajadora',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El piso del salario base de cotización es el salario mínimo PROFESIONAL del hogar, superior al general: en zona general son $342,47 por día trabajado',
          'La afiliación es obligatoria desde la reforma publicada en el DOF en noviembre de 2022; no darla de alta te expone a capitales constitutivos',
          'Si trabaja para varios patrones, cada uno cotiza por los días que le corresponden',
        ],
        plazo: 'el IMSS emite una sola línea de captura mensual que paga el patrón.',
        answer:
          'La cuota mensual sale del salario mínimo profesional del oficio o del sueldo pactado, el que sea mayor, más el 5% del INFONAVIT.',
      },
      {
        id: 'prima-rt',
        label: 'Recalcular mi prima de riesgo de trabajo',
        hint: 'Declaración anual de siniestralidad de febrero: qué prima te queda para el año siguiente.',
        yes: [
          'Fórmula de siniestralidad del Art. 72 de la LSS con tus días subsidiados, incapacidades permanentes y defunciones',
          'Acotamiento de la variación a un punto porcentual por año respecto de tu prima vigente (Art. 74)',
          'Piso de 0,5% y techo de 15% de la prima',
          'Traducción de la prima a pesos sobre tu nómina de cotización',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Solo entran los casos terminados en el período del 1 de enero al 31 de diciembre; los que siguen abiertos van en la declaración siguiente',
          'Si no presentas la declaración, el IMSS te determina la prima de oficio y puede sancionarte',
        ],
        plazo: 'la declaración anual de siniestralidad se presenta en febrero y la prima nueva rige de marzo a febrero.',
        answer:
          'La prima sube o baja según tu siniestralidad, pero nunca más de un punto porcentual por año.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu nómina',
  inputsIntro:
    'En pesos mexicanos. En el caso de la prima de riesgo, el campo de sueldo se usa como salario promedio de la nómina y los campos de siniestralidad son los que mandan.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo bruto mensual (MXN)',
      prefix: '$',
      value: 15000,
      thousands: true,
      help: 'Lo que le pagas al trabajador antes de sus propios descuentos.',
    },
    {
      id: 'estado',
      label: 'Estado donde pagas la nómina',
      type: 'select',
      value: 'CDMX',
      options: ESTADOS.map((e) => ({ value: e, label: `${e} — ISN ${(MEXICO_2026.isnPorEstado[e] * 100).toFixed(2).replace('.', ',')}%` })),
      help: 'El impuesto sobre nóminas es estatal y va de 2% a 4,25%.',
    },
    {
      id: 'antiguedad',
      label: 'Años de antigüedad',
      type: 'number',
      value: 1,
      min: 1,
      max: 45,
      step: 1,
      help: 'Determina los días de vacaciones y con ellos el factor de integración del salario.',
    },
    {
      id: 'aguinaldoDias',
      label: 'Días de aguinaldo que pagas',
      type: 'number',
      value: 15,
      min: 15,
      max: 90,
      step: 1,
      help: 'El mínimo legal son 15 días (LFT Art. 87). Más días suben el salario base de cotización.',
    },
    {
      id: 'esquemaHogar',
      label: 'Trabajo del hogar: jornada',
      type: 'select',
      value: 'mes',
      options: [
        { value: 'mes', label: 'De planta, mes completo' },
        { value: '1', label: '1 día por semana' },
        { value: '2', label: '2 días por semana' },
        { value: '3', label: '3 días por semana' },
        { value: '4', label: '4 días por semana' },
        { value: '5', label: '5 días por semana' },
        { value: '6', label: '6 días por semana' },
      ],
      help: 'Solo para el caso de trabajo del hogar: define los días cotizados al mes.',
    },
    {
      id: 'zonaHogar',
      label: 'Trabajo del hogar: zona salarial',
      type: 'select',
      value: 'general',
      options: [
        { value: 'general', label: 'Zona general' },
        { value: 'frontera', label: 'Zona Libre de la Frontera Norte' },
      ],
      help: 'La ZLFN es una franja de municipios de la frontera norte, no un estado completo.',
    },
    {
      id: 'primaRiesgo',
      label: 'Prima de riesgo de trabajo vigente (%)',
      suffix: '%',
      type: 'number',
      value: 0.54355,
      min: 0.5,
      max: 15,
      step: 0.01,
      help: 'La que traes en tu declaración. Si no la conoces, deja la prima media de clase I.',
    },
    {
      id: 'trabajadores',
      label: 'Trabajadores promedio expuestos al riesgo',
      type: 'number',
      value: 20,
      min: 1,
      step: 1,
      help: 'Solo para el caso de la prima de riesgo: es la N de la fórmula del Art. 72.',
    },
    {
      id: 'diasSubsidiados',
      label: 'Días subsidiados por incapacidad en el año',
      type: 'number',
      value: 0,
      min: 0,
      step: 1,
      help: 'La S de la fórmula: días de incapacidad temporal de casos terminados.',
    },
    {
      id: 'incapacidades',
      label: 'Suma de porcentajes de incapacidad permanente (%)',
      suffix: '%',
      type: 'number',
      value: 0,
      min: 0,
      step: 1,
      help: 'La I de la fórmula. Una incapacidad del 25% se carga como 25.',
    },
    {
      id: 'defunciones',
      label: 'Defunciones por riesgo de trabajo',
      type: 'number',
      value: 0,
      min: 0,
      step: 1,
      help: 'La D de la fórmula. Cada defunción pesa como una incapacidad del 100%.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el costo',
    caption:
      'Compara el sueldo bruto contra la carga que se le suma: IMSS patronal, INFONAVIT, impuesto sobre nóminas y provisiones de prestaciones.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo mensual.',

  faq: [
    {
      q: '¿Cuánto se le suma al sueldo por cargas patronales en México?',
      a: 'Para un trabajador con prestaciones de ley, la carga suele ubicarse entre el 25% y el 40% del sueldo bruto. La proporción baja en salarios altos, porque el salario base de cotización se topa en 25 UMA y la cuota fija de enfermedades y maternidad es un monto fijo por trabajador, no un porcentaje. Sube en estados con impuesto sobre nóminas del 4% y cuando pagas prestaciones superiores a la ley.',
    },
    {
      q: '¿Qué es el salario base de cotización y por qué no es igual al sueldo?',
      a: 'El salario base de cotización, o SBC, es el salario diario multiplicado por el factor de integración, que suma al año los días de aguinaldo y la prima vacacional. Con el mínimo de ley (15 días de aguinaldo y 12 de vacaciones con 25% de prima) el factor arranca en 1,0493. Sobre el SBC, no sobre el sueldo nominal, se calculan casi todas las cuotas del IMSS y del INFONAVIT.',
    },
    {
      q: '¿Cómo se calcula el factor de integración?',
      a: 'Se suman 365 días, los días de aguinaldo y los días de vacaciones multiplicados por el porcentaje de prima vacacional, y el total se divide entre 365. Como los días de vacaciones crecen con la antigüedad por la reforma de vacaciones dignas, el factor de un trabajador con diez años es mayor que el de uno de primer año, aunque el sueldo sea el mismo.',
    },
    {
      q: '¿Qué es la CEAV y por qué sube todos los años?',
      a: 'Es la cuota de cesantía en edad avanzada y vejez. La reforma de pensiones de 2020 dejó fija la parte del trabajador en 1,125% y puso la parte patronal en una tabla progresiva por nivel de salario que sube cada año hasta 2030. En 2026 va de 3,15% para quien gana un salario mínimo hasta 7,513% para salarios de más de 4 UMA.',
    },
    {
      q: '¿El impuesto sobre nóminas es igual en todo el país?',
      a: 'No: lo cobra cada estado con su propia ley de hacienda y en 2026 va del 2% al 4,25%. Se causa donde se presta el servicio, no donde está el domicilio fiscal de la empresa, así que si tienes personal en varios estados pagas varias tasas. Varios estados lo subieron para 2026, entre ellos Chihuahua, Chiapas, Colima, Baja California Sur, Morelos y Yucatán.',
    },
    {
      q: '¿Qué es el tope de 25 UMA?',
      a: 'El salario base de cotización no puede exceder de 25 veces la UMA diaria (LSS Art. 28). Lo que ganes por encima de ese tope no cotiza, así que las cuotas del IMSS y del INFONAVIT dejan de crecer. En cambio, ni el impuesto sobre nóminas ni las provisiones de aguinaldo y prima vacacional tienen tope: siguen calculándose sobre el sueldo completo.',
    },
    {
      q: '¿Tengo que dar de alta en el IMSS a la persona que trabaja en mi casa?',
      a: 'Sí. Tras la sentencia de la Suprema Corte y la reforma publicada en el DOF en noviembre de 2022, la afiliación de personas trabajadoras del hogar es obligatoria y se hace por el programa específico del IMSS. Desde 2026 el alta genera también la aportación patronal del 5% al INFONAVIT de forma simultánea, y el instituto emite una sola línea de captura mensual.',
    },
    {
      q: '¿Qué salario mínimo aplica a una persona trabajadora del hogar?',
      a: 'No el general, sino el salario mínimo profesional del oficio, que en 2026 es de $342,47 por día en zona general y $440,87 en la Zona Libre de la Frontera Norte. Ese es el piso del salario base de cotización aunque pagues por día suelto: si trabaja dos días a la semana, se cotiza por esos días al mínimo profesional o al sueldo pactado, el que sea mayor.',
    },
    {
      q: '¿Cómo funciona la declaración anual de siniestralidad?',
      a: 'Se presenta en febrero con los riesgos de trabajo terminados durante el año anterior. La fórmula del Art. 72 de la LSS toma los días subsidiados, los porcentajes de incapacidad permanente y las defunciones, los pondera por los factores de ley y les suma la prima mínima de 0,5%. La prima resultante rige de marzo a febrero del año siguiente.',
    },
    {
      q: '¿Mi prima de riesgo puede subir mucho de un año a otro?',
      a: 'No. El Art. 74 de la LSS limita la variación a un punto porcentual por año, hacia arriba o hacia abajo, y encierra la prima entre 0,5% y 15%. Por eso una empresa con un accidente grave no salta de golpe a la prima máxima: la corrección se reparte en varios años, y lo mismo pasa cuando mejora su siniestralidad.',
    },
    {
      q: '¿Las provisiones de aguinaldo y prima vacacional son un costo real?',
      a: 'Sí, aunque se paguen una vez al año. La práctica contable es reservar cada mes la doceava parte para que diciembre no golpee el flujo. En esta calculadora la provisión se suma al costo mensual y también entra en la base del impuesto sobre nóminas, porque la mayoría de las leyes estatales gravan todas las remuneraciones por el trabajo personal subordinado.',
    },
    {
      q: '¿Qué diferencia hay entre lo que me cuesta a mí y lo que le descuentan a él?',
      a: 'Son dos cuentas distintas. La cuota obrera del trabajador ronda apenas 2,375% de su SBC más el excedente sobre 3 UMA, y su descuento grande es el ISR. La cuota patronal es varias veces mayor porque incluye la cuota fija de enfermedades y maternidad, guarderías, invalidez y vida, riesgo de trabajo, retiro e INFONAVIT, que el trabajador no paga.',
    },
  ],

  sources: [
    {
      name: 'Ley del Seguro Social — cuotas obrero-patronales (Arts. 25, 28, 72, 74, 106, 107, 147, 168, 211)',
      url: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
      publisher: 'IMSS',
    },
    {
      name: 'Ley del INFONAVIT — aportación patronal del 5% (Art. 29)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/linfonavit.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley Federal del Trabajo — aguinaldo, vacaciones y prima vacacional (Arts. 76, 80, 87)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lft.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'CONASAMI — salarios mínimos generales y profesionales 2026 (DOF 09-dic-2025)',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI',
      date: '09-12-2025',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'IMSS — programa de personas trabajadoras del hogar',
      url: 'https://www.imss.gob.mx/personas-trabajadoras-hogar',
      publisher: 'IMSS',
    },
  ],

  replaces: [
    '/calculadora-costo-empleado-patron-mexico-2026',
    '/calculadora-costo-empleada-domestica-patron-mexico-2026',
    '/calculadora-imss-cuotas-empleado-patron-mexico-2026',
    '/calculadora-imss-trabajadoras-hogar-mexico',
    '/calculadora-isn-impuesto-sobre-nominas-estado',
    '/calculadora-prima-riesgo-trabajo-imss-siniestralidad',
    '/calculadora-factor-integracion-salarial-imss-mexico',
    '/calculadora-salario-diario-integrado-sdi-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
