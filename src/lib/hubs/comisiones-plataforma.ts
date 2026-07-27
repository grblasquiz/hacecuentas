import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me cobra de comisión la plataforma?"
 *
 * Un solo hub con ramas porque la pregunta y la mecánica son idénticas en los
 * dos públicos que absorbe: el que maneja/reparte y el que vende. En los dos
 * casos el usuario factura un bruto, la plataforma le retiene un porcentaje,
 * el fisco retiene otro y los costos operativos se comen el resto. Lo único
 * que cambia entre ramas son las tasas y la moneda, no el modelo.
 *
 * Los porcentajes son espejo de las fórmulas originales:
 *  - src/lib/formulas/comision-doordash-rappi-pedidosya-restaurante-2026.ts
 *  - src/lib/formulas/comision-tienda-nube-2026-monto-mensual-checkout.ts
 *  - src/lib/formulas/comision-etsy-venta-handmade.ts
 *  - src/lib/formulas/comision-amazon-fba-producto.ts
 *  - src/lib/formulas/ingreso-uber-airbnb-host.ts
 *  - src/lib/formulas/comision-uber-driver-ganancia-real-argentina-2026.ts
 *  - src/lib/formulas/uber-driver-chile.ts
 *  - src/lib/formulas/uber-driver-mexico.ts
 *  - src/lib/formulas/comision-uber-eats-glovo-rider.ts
 *  - src/lib/formulas/comision-venta.ts
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'business'). */
const DISCLAIMER_BUSINESS =
  'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.';

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/**
 * Tasas por caso. Todas relevadas en julio de 2026 y espejo de la fórmula
 * original de cada calculadora absorbida.
 *
 *  comision      % que retiene la plataforma sobre el bruto.
 *  retencion     % de retención fiscal.
 *  retSobreNeto  la retención se calcula sobre (bruto − comisión), no sobre el bruto.
 *                Es el caso chileno: la boleta de honorarios se emite por el
 *                líquido que paga Uber, no por la tarifa completa.
 *  side          'cobro' = el usuario ES quien cobra la comisión (vendedor).
 *  moneda        prefijo de la moneda con la que se imprime el resultado.
 */
export interface PlataformaMath {
  comision: number;
  retencion: number;
  retSobreNeto?: boolean;
  side?: 'pago' | 'cobro';
  moneda: string;
  /** Etiqueta corta de la retención, para el desglose. */
  retLabel: string;
}

export const PLATAFORMA_MATH: Record<string, PlataformaMath> = {
  'delivery-restaurante': { comision: 25, retencion: 0, moneda: 'AR$', retLabel: 'Retenciones' },
  ecommerce: { comision: 7.04, retencion: 0, moneda: 'AR$', retLabel: 'Retenciones' },
  etsy: { comision: 9.5, retencion: 0, moneda: 'US$', retLabel: 'Retenciones' },
  amazon: { comision: 15, retencion: 0, moneda: 'US$', retLabel: 'Retenciones' },
  airbnb: { comision: 3, retencion: 0, moneda: 'AR$', retLabel: 'Impuestos del alquiler' },
  'uber-ar': { comision: 25, retencion: 21, moneda: 'AR$', retLabel: 'Monotributo y aportes' },
  'uber-cl': { comision: 25, retencion: 14.5, retSobreNeto: true, moneda: 'CLP $', retLabel: 'Retención boleta de honorarios' },
  'uber-mx': { comision: 25, retencion: 10.1, moneda: 'MXN ', retLabel: 'Retención SAT (IVA + ISR)' },
  rider: { comision: 0, retencion: 0, moneda: 'AR$', retLabel: 'Retenciones' },
  vendedor: { comision: 5, retencion: 21, side: 'cobro', moneda: 'AR$', retLabel: 'IVA sobre la comisión' },
};

export const hub: HubData = {
  slug: 'negocios/comisiones-de-plataforma',
  title: '¿Cuánto me cobra de comisión la plataforma? — Calculadora de comisiones',
  description:
    'Rappi, PedidosYa, Uber, Uber Eats, Tienda Nube, Mercado Pago, Airbnb, Etsy y Amazon: cuánto te retiene cada plataforma sobre lo que facturás y cuánto te queda de verdad después de comisiones, retenciones y costos.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Guía y estimación para negocios',
  h1: 'La plataforma se lleva un porcentaje. Veamos cuánto queda.',
  lede:
    'Partimos del caso más frecuente: un restaurante que vende por delivery. Cambiá el caso si manejás, repartís, vendés online o cobrás a comisión, y ajustá los números con tus datos.',
  stamps: ['Actualizado 27-07-2026', 'Tarifas relevadas en julio de 2026', '12 calculadoras adentro'],

  resultLabel: 'Lo que te queda',

  cases: {
    title: '¿Con qué plataforma trabajás?',
    intro:
      'Hay dos públicos acá y los dos hacen la misma cuenta: el que maneja o reparte y el que vende. Elegí el tuyo y las tasas se ajustan solas.',
    items: [
      {
        id: 'delivery-restaurante',
        label: 'Tengo un restaurante y vendo por delivery',
        hint: 'Rappi · PedidosYa · Uber Eats',
        answer: 'Las apps de delivery retienen entre 20% y 28% de cada pedido.',
        yes: [
          'Comisión de la plataforma sobre el total del pedido: Rappi 25%, PedidosYa 20%, Uber Eats 28%',
          'La publicidad dentro de la app va aparte y se carga como costo fijo del mes',
          'El margen bruto de la cocina tiene que ser mayor que la comisión o cada pedido pierde plata',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'La comisión se calcula sobre el precio de carta en la app, no sobre lo que cobrás en el salón: si no subís los precios del menú de delivery, la comisión sale de tu margen',
        ],
        plazo: 'las plataformas suelen liquidar semanalmente, con 7 a 15 días de desfasaje contra la venta.',
      },
      {
        id: 'ecommerce',
        label: 'Vendo online con tienda propia',
        hint: 'Tienda Nube + Mercado Pago',
        answer: 'Entre plataforma y pasarela de pago se van unos 7 puntos de cada venta.',
        yes: [
          'Abono mensual del plan (va en costos fijos): Inicial $0, Esencial $26.999, Impulso $78.999, Escala $234.999',
          'Comisión de la plataforma por transacción: 2% en Inicial, 1% en Esencial, 0,7% en Impulso, 0% en Escala',
          'Procesamiento de Mercado Pago Checkout: 4,99% + IVA ≈ 6,04% efectivo con acreditación inmediata',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'El abono del plan es fijo: cuanto menos vendés, más pesa. Con ventas bajas conviene un plan barato aunque tenga más comisión por transacción',
        ],
        plazo: 'la acreditación inmediata cobra la tasa más alta; a 10, 18 o 30 días baja bastante.',
      },
      {
        id: 'etsy',
        label: 'Vendo hecho a mano en Etsy',
        hint: 'Handmade · en dólares',
        answer: 'Etsy se lleva cerca del 9,5% más cargos fijos por publicación y cobro.',
        yes: [
          'Transaction fee 6,5% sobre precio + envío',
          'Payment processing 3% + US$ 0,25 por operación',
          'Listing fee US$ 0,20 por publicación',
          'Offsite Ads 12% o 15% extra si la venta vino de un anuncio de Etsy',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'El transaction fee se cobra también sobre el envío que le cobrás al cliente, no sólo sobre el precio de la pieza',
          'Offsite Ads es obligatorio arriba de US$ 10.000 facturados en 12 meses: no lo podés desactivar',
        ],
        plazo: 'los cargos fijos (US$ 0,45 por venta) pesan mucho en piezas baratas: revisá tu precio mínimo.',
      },
      {
        id: 'amazon',
        label: 'Vendo en Amazon con FBA',
        hint: 'Referral fee + fulfillment',
        answer: 'Referral fee típico 15% más el fee de logística por unidad.',
        yes: [
          'Referral fee: 15% en la mayoría de las categorías (8% a 20% según categoría)',
          'Fulfillment fee por unidad según peso y tamaño: va como costo variable',
          'Storage fee mensual por volumen almacenado: va como costo fijo',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'El storage sube fuerte en el último trimestre del año y el inventario que no rota se come el margen',
        ],
        plazo: 'el referral fee lo fija la categoría del listing: confirmalo antes de fijar precio.',
      },
      {
        id: 'airbnb',
        label: 'Alquilo mi propiedad por Airbnb',
        hint: 'Host · comisión 3%',
        answer: 'Airbnb cobra 3% al anfitrión; el resto se te va en limpieza y gastos fijos.',
        yes: [
          'Comisión de Airbnb al anfitrión: 3% del ingreso bruto en el esquema de tarifa dividida',
          'Limpieza por check-in: costo variable, sube con estadías cortas',
          'Expensas, servicios, internet y amenities: costo fijo mensual',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La comisión de Airbnb es la parte chica: los gastos fijos y la limpieza pesan mucho más y muchos anfitriones sólo miran el 3%',
        ],
        plazo: 'a menor estadía promedio, más check-ins y más costo de limpieza sobre las mismas noches.',
      },
      {
        id: 'uber-ar',
        label: 'Manejo para Uber en Argentina',
        hint: 'Comisión 25% + monotributo',
        answer: 'Uber retiene 25% y el monotributo se lleva otro tanto del bruto.',
        yes: [
          'Comisión de Uber: 25% de la tarifa',
          'Aportes de monotributo estimados sobre el bruto (por defecto 21%)',
          'Nafta y mantenimiento van como costos variables del período',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La amortización del auto no aparece en ningún resumen de Uber y es el costo que más se subestima: el vehículo se gasta trabajando',
        ],
        plazo: 'la recategorización de monotributo es cuatrimestral: si facturás de más quedás fuera de escala.',
      },
      {
        id: 'uber-cl',
        label: 'Manejo para Uber en Chile',
        hint: 'Comisión 25% + boleta',
        answer: 'Uber retiene 25% y la boleta de honorarios suma 14,5% sobre el líquido.',
        yes: [
          'Comisión de Uber: 25% de la tarifa',
          'Retención provisional de la boleta de honorarios: 14,5% sobre lo que te queda después de la comisión',
          'Bencina, mantenimiento por kilómetro y peajes como costos variables',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La retención de la boleta es un pago a cuenta, no un impuesto definitivo: parte vuelve en la declaración anual de renta',
        ],
        plazo: 'la tasa de retención de honorarios se actualiza cada año hasta llegar al 17%.',
      },
      {
        id: 'uber-mx',
        label: 'Manejo para Uber en México',
        hint: 'Comisión 25% + retención SAT',
        answer: 'Con RFC, Uber retiene 25% de comisión y 10,1% de IVA e ISR.',
        yes: [
          'Comisión de Uber: 25% de la tarifa',
          'Con RFC: retención de IVA 8% + ISR 2,1% (régimen de plataformas tecnológicas)',
          'Sin RFC la retención salta a IVA 16% + ISR 20%: poné 36% en el campo de retención',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Manejar sin RFC te cuesta más del triple de retención: es el error más caro de esta rama',
        ],
        plazo: 'dar de alta el RFC en el régimen de plataformas se hace en línea y aplica desde el mes siguiente.',
      },
      {
        id: 'rider',
        label: 'Reparto en moto o bici',
        hint: 'Uber Eats · Glovo · Rappi',
        answer: 'Al repartidor no le descuentan comisión: le pagan por pedido.',
        yes: [
          'A vos te pagan por pedido entregado más propinas: no hay porcentaje retenido',
          'Lo que se come el ingreso son los costos: combustible y amortización del vehículo',
          'El neto por hora es la métrica que importa, no el total del mes',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'Como monotributista, los aportes salen de tu bolsillo: cargalos en el campo de retención si querés verlos en la cuenta',
        ],
        plazo: 'las horas pico pagan mejor por pedido: el mismo esfuerzo rinde distinto según la franja.',
      },
      {
        id: 'vendedor',
        label: 'Yo cobro la comisión',
        hint: 'Vendedor · agente · freelance',
        answer: 'Acá la comisión es tu ingreso, y el IVA que facturás no es tuyo.',
        yes: [
          'Tu comisión es un porcentaje del monto de la operación',
          'Si sos responsable inscripto sumás IVA sobre la comisión: lo cobrás pero lo ingresás a ARCA',
          'Los gastos de la operación (viáticos, publicidad, movilidad) salen de tu comisión',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El IVA que cobrás sobre la comisión no es ingreso tuyo: si lo gastás, después lo tenés que poner de tu bolsillo',
        ],
        plazo: 'pactá por escrito si la comisión se calcula sobre el monto con IVA o sobre el neto: cambia bastante.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Dejá los porcentajes en 0 y se usa la tarifa vigente del caso que elegiste. Poné un valor si negociaste otra cosa.',
  fields: [
    {
      id: 'bruto',
      label: 'Facturación bruta del período (lo que paga el cliente)',
      value: '1.500.000',
      thousands: true,
      help: 'El total antes de que la plataforma descuente nada. Si sos vendedor a comisión, es el monto de la operación.',
    },
    {
      id: 'comisionPct',
      label: 'Comisión de la plataforma (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.1,
      value: 0,
      help: 'Dejalo en 0 para usar la tarifa vigente del caso elegido.',
    },
    {
      id: 'retencionPct',
      label: 'Retenciones e impuestos sobre lo facturado (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.1,
      value: 0,
      help: 'Dejalo en 0 para usar la retención por defecto del caso. Poné un valor si tu situación fiscal es otra.',
    },
    {
      id: 'fijos',
      label: 'Costos fijos del período (abono, alquiler, publicidad, seguro)',
      value: '0',
      thousands: true,
    },
    {
      id: 'variables',
      label: 'Costos variables del período (insumos, nafta, limpieza, envíos)',
      value: '300.000',
      thousands: true,
    },
    {
      id: 'horas',
      label: 'Horas trabajadas en el período (0 si no aplica)',
      type: 'number',
      min: 0,
      value: 0,
    },
  ],
  fineprint: DISCLAIMER_BUSINESS,

  chart: {
    type: 'donut',
    title: 'Quién se queda con cada peso que factura el cliente',
    caption:
      'El anillo reparte tu facturación bruta entre lo que retiene la plataforma, lo que se lleva el fisco, lo que te cuesta operar y lo que finalmente entra a tu bolsillo.',
  },
  breakdownTitle: 'Cómo se descompone lo que facturaste',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del período.',

  faq: [
    {
      q: '¿Cuánto cobra de comisión cada app de delivery en 2026?',
      a: 'Con tarifas relevadas en julio de 2026: Rappi retiene alrededor del 25% del pedido, PedidosYa cerca del 20% y Uber Eats hasta el 28%. Son valores de referencia para el comercio adherido estándar: si negociaste un plan propio o pagás publicidad dentro de la app, tu costo real es distinto. Estas tarifas cambian seguido, así que confirmá la vigente en tu contrato.',
    },
    {
      q: '¿La comisión se calcula sobre el total del pedido o sobre el producto?',
      a: 'Sobre el total del pedido, incluyendo el precio de los productos tal como figuran en la app. Por eso muchos comercios cargan en la plataforma un precio de carta más alto que en el salón: si vendés al mismo precio en los dos canales, la comisión sale entera de tu margen.',
    },
    {
      q: '¿Cuánto me queda realmente si manejo para Uber?',
      a: 'Después del 25% de comisión, la retención fiscal de tu país y el combustible, en general queda entre el 35% y el 50% de lo que facturás. La cuenta que casi nadie hace es la amortización del auto: el vehículo se gasta trabajando y ese desgaste no aparece en ningún resumen de la plataforma.',
    },
    {
      q: '¿Por qué la retención de Uber es distinta en Argentina, Chile y México?',
      a: 'Porque el régimen fiscal del conductor cambia en cada país. En Argentina se tributa como monotributista con un aporte estimado sobre el bruto. En Chile se emite boleta de honorarios con una retención provisional del 14,5% sobre el líquido que paga la plataforma. En México el régimen de plataformas tecnológicas hace que Uber retenga IVA e ISR directamente: 8% + 2,1% con RFC, o 16% + 20% sin RFC.',
    },
    {
      q: '¿Conviene tener RFC para manejar en México?',
      a: 'Sí, y por mucho. Con RFC la retención total es del 10,1% de la tarifa; sin RFC salta al 36%. Sobre el mismo bruto la diferencia es de más de veinticinco puntos de tu facturación, muy por encima de cualquier costo de darse de alta.',
    },
    {
      q: '¿Cuánto cuesta vender con tienda propia en lugar de un marketplace?',
      a: 'Con tienda propia pagás un abono fijo más una comisión chica por transacción, más la pasarela de pago. En el plan Esencial de Tienda Nube eso da alrededor de 7% de cada venta sumando el 1% de la plataforma y el 6,04% efectivo de Mercado Pago Checkout con acreditación inmediata. El abono es fijo, así que cuanto menos vendés, más pesa por venta.',
    },
    {
      q: '¿Por qué en Etsy me queda tan poco en las piezas baratas?',
      a: 'Porque además de los porcentajes hay cargos fijos: US$ 0,20 de publicación y US$ 0,25 por operación de cobro. En una pieza de US$ 10 esos US$ 0,45 son casi 5 puntos de comisión adicional; en una de US$ 100 son medio punto. Los cargos fijos castigan al ticket bajo.',
    },
    {
      q: '¿La comisión de Airbnb es realmente sólo el 3%?',
      a: 'La comisión al anfitrión sí, en el esquema de tarifa dividida. Pero el 3% es la parte chica del problema: la limpieza por check-in, las expensas, los servicios y los impuestos del alquiler se llevan mucho más. Mirar sólo el 3% es el error clásico del anfitrión nuevo.',
    },
    {
      q: 'Al repartidor de delivery, ¿le descuentan comisión?',
      a: 'No. Al repartidor le pagan por pedido entregado más propinas, sin porcentaje retenido: la comisión se la cobran al comercio. Lo que se come el ingreso del rider son los costos propios, sobre todo combustible y desgaste del vehículo, y los aportes si está registrado como monotributista.',
    },
    {
      q: 'Si cobro a comisión, ¿el IVA se calcula sobre el monto de la operación o sobre mi comisión?',
      a: 'Sobre tu comisión, que es el servicio que prestás. Si sos responsable inscripto facturás tu comisión más el 21% de IVA. Ese IVA lo cobrás pero no es tuyo: lo ingresás a ARCA. Distinto es si la comisión se pactó sobre el monto con IVA o sobre el neto de la operación, y eso conviene dejarlo por escrito.',
    },
    {
      q: '¿Qué margen bruto necesito para que el delivery no me haga perder plata?',
      a: 'Tu margen bruto de cocina tiene que ser mayor que la comisión de la plataforma, y por un buen margen. Con una comisión del 25% y un margen bruto del 30%, te quedan 5 puntos por pedido antes de contar publicidad, packaging y el tiempo de tu equipo: en la práctica, es trabajar gratis.',
    },
    {
      q: '¿Cada cuánto cambian estas comisiones?',
      a: 'Seguido, y sin aviso masivo. Las tarifas de este hub están relevadas en julio de 2026 y sirven como punto de partida. Antes de tomar una decisión de precio, confirmá tu porcentaje real en el panel de la plataforma o en tu contrato y cargalo a mano en el campo de comisión.',
    },
  ],

  sources: [
    {
      name: 'Planes y precios de Tiendanube — abonos y costo por transacción',
      url: 'https://www.tiendanube.com/planes-y-precios',
      publisher: 'Tiendanube',
      date: 'julio de 2026',
    },
    {
      name: 'Costos de Mercado Pago Checkout Pro — comisiones por acreditación',
      url: 'https://www.mercadopago.com.ar/costs-section/release-options',
      publisher: 'Mercado Pago',
      date: 'julio de 2026',
    },
    {
      name: 'Fees & payments policy — transaction, listing y payment processing fees',
      url: 'https://www.etsy.com/legal/fees',
      publisher: 'Etsy',
    },
    {
      name: 'Selling on Amazon fee schedule — referral y FBA fulfillment fees',
      url: 'https://sell.amazon.com/pricing',
      publisher: 'Amazon Services',
    },
    {
      name: 'Comisiones de servicio para anfitriones',
      url: 'https://www.airbnb.com.ar/help/article/1857',
      publisher: 'Airbnb',
    },
    {
      name: 'Régimen de plataformas tecnológicas — retenciones de IVA e ISR',
      url: 'https://www.sat.gob.mx/consultas/74844/plataformas-tecnologicas',
      publisher: 'Servicio de Administración Tributaria (México)',
    },
    {
      name: 'Boleta de honorarios electrónica — tasa de retención vigente',
      url: 'https://www.sii.cl/preguntas_frecuentes/boleta_honorarios/',
      publisher: 'Servicio de Impuestos Internos (Chile)',
    },
    {
      name: 'Monotributo — categorías y aportes vigentes',
      url: 'https://www.arca.gob.ar/monotributo/categorias.asp',
      publisher: 'ARCA (ex AFIP)',
    },
  ],

  replaces: [
    '/calculadora-comision-doordash-rappi-pedidosya-restaurante-2026',
    '/calculadora-comision-uber-driver-ganancia-real-argentina-2026',
    '/calculadora-uber-driver-chile-ganancia-neta',
    '/calculadora-ingreso-uber-airbnb-host',
    '/calculadora-comision-venta-vendedor',
    '/calculadora-costo-envio-peso-destino',
    '/calculadora-uber-driver-mexico-costos-reales',
    '/calculadora-comision-tienda-nube-2026-monto-mensual-checkout',
    '/calculadora-costo-envio-paquete-ecommerce',
    '/calculadora-comision-uber-eats-glovo-rider',
    '/calculadora-comision-amazon-fba-producto',
    '/calculadora-comision-etsy-venta-handmade',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
