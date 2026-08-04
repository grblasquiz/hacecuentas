import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto me queda del sueldo en mano?"
 *
 * Absorbe el hub viejo /trabajo/sueldo-neto-mexico y diez calculadoras sueltas
 * de nómina (sueldo neto, neto→bruto, ISR mensual, ISR quincenal, salario por
 * hora, salario mínimo, recibo de nómina, UMA, aumento vs inflación).
 *
 * TODA constante fiscal sale de src/lib/data/mexico-2026.ts (SAT Anexo 8 RMF
 * 2026, INEGI, DOF, CONASAMI). No hay tablas copiadas acá.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/**
 * Tarifa ISR mensual (Art. 96 LISR, Anexo 8 RMF 2026).
 * `Infinity` se serializa como `null` al cruzar a `define:vars`: el último
 * renglón viaja con `hasta: null` y el compute lo trata como sin techo.
 */
export const ISR_MENSUAL: Array<{ desde: number; hasta: number | null; cuota: number; tasa: number }> =
  MEXICO_2026.isrTarifaMensual.map(([limInf, limSup, cuota, tasa]) => ({
    desde: limInf,
    hasta: Number.isFinite(limSup) ? limSup : null,
    cuota,
    tasa,
  }));

/** Cuota obrera IMSS por componentes (LSS Arts. 25, 106, 107, 147, 168). */
export const IMSS_OBRERO = {
  base: MEXICO_2026.imss.obrero.totalSinExcedente,      // 2,375% del SBC
  excedente: MEXICO_2026.imss.obrero.eymExcedente,      // 0,40% del excedente de 3 UMA
  topeUmas: MEXICO_2026.imss.topeSbcUmas,               // 25 UMA
  umbralExcedenteUmas: 3,
};

/** Subsidio para el empleo 2026 — Decreto DOF 31-dic-2025. */
export const SUBSIDIO = {
  monto: MEXICO_2026.subsidioEmpleo.montoMensual,
  tope: MEXICO_2026.subsidioEmpleo.topeIngresoMensual,
};

/** UMA 2026 (INEGI, DOF 09-ene-2026). */
export const UMA = { diaria: MEXICO_2026.uma.diaria, mensual: MEXICO_2026.uma.mensual, anual: MEXICO_2026.uma.anual };

/** Salario mínimo 2026 (CONASAMI, DOF 09-dic-2025). */
export const SALARIO_MINIMO = {
  generalDiario: MEXICO_2026.salarioMinimo.generalDiario,
  zlfnDiario: MEXICO_2026.salarioMinimo.zlfnDiario,
  factorMensual: MEXICO_2026.salarioMinimo.factorMensual,
};

export const hub: HubData = {
  slug: 'mx/trabajo/sueldo-neto',
  title: 'Sueldo neto en México: cuánto te queda en mano del bruto',
  description:
    'Calcula tu sueldo neto en México con la tarifa de ISR del Art. 96 de la LISR, la cuota obrera del IMSS, el subsidio para el empleo y el Infonavit. Incluye el camino inverso de neto a bruto, el sueldo por hora y la comparación contra el salario mínimo.',
  silo: 'Trabajo',
  siloHref: '/mx/trabajo',

  eyebrow: 'México · nómina y descuentos',
  h1: '¿Cuánto me queda del sueldo en mano?',
  lede:
    'De tu bruto salen el ISR y la cuota obrera del IMSS, y si traes crédito, el Infonavit. En sueldos bajos el subsidio para el empleo puede borrar el ISR completo. Pon tu sueldo, elige tu caso y mira el recibo por dentro.',
  stamps: [
    'Tarifa de ISR mensual · Art. 96 LISR',
    'Cuota obrera IMSS por componentes · LSS',
    'Subsidio para el empleo vigente · DOF',
    '11 calculadoras fusionadas',
  ],

  resultLabel: 'Sueldo neto estimado',

  cases: {
    title: '¿Qué necesitas calcular?',
    intro:
      'Empezamos por la nómina completa, que es el caso de un trabajador dado de alta en el IMSS. Los otros tres casos usan los mismos datos con otro recorte.',
    items: [
      {
        id: 'nomina',
        label: 'Nómina completa (ISR + IMSS)',
        hint: 'Trabajador asalariado dado de alta, con o sin crédito Infonavit.',
        yes: [
          'ISR retenido con la tarifa mensual del Art. 96 de la LISR',
          'Cuota obrera del IMSS sobre el salario base de cotización, topeada a 25 UMA',
          'Subsidio para el empleo si tu ingreso no rebasa el tope del decreto',
          'Descuento de Infonavit si traes crédito, y vales de despensa sumados al neto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Tu salario base de cotización real integra prestaciones y puede ser mayor que el sueldo nominal: la cuota del IMSS se calcula aquí sobre el sueldo',
          'Aguinaldo, prima vacacional y PTU se gravan aparte y no entran en el cálculo mensual',
        ],
        plazo: 'la retención de ISR se entera al SAT a más tardar el día 17 del mes siguiente.',
        answer:
          'De tu bruto se descuentan el ISR y la cuota obrera del IMSS; si traes crédito, también el Infonavit.',
      },
      {
        id: 'solo-isr',
        label: 'Solo el ISR y el subsidio',
        hint: 'Sin IMSS ni Infonavit: cuánto impuesto te toca y cuánto lo baja el subsidio.',
        yes: [
          'ISR bruto de la tarifa del Art. 96 sobre tu ingreso del mes',
          'Subsidio para el empleo acreditado contra ese ISR',
          'ISR efectivamente retenido, tasa marginal y tasa efectiva sobre el bruto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Esta vista ignora la cuota del IMSS a propósito: sirve para entender el impuesto, no para estimar el depósito',
          'Si el subsidio rebasa al ISR, la diferencia se te entrega en efectivo y suma al neto',
        ],
        plazo: 'la tarifa y el subsidio se actualizan por decreto al cierre del año, con vigencia desde enero.',
        answer:
          'El ISR sale de una tarifa por tramos: solo el excedente del límite inferior paga la tasa más alta, y el subsidio se resta después.',
      },
      {
        id: 'neto-a-bruto',
        label: 'Sé el neto que quiero y busco el bruto',
        hint: 'Para negociar sueldo o traducir una oferta que te dieron "libre de impuestos".',
        yes: [
          'Busca por aproximación el bruto que, después de ISR e IMSS, deja el neto que pediste',
          'Usa exactamente los mismos descuentos que la nómina completa',
          'Sirve para llevar una oferta en neto a una cifra de contrato',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Pon el neto objetivo en el campo de sueldo: es el valor que la calculadora persigue',
          'Un sueldo pactado en neto le traslada al patrón el riesgo de los cambios de tarifa: conviene dejarlo por escrito',
        ],
        plazo: 'el alta y la modificación de salario ante el IMSS se presentan dentro de los 5 días hábiles.',
        answer:
          'El bruto necesario crece más rápido que el neto: cada peso extra de sueldo cae en el tramo marginal más alto.',
      },
      {
        id: 'por-hora',
        label: 'Mi sueldo por hora y el piso legal',
        hint: 'Convierte tu sueldo a hora, día, semana y año, y compáralo con el salario mínimo.',
        yes: [
          'Valor de tu hora ordinaria a partir de las horas que trabajas por semana',
          'Equivalencias diaria, semanal, mensual y anual del mismo sueldo',
          'Cuántos salarios mínimos ganas y si tu sueldo cumple el piso de tu zona',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El salario mínimo es un piso diario: un sueldo mensual bajo con pocos días trabajados puede cumplirlo igual',
          'La Zona Libre de la Frontera Norte tiene un mínimo más alto que el general: elige bien tu zona',
        ],
        plazo: 'la CONASAMI fija los mínimos en diciembre, con vigencia desde el 1 de enero.',
        answer:
          'Tu hora ordinaria vale el sueldo mensual dividido entre las horas que realmente trabajas al mes, no entre 30 días de 8 horas.',
      },
    ],
  },

  inputsTitle: 'Tus datos de nómina',
  inputsIntro:
    'En pesos mexicanos. En el caso "neto a bruto" el primer campo es el neto que quieres cobrar; en los demás es tu bruto.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo del período (MXN)',
      prefix: '$',
      value: 20000,
      thousands: true,
      help: 'Bruto en casi todos los casos; neto objetivo en "neto a bruto".',
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
        { value: 'diario', label: 'Diario' },
      ],
      help: 'El cálculo se hace siempre en base mensual y después vuelve a tu período.',
    },
    {
      id: 'infonavit',
      label: 'Descuento de Infonavit (% del sueldo)',
      suffix: '%',
      type: 'number',
      value: 0,
      min: 0,
      max: 50,
      step: 0.5,
      help: 'Déjalo en 0 si no tienes crédito. Si lo tienes, pon el porcentaje que aparece en tu recibo.',
    },
    {
      id: 'vales',
      label: 'Vales de despensa del período (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Se suman al neto: dentro del límite exento no pagan ISR ni integran el SBC.',
    },
    {
      id: 'horas',
      label: 'Horas que trabajas por semana',
      type: 'number',
      value: 48,
      min: 1,
      max: 60,
      step: 1,
      help: 'Solo para el caso del sueldo por hora. La jornada máxima legal de 2026 es de 48 horas.',
    },
    {
      id: 'zona',
      label: 'Zona del salario mínimo',
      type: 'select',
      value: 'general',
      options: [
        { value: 'general', label: 'Zona general' },
        { value: 'frontera', label: 'Zona Libre de la Frontera Norte' },
      ],
      help: 'La Frontera Norte tiene un mínimo diario más alto fijado por la CONASAMI.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va tu sueldo',
    caption:
      'Compara lo que te queda en mano contra el ISR retenido, la cuota obrera del IMSS y el descuento de Infonavit del mismo período.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del período.',

  faq: [
    {
      q: '¿Cuánto me descuentan del sueldo bruto en México?',
      a: 'Casi todo depende del ISR, porque la cuota obrera del IMSS ronda apenas 2,4% a 2,8% del salario base de cotización. En sueldos bajos el subsidio para el empleo deja el ISR en cero y el descuento total baja del 3%. En sueldos medios el descuento suele quedar entre 10% y 20%, y sube desde ahí conforme entras a los tramos altos de la tarifa.',
    },
    {
      q: '¿Cómo se calcula el ISR de mi nómina?',
      a: 'Con la tarifa mensual del Art. 96 de la LISR que el SAT publica en el Anexo 8 de la Resolución Miscelánea Fiscal. Ubicas tu ingreso entre el límite inferior y el superior de un renglón, tomas la cuota fija de ese renglón y le sumas el porcentaje que corresponde sobre el excedente del límite inferior. Por eso la tasa de la tabla no se aplica a todo tu sueldo, solo al excedente.',
    },
    {
      q: '¿Qué es el subsidio para el empleo y a quién le toca?',
      a: 'Es un monto fijo mensual que fija el decreto publicado en el DOF y que se acredita contra el ISR de quien no rebasa un tope de ingreso mensual. Si tu subsidio es mayor que tu ISR no te retienen impuesto y la diferencia se te entrega en efectivo, sumando a tu neto. Si rebasas el tope, el subsidio es cero y retienes el ISR completo.',
    },
    {
      q: '¿De cuánto es la cuota obrera del IMSS?',
      a: 'Se arma por componentes de la Ley del Seguro Social: prestaciones en dinero, gastos médicos de pensionados, invalidez y vida, y cesantía en edad avanzada y vejez suman 2,375% del salario base de cotización, más 0,4% sobre la parte del SBC que rebasa tres UMA. El grueso del costo del IMSS lo paga el patrón, no tú.',
    },
    {
      q: '¿Qué significa el tope de 25 UMA?',
      a: 'El salario base de cotización no puede rebasar 25 veces la UMA (Art. 28 de la LSS). Lo que ganas arriba de ese tope no cotiza, así que tu cuota obrera del IMSS deja de crecer aunque el sueldo siga subiendo. El ISR, en cambio, no tiene tope: se calcula sobre todo el ingreso.',
    },
    {
      q: '¿Los vales de despensa pagan impuesto?',
      a: 'La porción de vales dentro del límite de exención no paga ISR ni integra el salario base de cotización, por eso esta página los suma directo al neto. Si tu patrón entrega vales arriba del límite exento, el excedente sí se grava y hay que sumarlo al sueldo bruto antes de calcular.',
    },
    {
      q: '¿Por qué me descuentan Infonavit y cuánto es?',
      a: 'El descuento aparece solo si tienes un crédito de vivienda vigente: el patrón lo retiene de tu nómina y lo entera al Infonavit. El porcentaje, el monto fijo o los VSM los determina el aviso de retención del propio instituto, no una tasa general. Por eso el campo arranca en cero y lo llenas con lo que dice tu recibo.',
    },
    {
      q: '¿Cuál es la diferencia entre tasa marginal y tasa efectiva?',
      a: 'La marginal es el porcentaje del renglón donde caes y se aplica solo al excedente del límite inferior: es lo que paga tu último peso. La efectiva es el ISR total dividido entre tu sueldo bruto y siempre da bastante menos. Que la tarifa diga 21,36% no significa que pierdas ese porcentaje del sueldo entero.',
    },
    {
      q: '¿Cómo paso de un sueldo quincenal a uno mensual?',
      a: 'La tarifa de ISR se publica por período: la mensual es la de referencia y la quincenal es esa misma tarifa proporcionada a la mitad. Por eso esta página lleva tu sueldo a base mensual, aplica la tarifa y regresa el resultado a tu período. Multiplicar la quincena por dos da prácticamente lo mismo que la tarifa quincenal oficial, salvo centavos de redondeo.',
    },
    {
      q: '¿Cuánto vale mi hora de trabajo?',
      a: 'Divide tu sueldo mensual entre las horas que realmente trabajas al mes, que salen de multiplicar tus horas semanales por 52 y dividir entre 12. Con jornada de 48 horas eso da unas 208 horas al mes. El valor de la hora importa porque es la base para calcular tiempo extra, prima dominical y días festivos trabajados.',
    },
    {
      q: '¿Mi sueldo cumple con el salario mínimo?',
      a: 'El mínimo es un piso diario fijado por la CONASAMI, con un valor general y otro más alto para la Zona Libre de la Frontera Norte. Para compararlo con un sueldo mensual se multiplica el mínimo diario por el factor mensual de 30,4 días. Ningún patrón puede pagar por debajo de ese piso, ni siquiera con el argumento de que compensa con prestaciones.',
    },
    {
      q: '¿Por qué mi recibo real da distinto a esta estimación?',
      a: 'Las diferencias más comunes vienen del salario base de cotización, que integra prestaciones y no es igual al sueldo nominal; de las prestaciones exentas de tu empresa; de descuentos por préstamos, caja de ahorro o pensión alimenticia; y del ajuste anual de ISR que muchas nóminas aplican en diciembre. Aquí se estima el caso base de un sueldo fijo.',
    },
    {
      q: 'Si estoy en RESICO o facturo por honorarios, ¿me sirve?',
      a: 'No para el cálculo. RESICO de personas físicas paga una tasa sobre el ingreso efectivamente cobrado, no la tarifa del Art. 96, y quien factura por honorarios sufre retenciones distintas y presenta pagos provisionales. Esta página aplica a trabajadores asalariados con relación laboral y recibo de nómina.',
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
      name: 'Ley del Impuesto sobre la Renta — Art. 96, retención por salarios',
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
    {
      name: 'CONASAMI — salarios mínimos vigentes',
      url: 'https://www.gob.mx/conasami',
      publisher: 'Comisión Nacional de los Salarios Mínimos',
    },
  ],

  replaces: [
    '/calculadora-sueldo-neto-mexico',
    '/calculadora-sueldo-bruto-desde-neto-mexico-2026',
    '/calculadora-isr-mensual-empleados-subsidio-empleo-mexico',
    '/calculadora-isr-mexico-2026-tarifa-mensual-empleado',
    '/calculadora-isr-quincenal-mexico-2026',
    '/calculadora-salario-por-hora-mensual-diario-mexico',
    '/calculadora-salario-minimo-mexico-2026',
    '/calculadora-recibo-nomina-percepciones-deducciones-mexico-2026',
    '/calculadora-aumento-salario-inflacion-mx',
    '/calculadora-uma-conversion-mexico',
    '/trabajo/sueldo-neto-mexico',
  ],

  lastReviewed: '2026-08-04',
  locale: 'mx',
};
