import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "Vendo, heredo o me donan una casa: ¿qué impuestos pago?"
 *
 * Fusiona el ISR por enajenación de casa habitación con la exención de 700.000 UDIS
 * (LISR Art. 93-XIX), el ISR por venta de terreno o local comercial sin exención
 * (Arts. 120, 126 y 127), el costo de heredar o donar un inmueble (ISAI estatal,
 * notario y registro, con las exenciones del Art. 93) y los gastos de escrituración
 * cuando el que aparece del otro lado de la operación eres tú comprando.
 *
 * Constantes desde la fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/**
 * Tarifa anual del ISR (Art. 152 LISR, Anexo 8 RMF 2026) con el último límite superior
 * finito: `define:vars` serializa a JSON y ahí `Infinity` se convierte en `null`.
 */
const TARIFA_ANUAL = MEXICO_2026.isrTarifaAnual.map(([inf, sup, cuota, tasa]) => [
  inf,
  Number.isFinite(sup) ? sup : 1e15,
  cuota,
  tasa,
]);

export const INMUEBLE_MX = {
  tarifaAnual: TARIFA_ANUAL,
  /** Exención de casa habitación — LISR Art. 93 fracc. XIX. */
  exencionUdis: MEXICO_2026.ventaCasaHabitacion.exencionUdis,
  valorUdi: MEXICO_2026.ventaCasaHabitacion.valorUdi,
  udiDataAsOf: MEXICO_2026.ventaCasaHabitacion.udiDataAsOf,
  aniosEntreExenciones: MEXICO_2026.ventaCasaHabitacion.aniosEntreExenciones,
  /** Tope de años de tenencia que dividen la ganancia — LISR Art. 120. */
  maxAniosTenencia: 20,
  /** Pago provisional que entera el notario a la entidad federativa — LISR Art. 127. */
  pagoProvisionalEntidad: 0.05,
  /** UMA anual, para la exención de donaciones a terceros (3 UMA anuales, Art. 93-XXIII). */
  umaAnual: MEXICO_2026.uma.anual,
  umasExencionDonacionTerceros: 3,
};

export const hub: HubData = {
  slug: 'mx/impuestos/vender-o-heredar-un-inmueble',
  title: 'Vender, heredar o donar una casa en México: ISR, ISAI y gastos de escrituración',
  description:
    'Cuánto ISR pagas al vender tu casa con la exención de 700.000 UDIS, qué pasa si es terreno o local comercial, y cuánto cuesta realmente heredar, donar o escriturar un inmueble entre ISAI, notario y registro.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',

  eyebrow: 'México · Inmuebles',
  h1: 'Vendo, heredo o me donan una casa: ¿qué impuestos pago?',
  lede:
    'El impuesto grande de un inmueble casi nunca es el que la gente teme. Vender tu casa puede salir exento; heredar no paga ISR pero sí ISAI; y un terreno no tiene exención alguna. Elige tu situación.',
  stamps: [
    'Exención de 700.000 UDIS · LISR Art. 93-XIX',
    'Ganancia dividida entre años de tenencia · Art. 120',
    'Pago provisional del 5% ante notario · Art. 127',
    '4 calculadoras fusionadas',
  ],

  resultLabel: 'Impuesto o costo estimado',

  cases: {
    title: '¿Qué operación estás haciendo?',
    intro: 'Empezamos por la más consultada: vender la casa en la que vives.',
    items: [
      {
        id: 'casa',
        label: 'Vendo mi casa habitación',
        hint: 'Con la exención de 700.000 UDIS si cumples los requisitos.',
        yes: [
          'Ganancia de la operación: precio menos costo de adquisición y gastos comprobados',
          'Monto exento por la regla de las 700.000 UDIS, con el valor de la UDI del día',
          'Ganancia gravable cuando el precio supera la exención, en proporción al excedente',
          'ISR estimado dividiendo la ganancia entre los años de tenencia y aplicando la tarifa anual',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La exención exige que sea tu casa habitación, acreditarlo ante notario y no haber usado la exención en los tres años anteriores: si ya la usaste, la venta se grava completa',
          'El valor de la UDI cambia todos los días, así que el monto exento en pesos se mueve: verifícalo el día de la firma con la publicación del Banco de México',
          'El cálculo no actualiza el costo de adquisición por inflación ni descuenta la depreciación de construcciones, que son ajustes que el notario sí aplica: el ISR real suele ser menor al estimado aquí',
          'Cuando el precio supera la exención, no se grava solo el excedente: se grava la ganancia en la proporción que el excedente representa del precio total',
        ],
        plazo: 'el notario retiene y entera el ISR al firmar la escritura; el ajuste final va en tu declaración anual.',
        answer:
          'Si el precio no supera las 700.000 UDIS y cumples los requisitos, la venta de tu casa habitación queda exenta de ISR.',
      },
      {
        id: 'terreno',
        label: 'Vendo un terreno o un local comercial',
        hint: 'Sin exención: toda la ganancia es gravable.',
        yes: [
          'Ganancia gravable completa: precio menos costo de adquisición y gastos notariales',
          'ISR anual estimado con la ganancia dividida entre los años de posesión',
          'Pago provisional del 5% de la ganancia que el notario entera a la entidad federativa',
          'Diferencia entre ese pago provisional y el ISR que resulta en la anual',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La exención de casa habitación no aplica a terrenos sin construcción ni a inmuebles de uso comercial: aquí la ganancia se grava desde el primer peso',
          'El 5% que entera el notario es un pago provisional a cuenta, no el impuesto definitivo: puede quedarte a pagar más o generarte saldo a favor en la anual',
          'Si el inmueble estaba afecto a tu actividad empresarial o profesional, el tratamiento cambia y no es el de enajenación de bienes',
          'El cálculo no actualiza el costo de adquisición por INPC, así que sobreestima la ganancia y por lo tanto el ISR',
        ],
        plazo: 'el pago provisional del 5% se entera dentro de los 15 días siguientes a la firma de la escritura.',
        answer:
          'Un terreno o local no tiene exención: se grava toda la ganancia, con un pago provisional del 5% que entera el notario a cuenta del ISR anual.',
      },
      {
        id: 'herencia',
        label: 'Heredo o me donan un inmueble',
        hint: 'No hay impuesto federal a la herencia, pero sí ISAI y gastos.',
        yes: [
          'ISAI del municipio sobre el valor del inmueble, con la tasa que fijas tú',
          'Honorarios de notario y derechos del Registro Público',
          'ISR cuando la donación es a alguien fuera de la línea recta y supera la exención',
          'Costo total de transmitir la propiedad',
        ],
        warn: [
          DISCLAIMER_TAX,
          'México no cobra impuesto federal a la herencia, y las donaciones entre cónyuges, ascendientes y descendientes en línea recta están exentas de ISR sin límite de monto',
          'Lo que siempre se paga es el impuesto local sobre adquisición de inmuebles, que fija cada estado o municipio: por eso la tasa es un campo editable y no una constante de este sitio',
          'Una donación a alguien distinto del cónyuge, ascendiente o descendiente solo está exenta hasta tres veces la UMA anual: el excedente se acumula y causa ISR',
          'Los ingresos exentos por herencia o donación deben informarse en la declaración anual cuando el total de ingresos exentos del año supera el umbral de la ley: no informarlos hace perder la exención',
        ],
        plazo: 'la escritura de adjudicación o donación se inscribe en el Registro Público, y el ISAI se paga al momento de la escrituración.',
        answer:
          'Heredar no causa ISR y donar entre padres, hijos y cónyuges tampoco; lo que se paga siempre es el ISAI local más notario y registro.',
      },
      {
        id: 'escriturar',
        label: 'Voy a comprar: cuánto necesito para escriturar',
        hint: 'ISAI, notario, registro, avalúo y gestoría por encima del precio.',
        yes: [
          'ISAI que te toca pagar como comprador, con la tasa de tu municipio',
          'Honorarios de notaría y derechos de inscripción en el Registro Público',
          'Avalúo, gestoría y trámites, sumados aparte',
          'Cuánto dinero necesitas en total: precio más gastos de cierre',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los gastos de escrituración los paga el comprador salvo pacto en contrario, y se suman al enganche: es el error de presupuesto más común al comprar',
          'Las tasas de ISAI, notaría y registro varían por entidad y municipio, y algunas tienen tarifas escalonadas o cuotas fijas mínimas: confirma con la notaría y la tesorería local antes de firmar',
          'Si compras con crédito hipotecario, la escritura del crédito genera honorarios e inscripción propios, además de los de la compraventa',
        ],
        plazo: 'el ISAI se paga antes o al momento de la firma; la inscripción en el Registro Público puede tardar semanas.',
        answer:
          'Además del precio, aparta un porcentaje del valor para ISAI, notaría, registro y avalúo: es el costo real de cerrar la compra.',
      },
    ],
  },

  inputsTitle: 'Los datos de la operación',
  inputsIntro: 'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'valor',
      label: 'Precio de venta o valor del inmueble (MXN)',
      prefix: '$',
      value: 4500000,
      thousands: true,
      help: 'En herencias y donaciones, el valor que se declara en la escritura.',
    },
    {
      id: 'costo',
      label: 'Costo de adquisición según escritura (MXN)',
      prefix: '$',
      value: 2400000,
      thousands: true,
      help: 'Lo que pagaste cuando lo compraste.',
    },
    {
      id: 'gastos',
      label: 'Gastos y mejoras con comprobante (MXN)',
      prefix: '$',
      value: 150000,
      thousands: true,
      help: 'Notario de la compra, comisiones e inversiones con factura.',
    },
    {
      id: 'anios',
      label: 'Años que llevas siendo dueño',
      value: 8,
      min: 1,
      max: 40,
      step: 1,
      help: 'Divide la ganancia para aplicar la tarifa anual; la ley tope en 20.',
    },
    {
      id: 'exencion',
      label: '¿Aplica la exención de casa habitación?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí — es mi casa y no usé la exención en 3 años' },
        { value: 'no', label: 'No — ya la usé, o no es casa habitación' },
      ],
      help: 'El notario te va a pedir cómo acreditar que ahí vives.',
    },
    {
      id: 'udi',
      label: 'Valor de la UDI del día',
      prefix: '$',
      value: MEXICO_2026.ventaCasaHabitacion.valorUdi,
      step: 0.000001,
      help: 'Cambia a diario: verifícalo en Banxico el día de la firma.',
    },
    {
      id: 'tipoTransmision',
      label: 'Tipo de transmisión sin venta',
      type: 'select',
      value: 'herencia',
      options: [
        { value: 'herencia', label: 'Herencia por sucesión' },
        { value: 'donacion-directa', label: 'Donación a cónyuge, padre, madre, hijo o hija' },
        { value: 'donacion-tercero', label: 'Donación a otra persona' },
      ],
      help: 'El parentesco es lo que decide si hay ISR.',
    },
    {
      id: 'tasaIsai',
      label: 'Tasa de ISAI de tu municipio',
      suffix: '%',
      value: 3.5,
      min: 0,
      max: 10,
      step: 0.01,
      help: 'Va de 2% a 6,5% según la entidad: confírmala en la tesorería local.',
    },
    {
      id: 'tasaNotaria',
      label: 'Honorarios de notaría',
      suffix: '%',
      value: 1.2,
      min: 0,
      max: 10,
      step: 0.01,
      help: 'Porcentaje sobre el valor del inmueble, más IVA según el arancel local.',
    },
    {
      id: 'tasaRegistro',
      label: 'Derechos del Registro Público',
      suffix: '%',
      value: 0.6,
      min: 0,
      max: 10,
      step: 0.01,
      help: 'Algunos estados cobran cuota fija en lugar de porcentaje.',
    },
    {
      id: 'extras',
      label: 'Avalúo, gestoría y trámites (MXN)',
      prefix: '$',
      value: 25000,
      thousands: true,
      help: 'Avalúo bancario, certificados de libertad de gravamen y gestoría.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte la operación',
    caption: 'Compara lo que te queda contra lo que se va en impuestos y gastos de cierre.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto ISR pago al vender mi casa en México?',
      a: 'Si es tu casa habitación, puedes quedar totalmente exento cuando el precio de venta no supera las 700.000 UDIS y no usaste esa exención en los tres años anteriores. Si el precio la supera, no se grava solo el excedente: se grava la ganancia en la proporción que el excedente representa del precio, y sobre esa ganancia se aplica la tarifa del impuesto.',
    },
    {
      q: '¿Cuánto son 700.000 UDIS en pesos?',
      a: 'Depende del valor de la UDI, que el Banco de México publica todos los días y que sube con la inflación. Por eso el monto de la exención en pesos no es una cifra fija: se multiplica el valor de la UDI vigente al momento de la operación por 700.000. Este hub trae el último valor cargado y te deja actualizarlo.',
    },
    {
      q: '¿Cada cuánto puedo usar la exención de casa habitación?',
      a: 'Una vez cada tres años. El notario consulta si ya la aplicaste en ese lapso, así que no es algo que se pueda declarar a conveniencia. Si vendiste otra casa con exención hace menos de tres años, esta venta se grava completa.',
    },
    {
      q: '¿Por qué la ganancia se divide entre los años de tenencia?',
      a: 'Porque la ganancia de una venta se acumuló durante años pero se realiza en uno solo, y aplicarle la tarifa anual completa castigaría artificialmente al vendedor. La ley permite dividir la ganancia entre los años transcurridos, con tope de veinte, aplicar la tarifa a esa fracción y multiplicar el resultado por los mismos años.',
    },
    {
      q: '¿Un terreno paga ISR al venderlo?',
      a: 'Sí, y sin exención. La exención de las 700.000 UDIS es exclusiva de la casa habitación, así que un terreno baldío, un local comercial, una bodega o una segunda propiedad de inversión pagan sobre toda la ganancia. Al firmar, el notario entera un pago provisional del 5% de la ganancia a la entidad federativa, a cuenta del impuesto anual.',
    },
    {
      q: '¿Se paga impuesto por heredar una casa en México?',
      a: 'No hay impuesto federal a la herencia y el heredero no causa ISR por recibirla. Lo que sí se paga siempre es el impuesto local sobre adquisición de inmuebles, además de los honorarios del notario y los derechos de inscripción en el Registro Público. Ese conjunto suele ser el costo real de la sucesión.',
    },
    {
      q: '¿Y si en lugar de heredar me donan la casa en vida?',
      a: 'La donación entre cónyuges y en línea recta ascendente o descendente está exenta de ISR sin límite de monto. Una donación a un hermano, un sobrino o un amigo solo está exenta hasta tres veces la UMA anual, y el excedente se acumula a tus ingresos del ejercicio, así que puede terminar en un impuesto considerable.',
    },
    {
      q: '¿Qué es el ISAI y quién lo paga?',
      a: 'Es el impuesto sobre adquisición de inmuebles, un tributo local que cobra el estado o el municipio cada vez que un inmueble cambia de dueño, sin importar si el cambio viene de una compraventa, una herencia o una donación. Lo paga quien adquiere, y la tasa varía por entidad, por lo que este hub la deja editable en vez de fijarla.',
    },
    {
      q: '¿Cuánto hay que presupuestar para escriturar?',
      a: 'Como referencia general, entre el 4% y el 8% del valor del inmueble entre ISAI, notaría, registro, avalúo y gestoría, aunque el rango real depende del municipio y de si hay crédito hipotecario de por medio. Es dinero que se necesita en efectivo al cierre: el crédito hipotecario no lo financia.',
    },
    {
      q: '¿Puedo restar lo que gasté en remodelar?',
      a: 'Solo las inversiones que aumentan el valor del inmueble y que tengas amparadas con comprobante fiscal a tu nombre. El mantenimiento ordinario no cuenta, y las facturas sin requisitos fiscales tampoco. Es de las diferencias más grandes entre el impuesto estimado y el que finalmente calcula el notario.',
    },
    {
      q: '¿El impuesto que retiene el notario es el definitivo?',
      a: 'Es un pago provisional. El impuesto definitivo se determina en tu declaración anual, donde la ganancia se acumula con tus demás ingresos y se aplican las deducciones que correspondan. Puede quedarte diferencia a pagar o, con más frecuencia de lo que se cree, saldo a favor.',
    },
    {
      q: '¿Por qué mi notario calcula menos impuesto que esta estimación?',
      a: 'Porque el notario actualiza el costo de adquisición por inflación y separa el valor del terreno del de la construcción para aplicarle depreciación, dos ajustes que reducen la ganancia gravable y que aquí no se aplican. Tomá este resultado como techo del impuesto, no como cifra final.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre la Renta — exención de casa habitación (Art. 93-XIX y XXIII), enajenación de bienes (Arts. 119-128)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Banco de México — valor diario de la UDI',
      url: 'https://www.banxico.org.mx/tipcamb/main.do?page=inf&idioma=sp',
      publisher: 'Banxico',
    },
    {
      name: 'SAT — enajenación de bienes inmuebles y pagos ante notario',
      url: 'https://www.sat.gob.mx/consultas/42497/enajenacion-de-bienes',
      publisher: 'SAT',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
  ],

  replaces: [
    '/calculadora-isr-venta-casa-mexico-700000-udis',
    '/calculadora-isr-venta-terreno-inmueble-comercial-mexico',
    '/calculadora-impuestos-herencia-donacion-inmueble-mexico',
    '/calculadora-gastos-escrituracion-isai-mexico-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
