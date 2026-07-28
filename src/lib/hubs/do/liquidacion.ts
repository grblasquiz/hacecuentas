import type { HubData } from '../types';
import { REPUBLICA_DOMINICANA_2026 as RD } from '../../data/republica-dominicana-2026';

/**
 * Hub de decisión DO — "Se terminó mi contrato: ¿cuánto me tienen que pagar?"
 *
 * Escalas de cesantía (Art. 80), preaviso (Art. 76) y vacaciones (Art. 177/180)
 * desde la tabla maestra única. Sumamos además la penalidad del Art. 86 por
 * retraso en el pago, que es la palanca real del trabajador dominicano.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Auxilio de cesantía, Art. 80. Los dos primeros tramos son sumas FIJAS. */
export const CESANTIA = RD.laboral.cesantia.map((t) => ({
  desdeMeses: t.desdeMeses,
  hastaMeses: Number.isFinite(t.hastaMeses) ? t.hastaMeses : null,
  dias: t.dias,
  porAnio: t.porAnio,
}));

/** Preaviso, Art. 76. */
export const PREAVISO = RD.laboral.preaviso.map((t) => ({
  desdeMeses: t.desdeMeses,
  hastaMeses: Number.isFinite(t.hastaMeses) ? t.hastaMeses : null,
  dias: t.dias,
}));

/** Vacaciones, Art. 177 y tabla proporcional del Art. 180. */
export const VACACIONES = RD.laboral.vacaciones;

/** Divisor universal de nómina (Reglamento 258-93). */
export const DIVISOR_DIARIO = RD.divisorDiario;

/** Plazo del Art. 86 para pagar las prestaciones tras la salida. */
export const PLAZO_ART86_DIAS = 10;

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'do/trabajo/liquidacion',
  title: 'Liquidación laboral República Dominicana: cesantía, preaviso y vacaciones',
  description:
    'Calculá tus prestaciones laborales en RD$: auxilio de cesantía del Art. 80, preaviso del Art. 76, vacaciones, regalía proporcional y la penalidad del Art. 86 por retraso en el pago.',
  silo: 'Trabajo',
  siloHref: '/do/trabajo',
  locale: 'do',

  eyebrow: 'República Dominicana · Código de Trabajo Ley 16-92',
  h1: 'Se terminó tu contrato: qué te tienen que pagar y cuándo.',
  lede:
    'Cesantía, preaviso, vacaciones y regalía proporcional dependen de una sola cosa: por qué terminó el contrato. Cargá tu salario y tu antigüedad y la cuenta arma la liquidación completa, incluida la penalidad que corre si el empleador se pasa del plazo legal.',
  stamps: [
    'Arts. 76, 80, 86 y 177 del Código de Trabajo',
    `Salario diario: sueldo ÷ ${String(DIVISOR_DIARIO).replace('.', ',')}`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Total de tu liquidación',

  cases: {
    title: '¿Cómo terminó el contrato?',
    intro:
      'Es la pregunta que define todo: cesantía y preaviso se cobran o se pierden según el motivo. Partimos del caso más consultado.',
    items: [
      {
        id: 'despido',
        label: 'Me despidieron sin causa justificada',
        hint: 'Despido injustificado · arts. 87 y 95',
        answer: 'Cobrás todo: preaviso, cesantía, vacaciones y regalía proporcional.',
        yes: [
          'Auxilio de cesantía del Art. 80, según tu antigüedad',
          'Preaviso del Art. 76 en dinero, porque no te dieron el aviso anticipado',
          'Vacaciones no disfrutadas del año en curso',
          'Regalía pascual proporcional a los meses trabajados del año',
          'Cualquier salario, comisión u hora extra pendiente',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El empleador debe comunicar el despido al Ministerio de Trabajo dentro de las 48 horas; si no lo hace, el despido se reputa injustificado',
          'Tenés dos meses desde la terminación para demandar: el plazo de prescripción del Art. 702 es corto y no se recupera',
        ],
        plazo: 'el pago vence a los 10 días de la salida. Desde el día 11 corre la penalidad del Art. 86.',
      },
      {
        id: 'desahucio',
        label: 'El empleador ejerció el desahucio',
        hint: 'Art. 75 · sin invocar causa',
        answer: 'A efectos de plata es igual al despido injustificado: preaviso y cesantía completos.',
        yes: [
          'Auxilio de cesantía del Art. 80 completo',
          'Preaviso del Art. 76: o te lo conceden trabajado, o te lo pagan en dinero',
          'Vacaciones y regalía proporcional',
          'Durante el preaviso trabajado tenés derecho a dos medias jornadas semanales para buscar empleo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El desahucio del empleador no requiere causa, pero sí pagar las prestaciones. Si te lo presentan como "renuncia de mutuo acuerdo", estás resignando cesantía y preaviso',
          'No confundas desahucio con despido: el desahucio no se puede ejercer durante el embarazo ni durante las vacaciones',
        ],
        plazo: 'mismos 10 días del Art. 86 para el pago efectivo de las prestaciones.',
      },
      {
        id: 'dimision',
        label: 'Renuncié con causa justificada (dimisión)',
        hint: 'Arts. 96 a 100 · falta del empleador',
        answer: 'La dimisión justificada te da las mismas prestaciones que un despido injustificado.',
        yes: [
          'Cesantía y preaviso completos, igual que en el despido injustificado',
          'Vacaciones no disfrutadas y regalía proporcional',
          'Causas típicas: falta de pago del salario, no inscripción en la TSS, acoso, cambio unilateral de condiciones',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La dimisión hay que comunicarla al Ministerio de Trabajo dentro de las 48 horas indicando la causa; sin ese aviso se reputa injustificada y perdés todo',
          'La carga de probar la causa es tuya: juntá evidencia (recibos, mensajes, certificaciones de la TSS) antes de dimitir',
          'El plazo para ejercer la dimisión es de 15 días desde el hecho que la motiva',
        ],
        plazo: 'una vez comunicada, corre el mismo plazo de 10 días para el pago.',
      },
      {
        id: 'renuncia',
        label: 'Renuncié sin causa',
        hint: 'Desahucio del trabajador',
        answer: 'Perdés cesantía y preaviso, pero conservás vacaciones y regalía proporcional.',
        yes: [
          'Vacaciones no disfrutadas del año',
          'Regalía pascual proporcional a los meses trabajados',
          'Salarios y comisiones pendientes',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Al renunciar sin causa perdés el auxilio de cesantía completo: es la diferencia más cara entre renunciar y esperar el desahucio',
          'Vos también debés preaviso al empleador; si no lo das, puede descontarte el equivalente',
        ],
        plazo: 'las vacaciones y la regalía proporcional se pagan igual dentro de los 10 días.',
      },
    ],
  },

  inputsTitle: 'Tu salario y tu antigüedad',
  inputsIntro:
    'El salario ordinario mensual promedio y el tiempo que estuviste en la empresa. Todo en pesos dominicanos.',
  fields: [
    {
      id: 'salario',
      label: 'Salario ordinario mensual (RD$)',
      prefix: 'RD$',
      value: 45000,
      thousands: true,
      help: 'Promedio del salario ordinario. No incluye horas extra, propinas ni la regalía.',
    },
    {
      id: 'anios',
      label: 'Años completos de antigüedad',
      type: 'number',
      value: 3,
      min: 0,
      max: 50,
      step: 1,
      help: 'Años cumplidos en la empresa.',
    },
    {
      id: 'meses',
      label: 'Meses adicionales',
      type: 'number',
      value: 4,
      min: 0,
      max: 11,
      step: 1,
      help: 'Meses sueltos por encima de los años completos.',
    },
    {
      id: 'mesesRegalia',
      label: 'Meses trabajados este año (para la regalía)',
      type: 'number',
      value: 7,
      min: 0,
      max: 12,
      step: 1,
      help: 'Meses del año calendario en curso que alcanzaste a trabajar antes de la salida.',
    },
    {
      id: 'pendiente',
      label: 'Salario, comisiones u horas extra pendientes (RD$)',
      prefix: 'RD$',
      value: '0',
      thousands: true,
      help: 'Lo que te quedaron debiendo del último período trabajado.',
    },
    {
      id: 'diasDesdeSalida',
      label: 'Días transcurridos desde la salida',
      type: 'number',
      value: 0,
      min: 0,
      max: 720,
      step: 1,
      help: 'Para calcular la penalidad del Art. 86, que corre a partir del día 11 sin pago.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu liquidación',
    caption:
      'Cada concepto es una cuenta distinta: la cesantía crece con la antigüedad, el preaviso se congela a los 28 días desde el primer año y la regalía depende sólo de los meses del año en curso.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro:
    'Todo se paga en días de salario ordinario multiplicados por el salario diario. Montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cómo se calcula el auxilio de cesantía?',
      a: `Por tramos de antigüedad, sobre el salario diario. De 3 a 6 meses son 6 días fijos; de 6 meses a 1 año, 13 días fijos; de 1 a 5 años, 21 días por cada año; y a partir de los 5 años, 23 días por cada año. Los dos primeros tramos no son "por año": son sumas fijas, y ahí se equivoca casi todo el mundo. Con menos de 3 meses de antigüedad no hay cesantía.`,
    },
    {
      q: '¿Cuántos días de preaviso me corresponden?',
      a: 'De 3 a 6 meses de antigüedad, 7 días; de 6 meses a 1 año, 14 días; y a partir del año, 28 días. A diferencia de la cesantía, el preaviso deja de crecer: alguien con 2 años y alguien con 20 cobran los mismos 28 días. Si el empleador te concede el preaviso trabajado, no te lo paga en dinero; si te saca de inmediato, sí.',
    },
    {
      q: '¿Por qué se divide entre 23,83 y no entre 30?',
      a: `Porque el divisor legal de nómina dominicano es ${String(DIVISOR_DIARIO).replace('.', ',')} días al mes, que sale de la jornada de 44 horas repartida en 5,5 días por semana: 5,5 × 52 ÷ 12. Está en el Reglamento 258-93 y es el divisor que usa la calculadora oficial del Ministerio de Trabajo. Dividir entre 30 achica el día en cerca de un 20% y por lo tanto achica toda tu liquidación: es el error —o la trampa— más común.`,
    },
    {
      q: '¿Qué pasa si el empleador no me paga a tiempo?',
      a: `El Art. 86 le da ${PLAZO_ART86_DIAS} días desde la terminación para pagarte las prestaciones. A partir del día 11 te debe un día de salario ordinario por cada día de retraso, sin tope, hasta que pague. Es una penalidad que se acumula sola: tres meses de mora con un sueldo de ${dop(45000)} suman más de ${dop((45000 / DIVISOR_DIARIO) * 80)}. Por eso conviene dejar constancia de la fecha de salida y del reclamo.`,
    },
    {
      q: '¿Cuántos días de vacaciones me pagan si no las tomé?',
      a: 'Con 1 a 5 años de antigüedad, 14 días laborables de salario; con 5 años o más, 18 días. Si no completaste el año, el Art. 180 tiene una tabla proporcional: 5 meses son 6 días, 6 meses 7 días, y así hasta 12 días a los 11 meses. Por debajo de 5 meses no se genera el derecho proporcional en contrato indefinido.',
    },
    {
      q: '¿La regalía pascual se paga aunque me vaya en mitad del año?',
      a: 'Sí, proporcional. La regalía es el salario ordinario devengado entre enero y diciembre dividido entre 12, así que si trabajaste 7 meses cobrás siete doceavos. Se paga sin importar el motivo de la salida —incluso si renunciaste— y va exenta de ISR y sin descuentos de TSS.',
    },
    {
      q: '¿Renunciar me hace perder la cesantía?',
      a: 'Sí, si renunciás sin causa justificada. El auxilio de cesantía sólo se paga cuando el contrato termina por desahucio del empleador o por despido injustificado, y también cuando dimitís con causa justificada probada. Esa es la razón por la que muchos trabajadores esperan el desahucio en vez de renunciar: la diferencia puede ser de varios meses de sueldo.',
    },
    {
      q: '¿La liquidación paga ISR o cotiza a la TSS?',
      a: 'El auxilio de cesantía está exento del ISR y no cotiza a la TSS, y la regalía pascual también. Los salarios pendientes y las vacaciones sí forman parte de la remuneración y siguen las reglas normales de retención. Que te descuenten TSS sobre la cesantía es un error de nómina que conviene reclamar.',
    },
    {
      q: '¿Qué es el descargo y por qué me lo hacen firmar?',
      a: 'Es el recibo de saldo y finiquito: al firmarlo declarás que recibiste todo lo que te corresponde y que no tenés más reclamos. Firmá recién cuando el monto esté acreditado y cuadre con la cuenta. Un descargo firmado por un monto menor al legal se puede impugnar, pero es mucho más difícil que negociar antes de firmar.',
    },
    {
      q: '¿Cuánto tiempo tengo para reclamar?',
      a: 'Las acciones laborales prescriben a los dos meses desde la terminación del contrato para las que nacen del despido o la dimisión, según el Art. 702 del Código de Trabajo. Es un plazo muy corto comparado con otros países de la región. Presentar la querella ante el Ministerio de Trabajo o la demanda ante el juzgado dentro de ese plazo es lo que preserva el derecho.',
    },
    {
      q: '¿Se cuenta la fracción de año en la cesantía?',
      a: 'El Art. 80 prevé que la fracción de año superior a 3 meses se pague proporcionalmente. Esta cuenta liquida los años completos según el tramo que corresponde, así que si llevás varios meses por encima del último año cumplido, el monto real puede ser algo mayor que el estimado acá. Reclamá esa fracción de forma expresa: no siempre la incluyen de oficio.',
    },
    {
      q: '¿Qué documentos conviene tener antes de reclamar?',
      a: 'Los volantes de pago de los últimos doce meses, el contrato o la carta de designación, la certificación de historia laboral de la TSS —que prueba desde cuándo cotizás y por cuánto—, y cualquier comunicación escrita sobre la terminación. Con la historia de la TSS en la mano es muy difícil que discutan tu antigüedad o tu salario.',
    },
  ],

  sources: [
    {
      name: 'Código de Trabajo de la República Dominicana (Ley 16-92)',
      url: 'https://mt.gob.do/index.php/component/jdownloads/send/2-leyes/2-codigo-de-trabajo',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'Calculadora oficial de prestaciones laborales del Ministerio de Trabajo',
      url: 'https://calculo.mt.gob.do/',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'Ministerio de Trabajo — asistencia judicial y querellas laborales',
      url: 'https://mt.gob.do/',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'TSS — consulta de historia laboral del trabajador',
      url: 'https://tss.gob.do/',
      publisher: 'Tesorería de la Seguridad Social',
    },
  ],

  replaces: [
    '/do/calculadora-liquidacion-republica-dominicana',
    '/do/calculadora-cesantia-republica-dominicana',
    '/do/calculadora-preaviso-republica-dominicana',
    '/do/calculadora-vacaciones-republica-dominicana',
    '/do/calculadora-articulo-86-retraso-prestaciones-republica-dominicana',
  ],

  lastReviewed: '2026-07-28',
};
