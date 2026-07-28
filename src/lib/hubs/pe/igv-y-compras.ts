import type { HubData } from '../types';
import { PERU_2026, COURIER_TRIBUTOS_PERU } from '../../data/peru-2026';
import peruLive from '../../../data/live/peru.json';

/**
 * Hub de decisión PE — "¿Cuánto impuesto se le suma a lo que compro o cobro?"
 *
 * Absorbe cinco calculadoras sueltas de /pe/: IGV, detracciones (SPOT), ITF,
 * tributos de compras courier (Temu/Shein/AliExpress) y el conversor de tipo de
 * cambio SUNAT.
 *
 * Cálculo espejado de src/lib/formulas/igv-peru.ts, detracciones-igv-peru.ts,
 * itf-peru.ts, impuestos-compras-temu-shein-aliexpress-peru.ts y
 * tipo-de-cambio-sunat-dolar-soles-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** IGV general: 16% de IGV + 2% de IPM = 18% (Art. 17 Ley del IGV + Ley 27616). */
export const IGV = PERU_2026.igv;
/** Tasa especial MYPE de restaurantes y hoteles: 10,5% (8% IGV + 2% IPM + 0,5%). */
export const IGV_MYPE = PERU_2026.igvMypeRestauranteHotel;

/**
 * Detracciones (SPOT) — Anexo 3 de la R.S. 183-2004/SUNAT y modificatorias.
 * OJO: la fórmula vieja tenía intermediación laboral al 4%; el Anexo 3 la fija
 * en 12%. El 4% es la tasa de los contratos de construcción.
 */
export const SPOT: Array<{ id: string; label: string; pct: number; ref: string }> = [
  { id: 'servicios', label: 'Demás servicios gravados con el IGV', pct: 0.12, ref: 'Anexo 3, num. 10' },
  { id: 'intermediacion', label: 'Intermediación laboral y tercerización', pct: 0.12, ref: 'Anexo 3, num. 1' },
  { id: 'arrendamiento', label: 'Arrendamiento de bienes muebles', pct: 0.10, ref: 'Anexo 3, num. 2' },
  { id: 'construccion', label: 'Contratos de construcción', pct: 0.04, ref: 'Anexo 3, num. 9' },
  { id: 'transporte_carga', label: 'Transporte de bienes por vía terrestre', pct: 0.04, ref: 'R.S. 073-2006/SUNAT' },
];

/** Monto mínimo para que nazca la obligación de detraer en el Anexo 3: S/ 700. */
export const SPOT_MINIMO = 700;

/** ITF: 0,005% por operación gravada (Ley 28194, tasa vigente desde 2011). */
export const ITF_TASA = 0.00005;
/** Bancarización obligatoria desde S/ 2.000 o US$ 500 (Ley 28194 mod. Ley 30730). */
export const BANCARIZACION = { pen: 2000, usd: 500 };

/** Envíos courier: de minimis US$ 200, tope simplificado US$ 2.000, ad valorem 4% + IGV 18%. */
export const COURIER = COURIER_TRIBUTOS_PERU;

/** Tipo de cambio USD/PEN de referencia, del feed vivo (src/data/live/peru.json). */
export const TC_REF = (peruLive as any)?.usdpen?.valor ?? 3.4;
export const TC_FECHA = (peruLive as any)?.usdpen?.fecha ?? '';

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/impuestos/igv-y-compras',
  title: 'IGV, detracciones, ITF y compras del exterior en Perú: cuánto impuesto se suma',
  description:
    'Calcula el IGV del 18% de una venta o compra, la detracción del SPOT que te retienen, el ITF que descuenta el banco y los tributos de una compra en Temu, Shein o AliExpress que entra por courier, con el tipo de cambio del día.',
  silo: 'Impuestos',
  siloHref: '/pe/impuestos',
  locale: 'pe',

  eyebrow: 'Perú · SUNAT · IGV · SPOT · ITF',
  h1: '¿Cuánto impuesto se le suma a lo que compro o cobro?',
  lede:
    'El precio que ves casi nunca es el que pagas. Entre el IGV que se suma a la factura, la detracción que el cliente deposita en el Banco de la Nación en vez de pagártela, el ITF que el banco descuenta de cada movimiento y los tributos que el courier te cobra al entregar el paquete, hay cuatro cuentas distintas. Elige cuál es la tuya.',
  stamps: [
    `IGV general ${IGV * 100}% (16% + 2% de IPM)`,
    `Detracción mínima desde ${sol(SPOT_MINIMO)}`,
    `Courier sin tributos hasta US$ ${COURIER.deMinimisUsd} FOB`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Impuesto de la operación',

  cases: {
    title: '¿Qué operación estás haciendo?',
    intro:
      'Las cuatro cuentas usan bases distintas. El IGV se suma al precio; la detracción no es un impuesto sino un adelanto que se desvía de tu cobro; el ITF lo retiene el banco; y los tributos de importación los liquida Aduanas y te los cobra el courier.',
    items: [
      {
        id: 'igv',
        label: 'Compro o vendo dentro del Perú y necesito el IGV',
        hint: 'IGV 18% · agregar o quitar del precio',
        answer: `El IGV general es del ${IGV * 100}%: se suma al valor de venta para llegar al precio final, o se extrae dividiendo el total entre ${(1 + IGV).toFixed(2)}.`,
        yes: [
          `Tasa general del ${IGV * 100}%: ${(IGV * 100 - 2).toFixed(0)}% de IGV propiamente dicho más 2% de Impuesto de Promoción Municipal`,
          'Para agregarlo: valor de venta × 1,18. Para quitarlo: precio final ÷ 1,18',
          `Restaurantes y hoteles acogidos al régimen MYPE tienen una tasa especial del ${(IGV_MYPE * 100).toString().replace('.', ',')}%`,
          'Si estás en el Régimen General, el RER o el RMT, el IGV de tus compras es crédito fiscal y se resta del IGV de tus ventas',
          'En el Nuevo RUS no hay IGV: la cuota mensual lo reemplaza y por eso no puedes emitir facturas con crédito fiscal',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Hay bienes y servicios exonerados (Apéndices I y II de la Ley del IGV) e inafectos: no todo lo que vendes lleva 18%',
          'La exportación de bienes y servicios no está gravada con IGV, pero sí da derecho al saldo a favor del exportador',
          'Emitir una boleta en vez de una factura no cambia el IGV: cambia quién puede usarlo como crédito fiscal',
        ],
        plazo: 'la declaración y el pago mensual del IGV siguen el cronograma de SUNAT según el último dígito del RUC.',
      },
      {
        id: 'detraccion',
        label: 'Presto un servicio sujeto a detracción y me depositan menos',
        hint: 'SPOT · cuenta del Banco de la Nación',
        answer: `La detracción va del ${SPOT[3].pct * 100}% al ${SPOT[0].pct * 100}% según el servicio, y solo nace cuando la operación supera ${sol(SPOT_MINIMO)}.`,
        yes: [
          `Solo aplica si el importe de la operación supera ${sol(SPOT_MINIMO)} (Anexo 3 de la R.S. 183-2004/SUNAT)`,
          `Demás servicios gravados e intermediación laboral: ${SPOT[0].pct * 100}%. Arrendamiento de bienes muebles: ${SPOT[2].pct * 100}%. Contratos de construcción y transporte de carga: ${SPOT[3].pct * 100}%`,
          'El cliente deposita ese porcentaje en tu cuenta de detracciones del Banco de la Nación, no te lo paga a ti',
          'Ese dinero no se pierde: sirve para pagar IGV, Impuesto a la Renta, ESSALUD, ONP y multas',
          'Cumplidos los plazos y sin deuda tributaria, puedes pedir la liberación de fondos y que te lo transfieran a tu cuenta',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si el cliente no deposita la detracción, tú no puedes usar el crédito fiscal del IGV de esa operación hasta que el depósito se acredite',
          'Los porcentajes del SPOT cambian por resolución de SUNAT y por tipo de servicio: verifica el anexo vigente antes de facturar un servicio nuevo',
          'La detracción se calcula sobre el importe total de la operación con IGV incluido, no sobre el valor de venta',
        ],
        plazo: 'el depósito se hace hasta la fecha de pago parcial o total al proveedor, o dentro del quinto día hábil del mes siguiente al registro del comprobante, lo que ocurra primero.',
      },
      {
        id: 'itf',
        label: 'Muevo plata por el banco y quiero saber cuánto se lleva el ITF',
        hint: 'Impuesto a las Transacciones Financieras · Ley 28194',
        answer: `El ITF es del ${(ITF_TASA * 100).toString().replace('.', ',')}% por operación gravada: cinco céntimos por cada ${sol(1000)} que se mueven.`,
        yes: [
          `Tasa del ${(ITF_TASA * 100).toString().replace('.', ',')}% sobre cada abono o cargo en una cuenta afecta`,
          'Lo retiene el banco automáticamente y aparece como un cargo separado en tu estado de cuenta',
          'Las cuentas sueldo, las de CTS, las de AFP y las transferencias entre cuentas de un mismo titular están exoneradas',
          `Las operaciones desde ${sol(BANCARIZACION.pen)} o US$ ${BANCARIZACION.usd} tienen que pagarse por el sistema financiero para que el gasto sea deducible`,
          'El ITF pagado en el año es deducible como gasto en la determinación de la renta neta',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No bancarizar una operación que supera el umbral hace perder el crédito fiscal del IGV y la deducción del gasto: el costo de "pagar en efectivo" es muchísimo mayor que el ITF',
          'El ITF grava el movimiento, no la ganancia: si haces muchas transferencias del mismo dinero, pagas cada vez',
          'Los retiros en efectivo por ventanilla y cajero también están gravados en las cuentas afectas',
        ],
        plazo: 'la retención es inmediata en cada operación; no hay declaración a cargo del titular de la cuenta.',
      },
      {
        id: 'courier',
        label: 'Compré en Temu, Shein, AliExpress o Amazon y viene por courier',
        hint: 'Régimen simplificado de envíos de entrega rápida',
        answer: `Hasta US$ ${COURIER.deMinimisUsd} FOB no pagas nada; por encima de eso entra ${COURIER.adValorem * 100}% de ad valorem más ${COURIER.igv * 100}% de IGV.`,
        yes: [
          `Valor FOB hasta US$ ${COURIER.deMinimisUsd}: sin tributos, el paquete llega directo`,
          `Más de US$ ${COURIER.deMinimisUsd} y hasta US$ ${COURIER.topeSimplificadoUsd}: ad valorem del ${COURIER.adValorem * 100}% más IGV del ${COURIER.igv * 100}% sobre el valor más el arancel`,
          `Más de US$ ${COURIER.topeSimplificadoUsd}: sale del régimen simplificado y necesita agente de aduana y declaración de importación`,
          'Los tributos los cobra el courier al momento de entregar, junto con su comisión de despacho',
          'El valor que cuenta es el de la factura comercial, no el que uno declare por su cuenta',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El flete y el seguro pueden sumarse a la base según cómo venga documentado el envío: la cuenta de acá parte del valor FOB de la mercadería',
          'Hay mercancías restringidas y prohibidas que no entran por courier por más que el valor sea bajo: medicamentos, alimentos, cosméticos y equipos de telecomunicaciones tienen permisos propios',
          'La comisión de despacho del courier es un cobro de la empresa, no un tributo: no la confundas con el impuesto',
        ],
        plazo: 'los tributos se pagan contra entrega; si el paquete queda en depósito temporal, corren gastos de almacenaje por día.',
      },
    ],
  },

  inputsTitle: 'Los números de tu operación',
  inputsIntro:
    'Cada rama usa solo los campos que le sirven. El tipo de cambio viene precargado con la referencia de mercado y es editable: para efectos tributarios corresponde el publicado por SUNAT en la fecha de la operación.',
  fields: [
    {
      id: 'monto',
      label: 'Monto de la operación en soles (S/)',
      type: 'number',
      prefix: 'S/',
      value: 1000,
      min: 0,
      step: 100,
      help: 'En la rama de IGV, según el modo elegido es el valor de venta o el precio final. En detracciones, el importe total de la operación. En ITF, el monto que se mueve.',
    },
    {
      id: 'modo',
      label: '¿El monto ya incluye el IGV?',
      type: 'select',
      value: 'agregar',
      options: [
        { value: 'agregar', label: 'No: es el valor de venta y quiero sumarle el IGV' },
        { value: 'quitar', label: 'Sí: es el precio final y quiero saber cuánto es IGV' },
      ],
    },
    {
      id: 'tasaIgv',
      label: 'Tasa de IGV aplicable',
      type: 'select',
      value: 'general',
      options: [
        { value: 'general', label: 'General 18% (16% IGV + 2% IPM)' },
        { value: 'mype', label: 'Restaurantes y hoteles MYPE 10,5%' },
      ],
      help: 'La tasa especial es para restaurantes, hoteles y alojamientos turísticos acogidos al régimen MYPE.',
    },
    {
      id: 'servicio',
      label: 'Tipo de servicio sujeto a detracción',
      type: 'select',
      value: 'servicios',
      options: SPOT.map((s) => ({ value: s.id, label: `${s.label} — ${s.pct * 100}%` })),
      help: `La detracción solo nace si la operación supera ${sol(SPOT_MINIMO)}.`,
    },
    {
      id: 'operaciones',
      label: 'Cantidad de operaciones bancarias del mismo monto',
      type: 'number',
      value: 1,
      min: 1,
      max: 100,
      step: 1,
      help: 'Para estimar el ITF acumulado de un mes con varios movimientos iguales.',
    },
    {
      id: 'valorUsd',
      label: 'Valor de la compra del exterior (US$ FOB)',
      type: 'number',
      prefix: 'US$',
      value: 150,
      min: 0,
      step: 10,
      help: 'El valor de la mercadería según la factura comercial, sin flete ni seguro.',
    },
    {
      id: 'tipoCambio',
      label: 'Tipo de cambio (S/ por US$)',
      type: 'number',
      value: TC_REF,
      min: 0.5,
      step: 0.001,
      help: 'Precargado con la referencia de mercado del feed diario. Para declaraciones y comprobantes usa el tipo de cambio publicado por SUNAT en la fecha de la operación.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué parte del monto es impuesto',
    caption:
      'Separa lo que efectivamente queda en tu bolsillo o en el precio del bien de lo que se va en tributos y depósitos obligatorios.',
  },
  breakdownTitle: 'La cuenta, línea por línea',
  breakdownIntro:
    'Cada fila indica la base sobre la que se aplica el tributo y la norma que la fija. Los importes en dólares se convierten al tipo de cambio que cargaste.',

  faq: [
    {
      q: '¿Por qué el IGV es 18% si la ley dice 16%?',
      a: 'Porque son dos tributos que se declaran y pagan juntos: el Impuesto General a las Ventas propiamente dicho, del 16%, y el Impuesto de Promoción Municipal, del 2%, que va a las municipalidades. En la factura aparecen sumados como una sola línea del 18% y la mecánica de crédito fiscal los trata igual, así que en la práctica se habla de un IGV del 18%.',
    },
    {
      q: '¿Cómo saco el IGV de un precio que ya lo incluye?',
      a: `Se divide el precio final entre ${(1 + IGV).toFixed(2)} para obtener el valor de venta, y la diferencia es el IGV. Multiplicar por 0,18 el precio final es el error más común: da un IGV inflado, porque el 18% se aplica sobre la base y no sobre el total. Con la tasa MYPE de restaurantes y hoteles el divisor es ${(1 + IGV_MYPE).toFixed(3).replace('.', ',')}.`,
    },
    {
      q: '¿La detracción es un impuesto adicional?',
      a: `No. Es un adelanto de tus propios tributos: el cliente en vez de pagarte el 100% deposita un porcentaje en tu cuenta de detracciones del Banco de la Nación, y desde ahí pagas IGV, renta, EsSalud u ONP. La plata sigue siendo tuya, solo que atrapada en una cuenta de uso restringido. Si acumulas saldo y no tienes deuda tributaria, puedes pedir la liberación de fondos.`,
    },
    {
      q: '¿Desde qué monto corresponde detraer?',
      a: `Para los servicios del Anexo 3, la obligación nace cuando el importe de la operación supera ${sol(SPOT_MINIMO)}, IGV incluido. Por debajo de eso no hay depósito. Los bienes de los Anexos 1 y 2 tienen reglas y umbrales propios. Ojo: el porcentaje se aplica sobre el importe total de la operación, con IGV, no sobre el valor de venta.`,
    },
    {
      q: '¿Cuánto es la detracción de un servicio empresarial?',
      a: `El 12% para los demás servicios gravados con el IGV y también para la intermediación laboral y la tercerización. El arrendamiento de bienes muebles es 10%, y los contratos de construcción y el transporte de bienes por vía terrestre son 4%. Estos porcentajes los fija SUNAT por resolución y cambian: antes de facturar un servicio nuevo conviene revisar el anexo vigente.`,
    },
    {
      q: '¿Qué pasa si el cliente no deposita la detracción?',
      a: 'El principal perjudicado es el comprador: no puede usar el crédito fiscal del IGV de esa factura hasta que acredite el depósito. Para el proveedor, además de la molestia, el saldo de la cuenta de detracciones queda sin alimentar. SUNAT puede aplicar multas por el depósito omitido, con gradualidad si se subsana antes de la detección.',
    },
    {
      q: '¿Cuánto me cobra el banco de ITF?',
      a: `El ${(ITF_TASA * 100).toString().replace('.', ',')}% de cada operación gravada, que son cinco céntimos por cada mil soles. Es un monto chico por operación pero se paga en cada movimiento, así que en una empresa con muchas transferencias mensuales suma. Las cuentas sueldo, las de CTS, las de AFP y las transferencias entre cuentas del mismo titular están exoneradas.`,
    },
    {
      q: '¿Es obligatorio pagar por el banco?',
      a: `Desde ${sol(BANCARIZACION.pen)} o US$ ${BANCARIZACION.usd}, sí. Es la regla de bancarización de la Ley 28194: las operaciones que superan ese umbral tienen que pagarse con medios del sistema financiero. Si pagas en efectivo, pierdes el derecho a usar el crédito fiscal del IGV y a deducir el gasto o el costo para el Impuesto a la Renta. El ahorro del ITF es irrelevante frente a esa pérdida.`,
    },
    {
      q: '¿Cuánto pago de impuestos por una compra en Temu, Shein o AliExpress?',
      a: `Si el valor FOB del envío no supera los US$ ${COURIER.deMinimisUsd}, nada: entra libre por el régimen simplificado de envíos de entrega rápida. Entre US$ ${COURIER.deMinimisUsd} y US$ ${COURIER.topeSimplificadoUsd} pagas un ad valorem del ${COURIER.adValorem * 100}% sobre el valor y luego IGV del ${COURIER.igv * 100}% sobre el valor más ese arancel, lo que deja la carga total cerca del 23% del precio de la mercadería. Por encima de US$ ${COURIER.topeSimplificadoUsd} hay que importar por el régimen general con agente de aduana.`,
    },
    {
      q: '¿Conviene dividir la compra en varios envíos para no pagar?',
      a: 'Aduanas mira el envío, no el pedido, así que técnicamente varios envíos por debajo del umbral pagan menos. Pero hay límites a la cantidad de importaciones por persona natural sin RUC en el año, y el fraccionamiento sistemático de un mismo pedido puede ser observado como maniobra para eludir tributos. Además cada envío paga su propio flete, con lo que el ahorro suele evaporarse.',
    },
    {
      q: '¿Qué tipo de cambio uso para convertir a soles?',
      a: 'Para efectos tributarios, el tipo de cambio promedio ponderado que publica la SBS y difunde SUNAT en la fecha de la operación: el de venta para los egresos y el de compra para los ingresos, según el caso. No sirve un promedio del mes ni el de una casa de cambio. El valor precargado acá es una referencia de mercado para que la cuenta corra, no el oficial del día.',
    },
    {
      q: '¿El IGV de mis compras siempre lo puedo descontar?',
      a: 'Solo si estás en un régimen que da derecho a crédito fiscal (General, RMT o RER), la compra está vinculada a operaciones gravadas, tienes el comprobante que corresponde con todos los requisitos formales y lo anotaste en el registro de compras dentro del plazo. En el Nuevo RUS no hay crédito fiscal en absoluto: la cuota mensual reemplaza al IGV y al Impuesto a la Renta.',
    },
  ],

  sources: [
    { name: 'SUNAT — Impuesto General a las Ventas (IGV)', url: 'https://www.sunat.gob.pe/legislacion/igv/index.html', publisher: 'SUNAT' },
    { name: 'SUNAT — Sistema de Detracciones (SPOT)', url: 'https://www.sunat.gob.pe/orientacion/detracciones/index.html', publisher: 'SUNAT' },
    { name: 'SUNAT — Tasa del Impuesto a las Transacciones Financieras', url: 'https://orientacion.sunat.gob.pe/03-tasa-del-impuesto-las-transacciones-financieras', publisher: 'SUNAT' },
    { name: 'SUNAT — Envíos de entrega rápida (courier): tributos aplicables', url: 'https://www.sunat.gob.pe/orientacionaduanera/enviosentregarapida/index.html', publisher: 'SUNAT' },
    { name: 'SUNAT — Tipo de cambio para operaciones en moneda extranjera', url: 'https://www.sunat.gob.pe/cl-at-ittipcam/tcS01Alias', publisher: 'SUNAT' },
    { name: 'SBS — Tipo de cambio promedio ponderado', url: 'https://www.sbs.gob.pe/app/pp/SISTIP_PORTAL/Paginas/Publicacion/TipoCambioPromedio.aspx', publisher: 'Superintendencia de Banca, Seguros y AFP' },
  ],

  replaces: [
    '/pe/calculadora-igv-peru',
    '/pe/calculadora-detracciones-igv-peru',
    '/pe/calculadora-itf-peru',
    '/pe/calculadora-impuestos-compras-temu-shein-aliexpress-peru',
    '/pe/calculadora-tipo-de-cambio-sunat-dolar-soles-peru',
  ],

  lastReviewed: '2026-07-28',
};
