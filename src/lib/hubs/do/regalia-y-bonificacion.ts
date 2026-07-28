import type { HubData } from '../types';
import { REPUBLICA_DOMINICANA_2026 as RD } from '../../data/republica-dominicana-2026';

/**
 * Hub de decisión DO — "¿Cuánto cobro además del sueldo: regalía pascual y bonificación?"
 *
 * Regalía pascual (Art. 219) y participación en los beneficios (Art. 223) son los
 * dos pagos anuales del trabajador dominicano y se confunden todo el tiempo: la
 * primera es un derecho fijo de todos, la segunda depende de que la empresa gane
 * plata y tiene tope en días de salario.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const REGALIA = RD.laboral.regaliaPascual;
export const BONIFICACION = RD.laboral.bonificacion;
export const DIVISOR_DIARIO = RD.divisorDiario;
/** Referencia del tope de la regalía: 5 salarios mínimos del sector privado no sectorizado (empresa grande). */
export const SALARIO_MINIMO_REF = RD.salarioMinimo.noSectorizado.grande;
export const TOPE_REGALIA = SALARIO_MINIMO_REF * RD.laboral.regaliaPascual.topeSalariosMinimos;

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'do/trabajo/regalia-y-bonificacion',
  title: 'Regalía pascual y bonificación República Dominicana: cuánto te toca',
  description:
    'Calculá tu regalía pascual (doble sueldo de Navidad) completa o proporcional y el tope de tu bonificación por participación en los beneficios, con los arts. 219 y 223 del Código de Trabajo.',
  silo: 'Trabajo',
  siloHref: '/do/trabajo',
  locale: 'do',

  eyebrow: 'República Dominicana · arts. 219 y 223 · Ley 16-92',
  h1: 'Lo que cobrás además del sueldo: regalía y bonificación.',
  lede:
    'La regalía pascual es un derecho de todos y se paga antes del 20 de diciembre; la bonificación depende de que la empresa haya tenido utilidades y tiene un tope en días de salario. Acá salen las dos cuentas juntas, con sus topes y sus plazos.',
  stamps: [
    'Regalía: salario devengado del año ÷ 12',
    `Tope de la regalía: ${dop(TOPE_REGALIA)}`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Total anual fuera del sueldo',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Los dos pagos se calculan distinto según cuánto tiempo llevás en la empresa y cómo esté armado tu salario.',
    items: [
      {
        id: 'completo',
        label: 'Trabajé el año completo con sueldo fijo',
        hint: 'Enero a diciembre en la misma empresa',
        answer: 'Tu regalía equivale a un mes de salario y se paga sin descuentos.',
        yes: [
          'Regalía pascual = salario ordinario devengado en el año ÷ 12, o sea un sueldo entero',
          'Se paga a más tardar el 20 de diciembre',
          'Exenta del ISR y sin cotización a la TSS: la cobrás completa',
          'Se suma la bonificación si la empresa tuvo utilidades netas',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La regalía tiene un tope legal de 5 salarios mínimos (' + dop(TOPE_REGALIA) + ' con la referencia de empresa grande): por encima de ese sueldo la regalía deja de crecer',
          'La regalía no incluye horas extra, recargo nocturno, propinas ni la participación en beneficios',
        ],
        plazo: 'el pago vence el 20 de diciembre; después de esa fecha ya estás en condiciones de reclamar.',
      },
      {
        id: 'parcial',
        label: 'Entré o salí a mitad de año',
        hint: 'Regalía proporcional',
        answer: 'Cobrás la parte proporcional a los meses trabajados: nada se pierde.',
        yes: [
          'Devengado del período ÷ 12: si trabajaste 7 meses, cobrás siete doceavos del sueldo',
          'Los días sueltos también cuentan, al divisor diario de ' + String(DIVISOR_DIARIO).replace('.', ','),
          'Se paga aunque hayas renunciado, y aunque te hayan despedido con causa',
          'Si saliste antes de diciembre, la regalía proporcional va dentro de tu liquidación',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La bonificación en cambio sí exige haber estado en la empresa durante el ejercicio que generó las utilidades',
        ],
        plazo: 'si saliste antes de diciembre, la regalía proporcional entra en el plazo de 10 días del Art. 86.',
      },
      {
        id: 'comisiones',
        label: 'Cobro comisiones o salario variable',
        hint: 'Salario ordinario variable',
        answer: 'Las comisiones ordinarias entran a la base de la regalía; las horas extra no.',
        yes: [
          'Se suman las comisiones ordinarias devengadas en el año al salario base',
          'El total del año se divide entre 12',
          'Con salario variable conviene tener el histórico de volantes de pago del año',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Quedan FUERA de la base: horas extra, recargo nocturno, propinas del 10% legal, viáticos y la propia participación en beneficios',
          'Si tu empresa liquida la regalía sólo sobre el sueldo base y vos cobrás comisiones habituales, te está pagando de menos',
        ],
        plazo: 'reclamá antes del cierre de diciembre: corregir después obliga a un ajuste de nómina.',
      },
      {
        id: 'bonificacion',
        label: 'Quiero saber cuánto me toca de bonificación',
        hint: 'Participación en los beneficios · Art. 223',
        answer: 'Es el 10% de las utilidades netas repartido entre el personal, con tope por antigüedad.',
        yes: [
          'La empresa reparte el ' + Math.round(BONIFICACION.porcentajeUtilidades * 100) + '% de sus utilidades netas anuales',
          'Con menos de 3 años de servicio, el tope es de ' + BONIFICACION.topeDiasMenos3anios + ' días de salario',
          'Con 3 años o más, el tope sube a ' + BONIFICACION.topeDias3anios + ' días',
          'Se paga entre 90 y 120 días después del cierre del ejercicio fiscal',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Están exentas de repartir: las empresas de zonas francas, las agrícolas/industriales/forestales/mineras en sus primeros 3 años y las agrícolas con capital de hasta un millón de pesos',
          'Si la empresa no tuvo utilidades netas, no hay bonificación: no es un derecho fijo como la regalía',
          'La bonificación sí está sujeta a ISR, a diferencia de la regalía',
        ],
        plazo: 'entre 90 y 120 días desde el cierre del ejercicio de la empresa.',
      },
    ],
  },

  inputsTitle: 'Tu salario y tu tiempo en la empresa',
  inputsIntro: 'Todo en pesos dominicanos. Si trabajaste el año entero, dejá 12 meses y 0 días.',
  fields: [
    {
      id: 'salario',
      label: 'Salario ordinario mensual (RD$)',
      prefix: 'RD$',
      value: 45000,
      thousands: true,
      help: 'Sin horas extra, nocturnidad ni propinas: sólo el salario ordinario.',
    },
    {
      id: 'meses',
      label: 'Meses trabajados en el año',
      type: 'number',
      value: 12,
      min: 0,
      max: 12,
      step: 1,
      help: 'Meses completos del año calendario en curso.',
    },
    {
      id: 'dias',
      label: 'Días sueltos del mes incompleto',
      type: 'number',
      value: 0,
      min: 0,
      max: 30,
      step: 1,
      help: 'Se computan al divisor diario legal.',
    },
    {
      id: 'comisiones',
      label: 'Comisiones ordinarias del año (RD$)',
      prefix: 'RD$',
      value: '0',
      thousands: true,
      help: 'Suma de comisiones habituales devengadas en el año. Las horas extra no van acá.',
    },
    {
      id: 'aniosAntiguedad',
      label: 'Años de antigüedad en la empresa',
      type: 'number',
      value: 3,
      min: 0,
      max: 50,
      step: 1,
      help: 'Define el tope de la bonificación: 45 o 60 días de salario.',
    },
    {
      id: 'utilidad',
      label: 'Utilidad neta anual de la empresa (RD$)',
      prefix: 'RD$',
      value: '0',
      thousands: true,
      help: 'Opcional. Sirve para ver el pool que se reparte (10%). Dejá 0 si no la conocés.',
    },
    {
      id: 'empleados',
      label: 'Cantidad de empleados de la empresa',
      type: 'number',
      value: 20,
      min: 1,
      max: 5000,
      step: 1,
      help: 'Sólo para estimar cómo se reparte el pool de la bonificación.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Tus ingresos extra del año',
    caption:
      'La regalía es fija y segura; la bonificación depende de las utilidades y del tope por antigüedad. Juntas son la diferencia entre 12 y casi 14 sueldos al año.',
  },
  breakdownTitle: 'Las dos cuentas, por separado',
  breakdownIntro:
    'Primero la regalía pascual del Art. 219, después la participación en beneficios del Art. 223. Montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cómo se calcula la regalía pascual?',
      a: 'Es el total del salario ordinario que devengaste entre enero y diciembre dividido entre 12. Con un sueldo fijo y el año completo eso da exactamente un mes de salario, que es de donde viene el apodo de "doble sueldo". Si trabajaste sólo parte del año, el devengado es menor y la regalía sale proporcional, sin ninguna penalidad.',
    },
    {
      q: '¿Cuándo se paga la regalía y qué pasa si no me la pagan?',
      a: 'A más tardar el 20 de diciembre. Si tu empleador no cumple, podés presentar una querella ante la Representación Local de Trabajo del Ministerio de Trabajo. Es una de las infracciones que el Ministerio persigue de forma más activa en diciembre, y no prescribe con el año: la deuda sigue siendo exigible.',
    },
    {
      q: '¿La regalía paga impuestos o TSS?',
      a: 'No. Está expresamente exenta del ISR y no cotiza a la TSS, por la Ley 87-01 y la Resolución 72-03 del CNSS. Se cobra íntegra. Si en tu volante de diciembre aparece un descuento de AFP, SFS o ISR sobre la regalía, es un error de nómina que hay que reclamar.',
    },
    {
      q: '¿Hay un tope para la regalía?',
      a: `Sí: cinco salarios mínimos. Tomando como referencia el mínimo del sector privado no sectorizado para empresas grandes (${dop(SALARIO_MINIMO_REF)}), el tope queda en ${dop(TOPE_REGALIA)}. Quien gana más que eso al mes cobra el tope, no un sueldo entero. Es un límite que en la práctica sólo afecta a salarios altos.`,
    },
    {
      q: '¿Qué entra y qué no entra en la base de la regalía?',
      a: 'Entra el salario ordinario, incluidas las comisiones habituales, porque forman parte del salario. No entran las horas extra, el recargo nocturno, la propina legal del 10%, los viáticos ni la propia participación en los beneficios. La regla es simple: lo ordinario suma, lo extraordinario no.',
    },
    {
      q: '¿Qué diferencia hay entre regalía y bonificación?',
      a: `La regalía es un derecho de todo trabajador, se calcula sobre tu propio salario y no depende de cómo le fue a la empresa. La bonificación es el reparto del ${Math.round(BONIFICACION.porcentajeUtilidades * 100)}% de las utilidades netas del ejercicio: si la empresa no ganó, no hay nada que repartir. Además la regalía está exenta de ISR y la bonificación no.`,
    },
    {
      q: '¿Cuál es el tope de la bonificación?',
      a: `Depende de tu antigüedad: ${BONIFICACION.topeDiasMenos3anios} días de salario ordinario si llevás menos de 3 años en la empresa, y ${BONIFICACION.topeDias3anios} días si llevás 3 años o más. Aunque el reparto del 10% te asignara más, cobrás el tope. Por eso, en empresas muy rentables con nómina chica, casi todo el mundo termina cobrando exactamente el tope.`,
    },
    {
      q: '¿Cuándo se paga la bonificación?',
      a: 'Entre 90 y 120 días después del cierre del ejercicio fiscal de la empresa. Para una empresa con cierre en diciembre, eso cae entre finales de marzo y finales de abril. No tiene una fecha única como la regalía porque depende del cierre contable de cada empresa.',
    },
    {
      q: '¿Qué empresas no pagan bonificación?',
      a: 'Las de zonas francas; las agrícolas, industriales, forestales y mineras durante sus tres primeros años de operación; y las agrícolas cuyo capital no exceda un millón de pesos. También queda fuera, obviamente, cualquier empresa que haya cerrado el ejercicio con pérdidas.',
    },
    {
      q: '¿Me corresponde bonificación si entré este año?',
      a: 'Sí, proporcional al tiempo trabajado dentro del ejercicio que generó las utilidades, y con el tope de 45 días por tener menos de 3 años de servicio. Lo que no corresponde es bonificación por un ejercicio en el que no estuviste en la empresa.',
    },
    {
      q: '¿Cómo verifico que me pagaron bien la regalía?',
      a: 'Sumá el salario ordinario de todos tus volantes de pago del año, dividí entre 12 y compará con lo que te depositaron en diciembre. Si cobrás sueldo fijo, el resultado tiene que ser un sueldo completo. Las diferencias más frecuentes aparecen cuando hubo aumento a mitad de año o cuando cobrás comisiones: en los dos casos la regalía debería reflejarlo.',
    },
  ],

  sources: [
    {
      name: 'Código de Trabajo (Ley 16-92), arts. 219 a 223',
      url: 'https://mt.gob.do/index.php/component/jdownloads/send/2-leyes/2-codigo-de-trabajo',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'Ministerio de Trabajo — regalía pascual, plazo y reclamos',
      url: 'https://mt.gob.do/',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'DGII — tratamiento del salario de Navidad en el ISR',
      url: 'https://dgii.gov.do/Paginas/inicio.aspx',
      publisher: 'Dirección General de Impuestos Internos',
    },
    {
      name: 'Comité Nacional de Salarios — salario mínimo de referencia del tope',
      url: 'https://mt.gob.do/index.php/servicios/comite-nacional-de-salarios',
      publisher: 'Ministerio de Trabajo',
    },
  ],

  replaces: [
    '/do/regalia-pascual-republica-dominicana',
    '/do/regalia-pascual-proporcional-republica-dominicana',
    '/do/calculadora-doble-sueldo-republica-dominicana',
    '/do/calculadora-bonificacion-republica-dominicana',
  ],

  lastReviewed: '2026-07-28',
};
