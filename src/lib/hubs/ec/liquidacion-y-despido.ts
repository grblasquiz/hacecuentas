import type { HubData } from '../types';
import { ECUADOR_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "Salgo de la empresa: ¿cuánto me tienen que liquidar?"
 *
 * Constantes: src/lib/data/ecuador-2026.ts (SBU) y las de la fórmula viva de cesantía.
 * Cálculo espejado de liquidacion-haberes-finiquito-ecuador.ts,
 * indemnizacion-despido-intempestivo-ecuador.ts, cesantia-iess-ecuador.ts y
 * antiguedad-laboral-ecuador.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LAB =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const SBU = ECUADOR_2026.sbu;
/** Art. 188: hasta 3 años de servicio, 3 remuneraciones; desde ahí, 1 por año, tope 25. */
export const INDEM_MINIMA = 3;
export const INDEM_TOPE = 25;
/** Art. 185: bonificación por desahucio = 25% de la última remuneración por año de servicio. */
export const BONIF_DESAHUCIO = 0.25;
/** Seguro de cesantía del IESS: 2% trabajador + 1% empleador a la cuenta individual. */
export const CESANTIA_TRABAJADOR = 0.02;
export const CESANTIA_EMPLEADOR = 0.01;
export const CESANTIA_MIN_APORTACIONES = 24;
export const CESANTIA_DIAS_CESANTE = 60;
/** Tasa pasiva referencial del BCE usada para estimar el rendimiento del fondo. */
export const TASA_PASIVA_BCE = 0.0534;
/** Vacaciones art. 69, para el cálculo de los días no gozados. */
export const VACACIONES_BASE = 15;
export const VACACIONES_ADICIONALES_MAX = 15;

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/trabajo/liquidacion-y-despido',
  title: 'Liquidación por despido en Ecuador 2026: cuánto te deben',
  description:
    'Calculá tu liquidación en Ecuador 2026: despido intempestivo, visto bueno o desahucio, décimos proporcionales, vacaciones e indemnización del art. 188.',
  silo: 'Trabajo',
  siloHref: '/ec/trabajo',
  locale: 'ec',

  eyebrow: 'Ecuador · fin de la relación laboral · Código del Trabajo',
  h1: 'Salgo de la empresa en Ecuador: ¿cuánto me tienen que liquidar?',
  lede:
    'Todos los que se van cobran lo mismo por un lado —los décimos proporcionales y las vacaciones que no gozaron— y muy distinto por el otro. Lo que cambia el número final es la causa de la salida: si renunciaste, si te despidieron sin causa, si hubo visto bueno o si alguna de las partes notificó el desahucio. Y aparte de todo eso está tu fondo de cesantía en el IESS, que no lo paga la empresa.',
  stamps: [
    'Art. 188: 3 remuneraciones, tope 25',
    'Art. 185: bonificación del 25% por año',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Total de tu liquidación',

  cases: {
    title: '¿Cómo terminó la relación laboral?',
    intro:
      'Los proporcionales de décimos y vacaciones se pagan siempre. Lo que cambia entre una salida y otra son la indemnización y la bonificación. Elige tu caso.',
    items: [
      {
        id: 'renuncia',
        label: 'Renuncié',
        hint: 'Solo proporcionales · sin indemnización',
        answer:
          'En una renuncia voluntaria cobras los décimos proporcionales, las vacaciones no gozadas y los fondos de reserva pendientes, pero no hay indemnización.',
        yes: [
          'Décimo tercero proporcional a los meses del período trabajados',
          'Décimo cuarto proporcional, calculado sobre un SBU',
          'Vacaciones no gozadas, valoradas a razón de la remuneración dividida entre 30',
          'Fondos de reserva pendientes de depositar, si los tenías acumulados',
        ],
        warn: [
          DISCLAIMER_LAB,
          'La renuncia no da derecho a la bonificación por desahucio del art. 185: esa corresponde cuando la salida se formaliza como desahucio y se notifica ante la autoridad',
          'Firmar el acta de finiquito ante el inspector del trabajo cierra el reclamo por los rubros ahí liquidados: revísala antes de firmar',
        ],
        plazo:
          'el acta de finiquito se celebra ante el inspector del trabajo dentro de los 30 días de terminada la relación laboral.',
      },
      {
        id: 'despido',
        label: 'Me despidieron sin causa',
        hint: 'Despido intempestivo · art. 188',
        answer:
          'El despido intempestivo se indemniza con 3 remuneraciones hasta los 3 años de servicio, y con una remuneración por año desde ahí, con tope de 25.',
        yes: [
          'Indemnización del art. 188: 3 remuneraciones hasta los 3 años de servicio',
          'Con más de 3 años, una remuneración por cada año de servicio, con tope de 25 remuneraciones',
          'Bonificación del art. 185: 25% de la última remuneración por cada año de servicio',
          'Además, los décimos proporcionales, las vacaciones no gozadas y los fondos pendientes',
        ],
        warn: [
          DISCLAIMER_LAB,
          'La fracción de año se cuenta como año completo para la indemnización, criterio que aplica la autoridad laboral pero que puede discutirse en juicio',
          'Hay recargos especiales que esta cuenta no incluye: dirigentes sindicales, trabajadoras embarazadas o en período de lactancia y personas con discapacidad tienen indemnizaciones agravadas',
        ],
        plazo:
          'el reclamo por despido intempestivo prescribe a los tres años desde la terminación de la relación laboral.',
      },
      {
        id: 'vistobueno',
        label: 'Hubo visto bueno del empleador',
        hint: 'Terminación con causa · art. 172',
        answer:
          'Si el inspector concede el visto bueno pedido por el empleador, la relación termina con causa: cobras los proporcionales pero no la indemnización por despido.',
        yes: [
          'Décimos proporcionales y vacaciones no gozadas: se pagan igual que en cualquier salida',
          'Fondos de reserva pendientes de depositar',
          'La cesantía del IESS sigue siendo tuya, sin importar la causa de la salida',
          'La resolución del inspector del trabajo es la que define si hubo o no causa',
        ],
        warn: [
          DISCLAIMER_LAB,
          'Si el visto bueno lo pide el trabajador por falta del empleador (art. 173) y el inspector lo concede, corresponden las mismas indemnizaciones que en un despido intempestivo: en ese caso usa la rama de despido',
          'Mientras se tramita el visto bueno el empleador puede suspender la relación pagando la remuneración; si el inspector lo niega, el trabajador debe reintegrarse',
        ],
        plazo:
          'el trámite de visto bueno se sustancia ante el inspector del trabajo y su resolución puede impugnarse en juicio.',
      },
      {
        id: 'desahucio',
        label: 'Hubo desahucio',
        hint: 'Aviso de terminación · bonificación 25%',
        answer:
          'En el desahucio corresponde la bonificación del art. 185: el 25% de la última remuneración por cada año de servicio, sin indemnización por despido.',
        yes: [
          'Bonificación del 25% de la última remuneración por cada año de servicio (art. 185)',
          'Décimos proporcionales y vacaciones no gozadas',
          'La notificación se hace ante el inspector del trabajo, con el preaviso que fija la ley',
          'No hay indemnización del art. 188 porque no es un despido sin causa',
        ],
        warn: [
          DISCLAIMER_LAB,
          'El desahucio notificado por el empleador y el despido intempestivo se confunden seguido: si te sacaron de un día para el otro sin trámite ante el inspector, no fue desahucio',
          'La bonificación se calcula sobre la última remuneración mensual, no sobre el promedio del año',
        ],
        plazo:
          'la bonificación se paga en el acta de finiquito, que se celebra ante el inspector del trabajo dentro de los 30 días.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en dólares. La última remuneración mensual es la base de casi todo el cálculo: la indemnización, la bonificación y el valor de tus vacaciones no gozadas.',
  fields: [
    {
      id: 'sueldo',
      label: 'Última remuneración mensual (USD)',
      prefix: '$',
      value: '800',
      thousands: true,
      help: 'La remuneración del último mes completo, incluidas comisiones fijas. Es la base del art. 188 y del art. 185.',
    },
    {
      id: 'anios',
      label: 'Años completos de servicio',
      type: 'number',
      value: 5,
      min: 0,
      max: 45,
      step: 1,
      help: 'Años cumplidos con este empleador. Define las remuneraciones de indemnización y los días de vacaciones.',
    },
    {
      id: 'mesesFraccion',
      label: 'Meses sueltos además de esos años',
      type: 'number',
      value: 0,
      min: 0,
      max: 11,
      step: 1,
      help: 'Para la indemnización del art. 188 la fracción de año se cuenta como año completo.',
    },
    {
      id: 'mesesPeriodo',
      label: 'Meses trabajados del período de décimos',
      type: 'number',
      value: 7,
      min: 0,
      max: 12,
      step: 1,
      help: 'Meses corridos desde que arrancó el período del décimo hasta tu salida. Define los proporcionales.',
    },
    {
      id: 'diasVacaciones',
      label: 'Días de vacaciones no gozadas',
      type: 'number',
      value: 15,
      min: 0,
      max: 90,
      step: 1,
      help: 'Los días que te quedaron pendientes. Se liquidan a razón de la remuneración dividida entre 30.',
    },
    {
      id: 'aportaciones',
      label: 'Aportaciones mensuales al IESS acumuladas',
      type: 'number',
      value: 60,
      min: 0,
      max: 600,
      step: 1,
      help: 'Para estimar tu fondo de cesantía. Hacen falta 24 aportaciones y 60 días de cesantía para retirarlo.',
    },
  ],
  fineprint: DISCLAIMER_LAB,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu liquidación',
    caption:
      'Cuánto pesa cada rubro del finiquito: los proporcionales que se pagan siempre y, encima, la indemnización o la bonificación que corresponda según la causa de la salida.',
  },
  breakdownTitle: 'Rubro por rubro',
  breakdownIntro:
    'Cada línea con el artículo que la manda. El fondo de cesantía va aparte: lo administra el IESS, no la empresa.',

  faq: [
    {
      q: '¿Cuánto me corresponde por despido intempestivo en Ecuador?',
      a: 'El art. 188 del Código del Trabajo fija 3 remuneraciones para quien tenga hasta 3 años de servicio, y una remuneración por cada año de servicio a partir de ahí, con un tope de 25 remuneraciones. La fracción de año se cuenta como año completo. A eso se suma la bonificación del art. 185, del 25% de la última remuneración por cada año de servicio, y los proporcionales de décimos y vacaciones.',
    },
    {
      q: '¿Qué es la bonificación por desahucio y cuándo se cobra?',
      a: 'Es el 25% de la última remuneración mensual por cada año de servicio, según el art. 185. Corresponde cuando la relación termina por desahucio, es decir cuando una de las partes notifica ante el inspector del trabajo su voluntad de terminar el contrato. En la práctica también se liquida junto con la indemnización del art. 188 cuando hubo despido intempestivo.',
    },
    {
      q: '¿Si renuncio cobro indemnización?',
      a: 'No. La renuncia voluntaria da derecho a los décimos proporcionales, a las vacaciones no gozadas y a los fondos de reserva pendientes, pero no a la indemnización del art. 188 ni, en principio, a la bonificación del art. 185, que corresponde cuando la salida se formaliza como desahucio ante el inspector del trabajo.',
    },
    {
      q: '¿Qué es el visto bueno y cómo cambia mi liquidación?',
      a: 'Es el trámite ante el inspector del trabajo para terminar el contrato con causa. Si lo pide el empleador y se lo conceden (art. 172), la salida es con causa y no hay indemnización: solo proporcionales. Si lo pide el trabajador por falta del empleador y se lo conceden (art. 173), corresponden las mismas indemnizaciones que en un despido intempestivo.',
    },
    {
      q: '¿Cómo se calculan las vacaciones no gozadas en el finiquito?',
      a: 'Se valora el día dividiendo la última remuneración mensual entre 30 y se multiplica por los días pendientes. A diferencia de lo que pasa durante la relación laboral, en la liquidación no hay límite de dos períodos acumulados: todo lo que quedó sin gozar se paga en dinero.',
    },
    {
      q: '¿Cuándo puedo retirar mi fondo de cesantía del IESS?',
      a: `Cuando tengas al menos ${CESANTIA_MIN_APORTACIONES} aportaciones no simultáneas y lleves como mínimo ${CESANTIA_DIAS_CESANTE} días cesante desde el cese laboral. El fondo se forma con el 3% de la remuneración —2% del trabajador y 1% del empleador— depositado en tu cuenta individual, y rinde según la tasa pasiva referencial del Banco Central. La solicitud se hace en línea, en el portal del IESS.`,
    },
    {
      q: '¿El fondo de cesantía lo paga la empresa junto con la liquidación?',
      a: 'No. La cesantía la administra el IESS con los aportes que ya se hicieron mes a mes durante la relación laboral: no es un rubro del acta de finiquito y la empresa no te lo entrega. Es plata tuya que reclamas directamente al instituto una vez que cumples los requisitos de aportaciones y días de cesantía.',
    },
    {
      q: '¿La fracción de año cuenta para la indemnización?',
      a: 'Sí. Para el art. 188 la fracción de año se computa como año completo, así que alguien con 4 años y 2 meses se indemniza como si tuviera 5 años de servicio. Es el criterio que aplica la autoridad laboral, aunque en juicio se ha discutido en algunos casos. Para la bonificación por desahucio el cálculo suele hacerse sobre los años cumplidos.',
    },
    {
      q: '¿Hay un tope a la indemnización por despido?',
      a: 'Sí: 25 remuneraciones. Alguien con 30 años de servicio se indemniza igual que alguien con 25. Ese tope no alcanza a la bonificación del art. 185, que se sigue calculando al 25% por cada año efectivamente servido, ni a la jubilación patronal, que corresponde por separado a partir de los 25 años con la misma empresa.',
    },
    {
      q: '¿Qué es el acta de finiquito y por qué importa firmarla bien?',
      a: 'Es el documento que se celebra ante el inspector del trabajo, con el detalle pormenorizado de cada rubro pagado. Firmarla cierra el reclamo por los rubros que ahí figuran liquidados correctamente. Por eso conviene revisar rubro por rubro antes de firmar: si algo falta o está mal calculado, hay que dejarlo constar.',
    },
    {
      q: '¿Cuánto tiempo tengo para reclamar si me liquidaron mal?',
      a: 'Las acciones provenientes de la relación laboral prescriben a los tres años contados desde la terminación del contrato. Dentro de ese plazo se puede reclamar la diferencia de la liquidación, los décimos impagos y la indemnización por despido intempestivo ante la justicia laboral.',
    },
    {
      q: '¿Los despidos con protección especial se calculan igual?',
      a: 'No. Hay situaciones con indemnizaciones agravadas que esta estimación no cubre: el despido de una trabajadora embarazada o en período de lactancia, el de dirigentes sindicales y el de personas con discapacidad tienen recargos específicos, que se suman a lo del art. 188. Si estás en alguno de esos supuestos, el número real es mayor que el de esta cuenta.',
    },
  ],

  sources: [
    { name: 'Ministerio del Trabajo — Código del Trabajo (arts. 169, 172, 173, 185 y 188)', url: 'https://www.trabajo.gob.ec/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'Ministerio del Trabajo — Acta de finiquito y calculadora oficial', url: 'https://www.trabajo.gob.ec/salida-de-empleados/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'IESS — Seguro de cesantía', url: 'https://www.iess.gob.ec/', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
    { name: 'Banco Central del Ecuador — Tasas de interés referenciales', url: 'https://contenido.bce.fin.ec/documentos/informacioneconomica/indicadores/monetario/indTasaPasiva.html', publisher: 'Banco Central del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-liquidacion-finiquito-ecuador',
    '/ec/calculadora-indemnizacion-despido-intempestivo-ecuador',
    '/ec/calculadora-cesantia-iess-ecuador',
    '/ec/calculadora-antiguedad-laboral-ecuador',
  ],

  lastReviewed: '2026-08-16',
};
