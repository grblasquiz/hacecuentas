import type { HubData } from '../types';
import { COLOMBIA_2026, BRE_B_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto me está cobrando el banco por mover mi plata?"
 *
 * Fuente única de constantes normativas: src/lib/data/colombia-2026.ts.
 *
 * 🔴 Decisión de diseño: las tarifas comerciales (cuota de manejo, costo de retiro,
 * costo de transferencia, comisión de la pasarela) NO se hardcodean. Cambian por
 * entidad, por producto y por mes, y las dos calculadoras que este hub absorbe traían
 * tablas que se contradecían entre sí. Van como campos editables por el usuario, con
 * rangos de referencia en el texto. Lo único fijo es lo que fija la ley: la tarifa y la
 * exención del GMF, y la gratuidad de Bre-B.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const UVT = COLOMBIA_2026.uvt;

/**
 * GMF (4×1000) — art. 870 y ss. del Estatuto Tributario.
 * OJO: la exención del art. 879 numeral 1 son 350 UVT MENSUALES DE RETIROS en una
 * única cuenta marcada. Es un tope sobre la BASE GRAVABLE, no un descuento sobre el
 * impuesto. Confundir las dos cosas hace que el 4×1000 dé casi siempre cero.
 */
export const GMF = {
  tasa: COLOMBIA_2026.gmf.tasa,
  exencionMensualUvt: COLOMBIA_2026.gmf.exencionMensualUvt,
};

/** Bre-B (Banco de la República): gratis para personas naturales; el cobro llegaría en sep-2029. */
export const BRE_B = {
  costoFuturoPorOperacion: BRE_B_2026.costoFuturoPorOperacion,
  topePorTransaccion: BRE_B_2026.topePorTransaccion,
  desdeCobro: 'septiembre de 2029',
};

/** IVA sobre comisiones de pasarelas y adquirentes. */
export const IVA = 0.19;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/finanzas/comisiones-bancarias',
  title: 'Comisiones bancarias en Colombia: cuánto te cobra el banco por mover tu plata',
  description:
    'Calculá lo que te cuestan de verdad las comisiones bancarias en Colombia: el 4×1000 y su exención de 350 UVT, cuota de manejo, retiros en cajero, transferencias, la gratuidad de Bre-B y la comisión de PSE para comercios.',
  silo: 'Finanzas',
  siloHref: '/co/finanzas',
  locale: 'co',

  eyebrow: 'Colombia · GMF · Bre-B · billeteras',
  h1: '¿Cuánto me está cobrando el banco por mover mi plata?',
  lede:
    'Entre la cuota de manejo, los retiros en cajero, las transferencias y el 4×1000, mover plata en Colombia tiene un costo que casi nadie suma. Acá lo ves junto, con la exención de 350 UVT bien aplicada —sobre lo que retirás, no sobre el impuesto— y con Bre-B en la comparación.',
  stamps: [
    `UVT: ${cop(UVT)} · exención GMF ${GMF.exencionMensualUvt} UVT/mes (${cop(GMF.exencionMensualUvt * UVT)})`,
    'Arts. 870 y 879 del Estatuto Tributario · Bre-B gratis para personas',
    '6 calculadoras adentro',
  ],

  resultLabel: 'Lo que te cuesta el mes',

  cases: {
    title: '¿Cómo movés tu plata?',
    intro:
      'El costo cambia mucho según dónde tengas el dinero y cómo lo saques. Las tarifas comerciales las cargás vos, porque cambian por banco y por producto; lo que sí es igual para todos es el 4×1000.',
    items: [
      {
        id: 'ahorros',
        label: 'Cuenta de ahorros de un banco tradicional',
        hint: 'Cuota de manejo + retiros + 4×1000',
        answer: 'Acá pesan las tres capas: cuota de manejo mensual, costo por retiro fuera de red y el 4×1000 sobre lo que sacás.',
        yes: [
          'Cuota de manejo mensual de la cuenta o de la tarjeta débito',
          'Costo por retiro en cajero, sobre todo fuera de la red del banco',
          `GMF del 4×1000 sobre cada retiro o transferencia que salga de la cuenta`,
          `Exención de ${GMF.exencionMensualUvt} UVT mensuales (${cop(GMF.exencionMensualUvt * UVT)}) si marcás la cuenta como exenta`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `La exención del GMF aplica a UNA sola cuenta por persona en todo el sistema financiero, y hay que marcarla expresamente ante el banco: no es automática`,
          'Muchos bancos exoneran la cuota de manejo si te consignan la nómina o si mantenés un saldo mínimo: preguntá antes de resignarte a pagarla',
          'Los retiros dentro de la propia red suelen ser gratis o mucho más baratos que en cajeros de otras entidades',
        ],
        plazo: 'la marcación de cuenta exenta se hace una vez y se puede cambiar de cuenta, pero sólo podés tener una marcada a la vez.',
      },
      {
        id: 'billetera',
        label: 'Billetera digital (Nequi, Daviplata y similares)',
        hint: 'Sin cuota de manejo, pero con topes',
        answer: 'La billetera te ahorra la cuota de manejo, pero tiene topes de saldo y de movimiento que conviene conocer antes de necesitarlos.',
        yes: [
          'Sin cuota de manejo en los productos básicos',
          'Envíos entre usuarios de la misma billetera normalmente sin costo',
          'Topes de saldo y de movimiento mensual según el tipo de producto (depósito de bajo monto o cuenta plena)',
          'Retiros en cajero y en corresponsales con costo propio, distinto al del banco',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los depósitos de bajo monto tienen un tope mensual acumulado de movimientos: al superarlo, la app bloquea la operación hasta el mes siguiente o exige subir a cuenta plena',
          'Los topes por operación y por mes los fija cada entidad y los cambia sin previo aviso: verificalos en la app antes de una operación grande',
          'Que no haya cuota de manejo no significa que no haya 4×1000: el GMF se cobra igual si la billetera no está marcada como exenta',
        ],
        plazo: 'los topes acumulados se reinician con el mes calendario, no a los 30 días de tu última operación.',
      },
      {
        id: 'transferencias',
        label: 'Hago muchas transferencias a otros bancos',
        hint: 'Bre-B contra interbancaria tradicional',
        answer: `Con Bre-B las transferencias entre personas son gratis: el cobro recién llegaría en ${BRE_B.desdeCobro}.`,
        yes: [
          'Bre-B: transferencias inmediatas entre entidades usando llaves, sin costo para personas naturales',
          `Tope por transacción de Bre-B: ${cop(BRE_B.topePorTransaccion)}`,
          'La transferencia interbancaria tradicional sigue teniendo costo en varios bancos',
          'El 4×1000 se cobra igual, sea por Bre-B o por transferencia tradicional: es un impuesto, no una comisión',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Bre-B es gratis hoy, pero el esquema ya tiene definido un valor de ${cop(BRE_B.costoFuturoPorOperacion)} por operación a partir de ${BRE_B.desdeCobro}: no es gratuidad permanente`,
          'Que la transferencia sea gratis no la exime del GMF: son dos cosas distintas y se suman',
          'Verificá que la llave a la que enviás sea del destinatario correcto: una transferencia inmediata es difícil de reversar',
        ],
        plazo: 'las transferencias por Bre-B se acreditan en segundos, las 24 horas, todos los días del año.',
      },
      {
        id: 'comercio',
        label: 'Tengo un negocio y cobro por PSE o pasarela',
        hint: 'Comisión + tarifa fija + IVA',
        answer: 'La comisión del cobro digital tiene tres capas: porcentaje sobre la venta, tarifa fija por transacción e IVA sobre la comisión.',
        yes: [
          'Un porcentaje sobre el valor de la venta, que negociás según tu volumen',
          'Una tarifa fija por cada transacción, que pesa mucho en tickets chicos',
          `IVA del ${(IVA * 100).toLocaleString('es-CO')}% sobre la comisión (no sobre la venta)`,
          'El 4×1000 sobre el dinero que después sacás de la cuenta del negocio',
        ],
        warn: [
          DISCLAIMER_TAX,
          'En ventas de ticket bajo la tarifa fija puede pesar más que el porcentaje: en una venta de $20.000 una fija de $900 ya es 4,5% efectivo',
          'Las cuentas de persona jurídica no acceden a la exención de 350 UVT del GMF: esa marcación es para personas naturales',
          'El dinero de la pasarela suele acreditarse con días de rezago: eso es costo financiero aunque no aparezca como comisión',
        ],
        plazo: 'la comisión se descuenta al momento del abono, así que el neto que recibís ya viene con todo restado.',
      },
    ],
  },

  inputsTitle: 'Tu mes típico de movimientos',
  inputsIntro:
    'Las tarifas cambian por banco y por producto, así que las cargás vos: sacalas de tu extracto del mes pasado, que es la fuente más confiable que existe para tu caso.',
  fields: [
    {
      id: 'retiros',
      label: 'Plata que sacás o transferís al mes (COP)',
      prefix: '$',
      value: '4.000.000',
      thousands: true,
      help: 'El total que sale de la cuenta en el mes. Es la base del 4×1000, que se cobra sobre lo que sale, no sobre lo que entra.',
    },
    {
      id: 'cuentaExenta',
      label: '¿Tenés esta cuenta marcada como exenta del 4×1000?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: `Sí — con la exención de ${GMF.exencionMensualUvt} UVT mensuales` },
        { value: 'no', label: 'No — pago el 4×1000 desde el primer peso' },
      ],
      help: 'Sólo se puede marcar una cuenta por persona en todo el sistema financiero, y hay que pedirlo expresamente al banco.',
    },
    {
      id: 'cuotaManejo',
      label: 'Cuota de manejo mensual (COP)',
      prefix: '$',
      value: '15.000',
      thousands: true,
      help: 'Lo que te cobra el banco por la cuenta o la tarjeta débito. En billeteras digitales suele ser $0, y con nómina muchos bancos la exoneran.',
    },
    {
      id: 'numRetiros',
      label: 'Retiros en cajero al mes',
      type: 'number',
      value: 4,
      min: 0,
      max: 60,
      step: 1,
      help: 'Contá sólo los que te cobran. Los de la propia red del banco muchas veces son gratis.',
    },
    {
      id: 'costoRetiro',
      label: 'Costo de cada retiro con cargo (COP)',
      prefix: '$',
      value: '2.500',
      thousands: true,
      help: 'Miralo en el extracto. Varía bastante entre la red propia y los cajeros de otras entidades.',
    },
    {
      id: 'numTransferencias',
      label: 'Transferencias a otros bancos al mes',
      type: 'number',
      value: 6,
      min: 0,
      max: 200,
      step: 1,
      help: 'Las que hacés hacia entidades distintas a la tuya.',
    },
    {
      id: 'costoTransferencia',
      label: 'Costo de cada transferencia interbancaria (COP)',
      prefix: '$',
      value: '5.000',
      thousands: true,
      help: 'Poné lo que te cobra hoy tu banco. Con Bre-B este costo es $0 para personas naturales, y el hub te muestra la diferencia.',
    },
    {
      id: 'ventaPromedio',
      label: 'Comercio: venta promedio por cobro (COP)',
      prefix: '$',
      value: '80.000',
      thousands: true,
      help: 'Sólo para la rama de comercio: el ticket promedio de lo que cobrás por la pasarela.',
    },
    {
      id: 'comisionPct',
      label: 'Comercio: comisión de la pasarela (%)',
      type: 'number',
      value: 2.99,
      min: 0,
      max: 15,
      step: 0.01,
      help: 'El porcentaje que te cobra la pasarela o el adquirente sobre cada venta. Se negocia por volumen.',
    },
    {
      id: 'comisionFija',
      label: 'Comercio: tarifa fija por transacción (COP)',
      prefix: '$',
      value: '900',
      thousands: true,
      help: 'El cargo fijo que se suma al porcentaje. Es el que arruina los tickets chicos.',
    },
    {
      id: 'numVentas',
      label: 'Comercio: cobros al mes',
      type: 'number',
      value: 120,
      min: 0,
      max: 10000,
      step: 1,
      help: 'Cuántas transacciones procesás en el mes.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'bars',
    title: 'De dónde sale cada peso que te cobran',
    caption:
      'Compara el peso de cada concepto en el costo del mes. En general la sorpresa es la misma: la suma de comisiones chicas y repetidas termina pesando más que el 4×1000, que es el que todo el mundo nombra.',
  },
  breakdownTitle: 'El costo del mes, concepto por concepto',
  breakdownIntro:
    'Primero lo que fija la ley (el GMF y su exención), después lo que fija cada entidad, y al final el total y cuánto representa sobre la plata que moviste.',

  faq: [
    {
      q: '¿Qué es el 4×1000 y sobre qué se cobra exactamente?',
      a: `Es el Gravamen a los Movimientos Financieros, un impuesto del ${(GMF.tasa * 1000).toLocaleString('es-CO')} por mil sobre cada operación que retira plata de una cuenta: retiros en efectivo, transferencias, pagos, cheques. Se cobra sobre lo que SALE, no sobre lo que entra ni sobre el saldo. Cada ${cop(1000000)} que sacás pagan ${cop(1000000 * GMF.tasa)}. Lo retiene el banco automáticamente y lo gira a la DIAN: no es una comisión de la entidad, es un impuesto nacional.`,
    },
    {
      q: '¿Cómo funciona la exención de 350 UVT?',
      a: `El numeral 1 del art. 879 del Estatuto Tributario exime del GMF los retiros de hasta ${GMF.exencionMensualUvt} UVT mensuales —hoy ${cop(GMF.exencionMensualUvt * UVT)}— de una cuenta de ahorros o depósito electrónico marcada para tal fin. Ojo con el error más común, que hasta las calculadoras cometen: son ${GMF.exencionMensualUvt} UVT de RETIROS exentos, no ${cop(GMF.exencionMensualUvt * UVT)} de impuesto perdonado. Si sacás ${cop(20000000)} en el mes con la cuenta marcada, pagás el 4×1000 sólo sobre el excedente de ${cop(GMF.exencionMensualUvt * UVT)}, no cero.`,
    },
    {
      q: '¿Puedo marcar varias cuentas como exentas?',
      a: 'No: una sola cuenta por persona en todo el sistema financiero colombiano, no una por banco. Hay que solicitarla expresamente a la entidad, porque no se marca sola, y conviene elegir aquella por donde pase el grueso de tus retiros. Se puede cambiar de cuenta marcada, pero el trámite tarda y durante la transición podés quedar sin exención en ninguna de las dos.',
    },
    {
      q: '¿Las billeteras digitales también cobran 4×1000?',
      a: 'Sí. El GMF es un impuesto sobre la operación, no sobre el tipo de entidad: si sacás plata de una billetera y esa cuenta no está marcada como exenta, se cobra igual que en un banco. La ventaja real de las billeteras es otra: no suelen cobrar cuota de manejo, y muchos depósitos electrónicos de bajo monto sí pueden marcarse como exentos del gravamen. Consultalo en la app antes de asumirlo.',
    },
    {
      q: '¿Qué es Bre-B y por qué es gratis?',
      a: `Bre-B es el sistema de pagos inmediatos del Banco de la República: transferencias entre entidades distintas en segundos, las 24 horas, usando llaves en lugar de números de cuenta. Para personas naturales es gratuito hoy, con un tope de ${cop(BRE_B.topePorTransaccion)} por transacción. No es gratuidad eterna: el esquema tiene definido un cobro de ${cop(BRE_B.costoFuturoPorOperacion)} por operación a partir de ${BRE_B.desdeCobro}. Aun así, comparado con transferencias interbancarias que en varios bancos cuestan miles de pesos, la diferencia anual es considerable.`,
    },
    {
      q: 'Si Bre-B es gratis, ¿me ahorro también el 4×1000?',
      a: 'No, y es la confusión más cara del momento. La comisión de transferencia es un cobro del banco; el 4×1000 es un impuesto de la Nación. Bre-B elimina el primero, no el segundo. Si transferís un millón por Bre-B con la cuenta sin marcar, seguís pagando $4.000 de GMF. Lo que sí podés hacer es que esa cuenta sea la que tenés marcada como exenta.',
    },
    {
      q: '¿Cómo me quito la cuota de manejo?',
      a: 'Las salidas habituales son tres: que te consignen la nómina en esa cuenta, mantener un saldo promedio mínimo que la entidad exonera, o pasarte a una cuenta o billetera digital que no la cobre. Muchos bancos exoneran la cuota si pedís el cambio a un producto sin cuota, pero no lo ofrecen espontáneamente. Vale la pena hacer la cuenta: doce cuotas al año suman más de lo que la mayoría estima.',
    },
    {
      q: '¿Cuánto cuesta retirar en cajero?',
      a: 'Depende de si el cajero es de tu banco o de otra entidad, y cuántos retiros gratis te da el producto al mes. La regla práctica que suele funcionar: menos retiros y de mayor monto salen más baratos si el costo es fijo por operación, pero pagás más 4×1000 si superás la exención. La forma honesta de decidirlo es sumar las dos cosas con tus números, que es lo que hace la calculadora de arriba.',
    },
    {
      q: '¿Por qué la comisión de PSE me duele más en ventas chicas?',
      a: `Porque tiene una parte fija. Con una comisión del 2,99% más ${cop(900)} fijos, una venta de ${cop(500000)} paga 3,17% efectivo, pero una de ${cop(20000)} paga 7,49%. Encima va el IVA del ${(IVA * 100).toLocaleString('es-CO')}% sobre la comisión. Si vendés mucho ticket bajo, negociar la tarifa fija te mueve más la aguja que negociar el porcentaje.`,
    },
    {
      q: '¿El IVA de la comisión se cobra sobre la venta?',
      a: `No: el ${(IVA * 100).toLocaleString('es-CO')}% se calcula sobre la comisión, no sobre el valor de la venta. Si tu comisión por una venta es de ${cop(3300)}, el IVA son ${cop(3300 * IVA)} y el total descontado es ${cop(3300 * (1 + IVA))}. Si sos responsable de IVA, ese impuesto es descontable en tu declaración, así que el costo real es la comisión sin IVA. Si no sos responsable, el IVA es costo puro.`,
    },
    {
      q: '¿Los comercios pueden usar la exención de 350 UVT?',
      a: 'No: la marcación de cuenta exenta del art. 879 es para personas naturales sobre cuentas de ahorro y depósitos electrónicos. Una persona jurídica paga el 4×1000 sobre todos sus retiros. Existe sí una deducción en renta: el 50% del GMF pagado en el año es deducible, independientemente de que tenga relación de causalidad con la actividad. Es un alivio parcial y hay que pedirlo en la declaración.',
    },
    {
      q: '¿Cuánto se me va al año en comisiones sin darme cuenta?',
      a: 'Ese es exactamente el punto ciego. Cuota de manejo, cuatro retiros con cargo y media docena de transferencias al mes, con tarifas típicas, superan con facilidad los cientos de miles de pesos al año, y eso antes del 4×1000. Ninguno de esos cobros duele individualmente, y por eso nadie los suma. Cargá tus números arriba una vez y vas a saber si te conviene mover la cuenta o simplemente marcar la exención.',
    },
  ],

  sources: [
    {
      name: 'Estatuto Tributario, art. 870 y ss. — Gravamen a los Movimientos Financieros',
      url: 'https://estatuto.co/870',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 879 — exenciones del GMF (350 UVT mensuales en cuenta marcada)',
      url: 'https://estatuto.co/879',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
    {
      name: 'Banco de la República — Bre-B, sistema de pagos inmediatos',
      url: 'https://www.banrep.gov.co/es/sistemas-pago/bre-b',
      publisher: 'Banco de la República',
    },
    {
      name: 'Superintendencia Financiera — tarifas y comisiones de los establecimientos de crédito',
      url: 'https://www.superfinanciera.gov.co/',
      publisher: 'Superintendencia Financiera de Colombia',
    },
    {
      name: 'DIAN — Gravamen a los Movimientos Financieros',
      url: 'https://www.dian.gov.co/impuestos/Paginas/default.aspx',
      publisher: 'DIAN',
    },
  ],

  replaces: [
    '/co/calculadora-comparativa-banco-comisiones-colombia-2026',
    '/co/calculadora-comparador-tarjeta-debito-colombia-2026-comisiones',
    '/co/calculadora-ahorro-comisiones-bre-b-vs-transferencia-colombia',
    '/co/calculadora-limites-retiro-recarga-nequi',
    '/co/calculadora-pse-comision-ventas-colombia',
    '/co/calculadora-gravamen-movimientos-financieros-4-1000-colombia',
  ],

  lastReviewed: '2026-07-28',
};
