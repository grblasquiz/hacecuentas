import type { HubData } from './types';
import { MEXICO_2026 } from '../data/mexico-2026';

/**
 * Hub de decisión — "¿Cuánto me queda en mano del sueldo bruto?" (México)
 *
 * Fusiona dos calculadoras que respondían la misma pregunta con distinto recorte:
 *  - /calculadora-sueldo-neto-mexico-isr-imss (nómina completa)
 *  - /calculadora-isr-mensual-mexico-2026 (solo ISR y subsidio al empleo)
 *
 * Los números salen de la fuente única src/lib/data/mexico-2026.ts, igual que
 * src/lib/formulas/sueldo-neto-mexico.ts (SAT Anexo 8 RMF 2026, INEGI, DOF).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/**
 * Tarifa ISR mensual (Art. 96 LISR, Anexo 8 RMF 2026).
 * `Infinity` se serializa como `null` al cruzar a `define:vars`: por eso el
 * último renglón viaja con `hasta: null` y el compute lo trata como sin techo.
 */
export const ISR_MENSUAL_MX: Array<{ desde: number; hasta: number | null; cuota: number; tasa: number }> =
  MEXICO_2026.isrTarifaMensual.map(([limInf, limSup, cuota, tasa]) => ({
    desde: limInf,
    hasta: Number.isFinite(limSup) ? limSup : null,
    cuota,
    tasa,
  }));

/** Cuota obrera IMSS simplificada usada por la fórmula original: 2,775% del SBC. */
export const IMSS_OBRERO_PCT = 2.775;

/** Tope del SBC: 25 UMA mensuales (LSS Art. 28). */
export const TOPE_SBC_MX = MEXICO_2026.uma.mensual * MEXICO_2026.imss.topeSbcUmas;

/** Subsidio para el empleo 2026 — Decreto DOF 31-dic-2025. */
export const SUBSIDIO_MX = MEXICO_2026.subsidioEmpleo.montoMensual;
export const SUBSIDIO_TOPE_MX = MEXICO_2026.subsidioEmpleo.topeIngresoMensual;

/** UMA mensual vigente (INEGI, DOF 09-ene-2026). */
export const UMA_MENSUAL_MX = MEXICO_2026.uma.mensual;

export const hub: HubData = {
  slug: 'trabajo/sueldo-neto-mexico',
  title: 'Sueldo neto en México: cuánto te queda del bruto con ISR e IMSS',
  description:
    'Calculá tu sueldo neto en México con la tarifa ISR mensual del Art. 96 LISR, la cuota obrera del IMSS, el subsidio para el empleo y el descuento de Infonavit. Incluye el cálculo de solo ISR y el camino inverso de neto a bruto.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'México · nómina y descuentos',
  h1: '¿Cuánto me queda en mano del sueldo bruto? (México)',
  lede:
    'De tu bruto salen el ISR y la cuota obrera del IMSS, y si tenés crédito, el Infonavit. En sueldos bajos el subsidio para el empleo puede tapar el ISR entero. Poné tu sueldo y elegí el caso que te toca.',
  stamps: [
    'Tarifa ISR mensual · Art. 96 LISR',
    `Cuota obrera IMSS ${String(IMSS_OBRERO_PCT).replace('.', ',')}%`,
    `Subsidio al empleo $${SUBSIDIO_MX.toLocaleString('es-MX')}`,
    '2 calculadoras fusionadas',
  ],

  resultLabel: 'Sueldo neto estimado',

  cases: {
    title: '¿Qué necesitás calcular?',
    intro: 'Arrancamos por la nómina completa, que es el caso de un trabajador dado de alta en el IMSS.',
    items: [
      {
        id: 'nomina',
        label: 'Nómina completa (ISR + IMSS)',
        hint: 'Trabajador asalariado dado de alta, con o sin crédito Infonavit.',
        yes: [
          'ISR retenido según la tarifa mensual del Art. 96 de la LISR',
          'Cuota obrera del IMSS sobre el salario base de cotización, topeada a 25 UMA',
          'Subsidio para el empleo si tu ingreso no supera el tope del decreto',
          'Descuento de Infonavit si cargás un crédito, y vales de despensa sumados al neto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La cuota obrera se calcula acá de forma simplificada sobre el sueldo; tu SBC real puede incluir prestaciones e integrarse distinto',
          'Aguinaldo, prima vacacional y PTU se gravan aparte y no entran en el cálculo mensual',
        ],
        plazo: 'la retención de ISR se entera al SAT a más tardar el día 17 del mes siguiente.',
        answer:
          'De tu bruto se descuentan el ISR y la cuota obrera del IMSS; si tenés crédito, también el Infonavit.',
      },
      {
        id: 'solo-isr',
        label: 'Solo quiero ver el ISR y el subsidio',
        hint: 'Sin IMSS ni Infonavit: cuánto impuesto te toca y cuánto lo baja el subsidio.',
        yes: [
          'ISR bruto de la tarifa del Art. 96 aplicada a tu ingreso del mes',
          'Subsidio para el empleo acreditado contra ese ISR',
          'ISR efectivamente retenido y tasa efectiva sobre el bruto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Esta vista ignora la cuota del IMSS a propósito: sirve para entender el impuesto, no para estimar tu depósito',
          'Si el subsidio supera al ISR, la diferencia se te entrega y suma al neto',
        ],
        plazo: 'la tarifa y el subsidio se actualizan por decreto al cierre de cada año, con vigencia desde enero.',
        answer:
          'El ISR sale de una tarifa por tramos: solo el excedente de tu tramo paga la tasa más alta, y el subsidio se resta después.',
      },
      {
        id: 'neto-a-bruto',
        label: 'Sé el neto que quiero y busco el bruto',
        hint: 'Para negociar sueldo o comparar una oferta que te dieron "libre de impuestos".',
        yes: [
          'La calculadora busca el bruto que, después de ISR e IMSS, deja el neto que pediste',
          'Usa exactamente los mismos descuentos que la nómina completa',
          'Sirve para traducir una oferta en neto a una cifra de contrato',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Poné el neto objetivo en el campo de sueldo: es el valor que la calculadora persigue',
          'Un sueldo pactado en neto traslada al patrón el riesgo de los cambios de tarifa: conviene dejarlo por escrito',
        ],
        plazo: 'el alta y la modificación de salario ante el IMSS se presentan dentro de los 5 días hábiles.',
        answer:
          'El bruto necesario crece más rápido que el neto: cada peso extra de sueldo cae en el tramo marginal más alto.',
      },
    ],
  },

  inputsTitle: 'Tus datos de nómina',
  inputsIntro: 'En pesos mexicanos. En el caso "neto a bruto", el primer campo es el neto que querés cobrar.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo del período (MXN)',
      prefix: '$',
      value: '20.000',
      thousands: true,
      help: 'Bruto en los dos primeros casos; neto objetivo en el tercero.',
    },
    {
      id: 'periodo',
      label: 'Período de pago',
      type: 'select',
      value: 'mensual',
      options: [
        { value: 'mensual', label: 'Mensual' },
        { value: 'quincenal', label: 'Quincenal' },
        { value: 'semanal', label: 'Semanal' },
      ],
      help: 'El cálculo se hace siempre en base mensual y después se lleva a tu período.',
    },
    {
      id: 'infonavit',
      label: 'Descuento Infonavit (% del sueldo)',
      suffix: '%',
      type: 'number',
      value: 0,
      min: 0,
      max: 50,
      step: 0.5,
      help: 'Dejalo en 0 si no tenés crédito. Si tenés, poné el porcentaje que figura en tu recibo.',
    },
    {
      id: 'vales',
      label: 'Vales de despensa del período (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Se suman al neto: en la parte exenta no pagan ISR ni IMSS.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va tu sueldo',
    caption: 'Compara lo que te queda contra el ISR retenido, la cuota obrera del IMSS y el descuento de Infonavit.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del período.',

  faq: [
    {
      q: '¿Cuánto me descuentan del sueldo bruto en México?',
      a: 'Depende casi todo del ISR, porque la cuota obrera del IMSS ronda apenas un 2,775% del salario base de cotización. En sueldos bajos el subsidio para el empleo puede dejar el ISR en cero y el descuento total queda por debajo del 3%. En sueldos medios el descuento total suele ubicarse entre el 10% y el 20%, y sube desde ahí a medida que entrás en los tramos altos de la tarifa.',
    },
    {
      q: '¿Cómo se calcula el ISR de mi nómina?',
      a: 'Con la tarifa mensual del Art. 96 de la LISR, que publica el SAT en el Anexo 8 de la Resolución Miscelánea Fiscal. Ubicás tu ingreso entre el límite inferior y el superior de un renglón, tomás la cuota fija de ese renglón y le sumás el porcentaje que corresponde sobre el excedente del límite inferior. Por eso la tasa que ves en la tabla no se aplica a todo tu sueldo, solo al excedente.',
    },
    {
      q: '¿Qué es el subsidio para el empleo y a quién le toca?',
      a: 'Es un monto fijo mensual que fija el decreto del DOF y que se acredita contra el ISR de quienes no superan un tope de ingreso mensual. Si tu subsidio es mayor que tu ISR, no te retienen impuesto y la diferencia se te entrega en efectivo, sumando a tu neto. Si superás el tope de ingreso, el subsidio es cero y retenés el ISR completo.',
    },
    {
      q: '¿Cuánto es la cuota obrera del IMSS?',
      a: 'Alrededor de 2,775% del salario base de cotización en el cálculo simplificado que usa esta página: junta prestaciones en dinero, gastos médicos de pensionados, invalidez y vida, y cesantía en edad avanzada y vejez, más el excedente de enfermedad y maternidad. El grueso del costo del IMSS lo paga el patrón, no vos.',
    },
    {
      q: '¿Qué es el tope de 25 UMA?',
      a: 'El salario base de cotización no puede superar 25 veces la UMA (LSS Art. 28). Lo que ganás por encima de ese tope no cotiza, así que tu cuota obrera del IMSS deja de crecer aunque el sueldo siga subiendo. El ISR, en cambio, no tiene tope: se sigue calculando sobre todo el ingreso.',
    },
    {
      q: '¿Los vales de despensa pagan impuesto?',
      a: 'La porción de vales dentro de los límites de exención no paga ISR ni integra el salario base de cotización, por eso esta calculadora los suma directo al neto. Si tu patrón entrega vales por encima del límite exento, el excedente sí se grava y hay que sumarlo al sueldo bruto en el cálculo.',
    },
    {
      q: '¿Por qué me descuentan Infonavit y cuánto es?',
      a: 'El descuento aparece solo si tenés un crédito de vivienda vigente: el patrón lo retiene de tu nómina y lo entera al Infonavit. El porcentaje o el monto fijo lo determina el aviso de retención del propio instituto, no una tasa general. Por eso el campo de la calculadora arranca en cero y lo cargás con lo que dice tu recibo.',
    },
    {
      q: '¿Cuál es la diferencia entre tasa marginal y tasa efectiva?',
      a: 'La marginal es el porcentaje del renglón donde caés y se aplica solo al excedente del límite inferior: es lo que paga tu último peso. La efectiva es el ISR total dividido por tu sueldo bruto, y siempre da bastante menos. Que la tarifa diga 21,36% no significa que pierdas ese porcentaje del sueldo entero.',
    },
    {
      q: '¿Cómo paso de un sueldo quincenal a uno mensual?',
      a: 'La tarifa de ISR está publicada por período: la mensual es la de referencia y la quincenal es esa misma tarifa proporcionada. Por eso esta calculadora lleva tu sueldo a base mensual, aplica la tarifa y después devuelve el resultado en tu período. Multiplicar por dos la quincena da prácticamente lo mismo que la tarifa quincenal oficial, salvo centavos de redondeo.',
    },
    {
      q: '¿El aguinaldo y la PTU se calculan igual?',
      a: 'No. Son ingresos con un tratamiento propio: tienen una parte exenta medida en UMA y el resto se grava, muchas veces con el procedimiento del Art. 174 del Reglamento de la LISR, que reparte el ingreso extraordinario en el año. Esta página estima el sueldo mensual ordinario.',
    },
    {
      q: '¿Por qué mi recibo real da distinto a esta estimación?',
      a: 'Las diferencias más comunes vienen del salario base de cotización, que integra prestaciones y no es igual al sueldo nominal, de las prestaciones exentas de tu empresa, de descuentos por préstamos o caja de ahorro, y del ajuste anual de ISR que muchas nóminas aplican en diciembre. La calculadora estima el caso base de un sueldo fijo.',
    },
    {
      q: 'Si soy RESICO o facturo por honorarios, ¿me sirve?',
      a: 'No para el cálculo. RESICO de personas físicas paga una tasa sobre el ingreso cobrado, no la tarifa del Art. 96, y quien factura por honorarios sufre retenciones distintas y paga provisionales. Esta página aplica a trabajadores asalariados con relación laboral y nómina.',
    },
  ],

  sources: [
    {
      name: 'SAT — Anexo 8 de la RMF 2026, tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.sat.gob.mx/normatividad/22186/resolucion-miscelanea-fiscal-(rmf)',
      publisher: 'Servicio de Administración Tributaria',
      date: '28-12-2025',
    },
    {
      name: 'Ley del Impuesto sobre la Renta — Art. 96, retención de salarios',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Decreto del subsidio para el empleo (DOF 31-dic-2025)',
      url: 'https://www.dof.gob.mx/',
      publisher: 'Diario Oficial de la Federación',
      date: '31-12-2025',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'Ley del Seguro Social — cuotas obrero-patronales y tope del SBC',
      url: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
      publisher: 'IMSS',
    },
  ],

  replaces: [
    '/calculadora-sueldo-neto-mexico-isr-imss',
    '/calculadora-isr-mensual-mexico-2026',
  ],

  lastReviewed: '2026-07-27',
};
