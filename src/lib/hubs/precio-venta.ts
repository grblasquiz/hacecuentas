import type { HubData } from './types';

/**
 * Hub de decisión — "¿A cuánto vendo mi producto?"
 *
 * El nudo del hub es que margen y markup NO son lo mismo y la gente los
 * confunde permanentemente: un markup del 50% sobre el costo es un margen del
 * 33% sobre la venta. Las dos ramas de precio usan la misma entrada ("porcentaje
 * objetivo") con dos fórmulas distintas justamente para que la diferencia se vea
 * en pantalla y no haya que explicarla.
 *
 * Espejo de las fórmulas originales:
 *  - src/lib/formulas/margen-ganancia.ts            (margen sobre venta vs sobre costo)
 *  - src/lib/formulas/precio-minimo-venta.ts        (precio = costo / (1 − margen))
 *  - src/lib/formulas/precio-venta-producto-markup.ts (precio = costo × (1 + markup))
 *  - src/lib/formulas/margen-contribucion.ts        (precio − costo variable)
 *  - src/lib/formulas/break-even.ts                 (fijos / margen de contribución)
 *  - src/lib/formulas/costos-fijos-variables.ts     (costo unitario completo)
 *  - src/lib/formulas/ticket-promedio.ts            (ventas / transacciones)
 *  - src/lib/formulas/gross-margin-vs-net.ts        (bruto vs neto)
 *  - src/lib/formulas/cafeteria-cuanto-cobrar-...ts (fijos prorrateados + IVA)
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'business'). */
const DISCLAIMER_BUSINESS =
  'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.';

/**
 * Modo de cálculo de cada rama.
 *  'margen'       el % objetivo es margen SOBRE LA VENTA → precio = costo / (1 − m)
 *  'markup'       el % objetivo es markup SOBRE EL COSTO → precio = costo × (1 + m)
 *  'contribucion' cuánto aporta cada unidad por encima de su costo variable
 *  'equilibrio'   no calcula precio: calcula cuántas unidades hay que vender
 *  'ticket'       mira la facturación por venta, no el precio de una unidad
 *
 * `prorratear` incluye los costos fijos en el costo unitario antes de marcar el
 * precio. Sin prorratear, el precio sólo cubre el costo variable y los fijos
 * salen de la contribución.
 */
export interface PrecioMath {
  modo: 'margen' | 'markup' | 'contribucion' | 'equilibrio' | 'ticket';
  prorratear: boolean;
}

export const PRECIO_MATH: Record<string, PrecioMath> = {
  margen: { modo: 'margen', prorratear: false },
  markup: { modo: 'markup', prorratear: false },
  'cubrir-todo': { modo: 'margen', prorratear: true },
  contribucion: { modo: 'contribucion', prorratear: false },
  equilibrio: { modo: 'equilibrio', prorratear: false },
  ticket: { modo: 'ticket', prorratear: false },
};

export const hub: HubData = {
  slug: 'negocios/precio-de-venta',
  title: '¿A cuánto vendo mi producto? — Calculadora de precio, margen y markup',
  description:
    'Calculá a cuánto vender: precio por margen o por markup (no son lo mismo), costo unitario con los fijos prorrateados, margen de contribución, punto de equilibrio y ticket promedio.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Guía y estimación para negocios',
  h1: 'Tenés un costo y una duda: ¿a cuánto lo vendo?',
  lede:
    'Partimos del caso más frecuente: querés un margen sobre la venta. Si preferís marcar el costo, prorratear los gastos fijos o saber cuántas unidades necesitás para no perder plata, cambiá el caso abajo.',
  stamps: ['Actualizado 27-07-2026', 'Margen y markup separados', '9 calculadoras adentro'],

  resultLabel: 'Precio sugerido',

  cases: {
    title: '¿Qué querés resolver?',
    intro:
      'Las dos primeras opciones parecen iguales y no lo son: mismo porcentaje, precios distintos. Probá las dos con los mismos números.',
    items: [
      {
        id: 'margen',
        label: 'Quiero dejar un margen sobre la venta',
        hint: 'Margen · el número del balance',
        answer: 'Con margen, el precio es el costo dividido por uno menos el margen.',
        yes: [
          'El porcentaje objetivo se mide sobre el precio de venta: precio = costo ÷ (1 − margen)',
          'Es el número que va al balance y el que usan contadores, bancos e inversores',
          'Nunca puede llegar al 100%: al 100% de margen el precio sería infinito',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'Si pedís 40% de margen no alcanza con sumarle 40% al costo: eso da 29% de margen. El precio correcto es costo ÷ 0,60',
        ],
        plazo: 'un margen del 40% sobre la venta equivale a marcar el costo un 67%.',
      },
      {
        id: 'markup',
        label: 'Quiero marcar el costo un porcentaje',
        hint: 'Markup · el número del mostrador',
        answer: 'Con markup, el precio es el costo multiplicado por uno más el markup.',
        yes: [
          'El porcentaje objetivo se mide sobre el costo: precio = costo × (1 + markup)',
          'Es la forma en que se piensa el precio en el mostrador y en la mayoría de los rubros',
          'Puede superar el 100% sin problema: marcar 3 veces el costo es un markup del 200%',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'Un markup del 50% NO es un margen del 50%: es un margen del 33%. Al comparar con la competencia o con un rubro, asegurate de estar hablando de la misma medida',
        ],
        plazo: 'markup 50% = margen 33% · markup 100% = margen 50% · markup 200% = margen 67%.',
      },
      {
        id: 'cubrir-todo',
        label: 'Quiero que el precio cubra también el alquiler y los sueldos',
        hint: 'Costo unitario completo',
        answer: 'Los costos fijos se reparten entre las unidades que vendés.',
        yes: [
          'Al costo variable de cada unidad se le suma la parte proporcional de los costos fijos del mes',
          'El costo fijo unitario es costos fijos ÷ unidades vendidas por mes',
          'Con este método el margen que pedís queda limpio: es ganancia real, no plata para pagar el alquiler',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'El costo fijo unitario depende de un volumen que todavía no vendiste: si vendés menos unidades de las que estimaste, el precio deja de cubrir la estructura',
        ],
        plazo: 'recalculá el prorrateo cada vez que cambie el alquiler, los sueldos o el volumen.',
      },
      {
        id: 'contribucion',
        label: 'Quiero saber cuánto aporta cada venta',
        hint: 'Margen de contribución',
        answer: 'La contribución es lo que deja cada unidad para pagar los fijos.',
        yes: [
          'Margen de contribución unitario = precio − costo variable de esa unidad',
          'No es ganancia: es lo que queda para cubrir los costos fijos y recién después ganar',
          'Debajo del 20% del precio el negocio depende de un volumen muy alto para cerrar',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'Una contribución positiva no significa que el negocio gane plata: si la suma de todas las contribuciones no llega a los costos fijos, el mes cierra en rojo',
        ],
        plazo: 'contribución bajo 20% del precio es margen fino; sobre 40% hay aire para descuentos.',
      },
      {
        id: 'equilibrio',
        label: 'Ya tengo precio: cuántas unidades para no perder',
        hint: 'Punto de equilibrio',
        answer: 'El punto de equilibrio son los fijos divididos por la contribución unitaria.',
        yes: [
          'Unidades de equilibrio = costos fijos ÷ (precio − costo variable)',
          'A partir de esa unidad, cada venta adicional deja la contribución entera como ganancia',
          'Si el precio no supera al costo variable no hay punto de equilibrio: el negocio pierde más cuanto más vende',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'El punto de equilibrio no incluye tu sueldo salvo que lo cargues como costo fijo. Si trabajás gratis, "no perder" no es lo mismo que "ganar"',
        ],
        plazo: 'dividí las unidades de equilibrio por los días de venta y vas a tener la meta diaria.',
      },
      {
        id: 'ticket',
        label: 'Quiero subir lo que gasta cada cliente',
        hint: 'Ticket promedio',
        answer: 'El ticket promedio es la facturación dividida por la cantidad de ventas.',
        yes: [
          'Ticket promedio = facturación del período ÷ cantidad de operaciones',
          'Subirlo 10% con los mismos clientes suma la misma plata que conseguir 10% más de clientes, y es mucho más barato',
          'Combos, upsell y un piso de compra son las palancas típicas',
        ],
        warn: [
          DISCLAIMER_BUSINESS,
          'Subir el ticket a fuerza de precio puede bajar la cantidad de operaciones: medí las dos cosas juntas, no una sola',
        ],
        plazo: 'compará el ticket contra el mismo período del año anterior, no contra el mes pasado.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'El costo variable y el porcentaje objetivo alcanzan para las dos primeras ramas. Los demás campos entran cuando prorrateás fijos o buscás el punto de equilibrio.',
  fields: [
    {
      id: 'costo',
      label: 'Costo variable por unidad (insumos, materiales, packaging)',
      prefix: '$',
      value: '1.200',
      thousands: true,
      help: 'Todo lo que sólo gastás si vendés esa unidad. El alquiler no va acá.',
    },
    {
      id: 'objetivo',
      label: 'Porcentaje objetivo (margen o markup, según el caso)',
      type: 'number',
      min: 0,
      max: 900,
      step: 0.5,
      value: 40,
      suffix: '%',
      help: 'En la rama de margen se mide sobre la venta y tiene que ser menor a 100. En la de markup se mide sobre el costo y puede pasarlo.',
    },
    {
      id: 'fijos',
      label: 'Costos fijos del mes (alquiler, sueldos, servicios)',
      prefix: '$',
      value: '900.000',
      thousands: true,
    },
    {
      id: 'unidades',
      label: 'Unidades vendidas por mes (o cantidad de operaciones, para el ticket)',
      type: 'number',
      min: 1,
      value: 600,
    },
    {
      id: 'facturacion',
      label: 'Facturación del período, sólo para el ticket promedio',
      prefix: '$',
      value: '1.400.000',
      thousands: true,
      help: 'Sirve únicamente en la rama de ticket promedio: se divide por la cantidad de operaciones.',
    },
    {
      id: 'precio',
      label: 'Precio actual, si ya lo tenés (0 para que lo calcule)',
      prefix: '$',
      value: '0',
      thousands: true,
    },
    {
      id: 'iva',
      label: 'IVA a agregar al precio final',
      type: 'number',
      min: 0,
      max: 40,
      step: 0.5,
      value: 0,
      suffix: '%',
      help: 'Poné 21 si sos responsable inscripto y el precio de lista va con IVA. Dejalo en 0 si sos monotributista.',
    },
  ],
  fineprint: DISCLAIMER_BUSINESS,

  chart: {
    type: 'donut',
    title: 'Cómo se compone el precio',
    caption:
      'El anillo parte el precio final en insumos, la porción de costos fijos que le toca, tu ganancia y el IVA. En el punto de equilibrio muestra qué parte de la facturación son costos fijos y qué parte variables.',
  },
  breakdownTitle: 'De dónde sale cada peso del precio',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre margen y markup?',
      a: 'El markup se mide sobre el costo y el margen sobre el precio de venta. Si un producto te cuesta $100 y lo vendés a $150, ganás $50: eso es un markup del 50% sobre el costo pero un margen del 33% sobre la venta. Es el mismo dinero medido con dos denominadores distintos, y el margen siempre da el número más chico.',
    },
    {
      q: 'Si quiero un margen del 40%, ¿le sumo 40% al costo?',
      a: 'No, y es el error más común. Sumarle 40% al costo te deja un margen del 29%, no del 40%. Para un margen del 40% el precio es el costo dividido por 0,60, o sea marcar el costo un 67%. La fórmula es precio = costo ÷ (1 − margen).',
    },
    {
      q: '¿Qué markup necesito para llegar a cada margen?',
      a: 'Para 20% de margen, markup 25%. Para 30%, markup 43%. Para 40%, markup 67%. Para 50%, markup 100%. Para 60%, markup 150%. Para 67%, markup 200%. La cuenta general es markup = margen ÷ (1 − margen).',
    },
    {
      q: '¿Por qué el margen no puede llegar al 100%?',
      a: 'Porque el margen es la porción del precio que no es costo, y el costo nunca es cero. Con la fórmula precio = costo ÷ (1 − margen), al acercarse el margen a 100% el divisor tiende a cero y el precio se dispara al infinito. El markup, en cambio, no tiene techo: puede ser 200%, 500% o lo que aguante el mercado.',
    },
    {
      q: '¿Tengo que incluir el alquiler en el costo del producto?',
      a: 'Depende de qué pregunta estés respondiendo. Para el margen de contribución y el punto de equilibrio, no: ahí sólo entran los costos variables. Para fijar un precio de lista que sostenga el negocio, sí conviene prorratearlos, dividiendo los fijos del mes por las unidades que esperás vender. La rama de costo unitario completo hace exactamente eso.',
    },
    {
      q: '¿Qué es el margen de contribución y en qué se diferencia de la ganancia?',
      a: 'El margen de contribución es el precio menos el costo variable de esa unidad: lo que cada venta aporta para pagar los costos fijos. Recién cuando la suma de todas las contribuciones del mes supera los costos fijos empieza la ganancia. Una unidad puede tener contribución positiva y el negocio igual perder plata.',
    },
    {
      q: '¿Cómo calculo el punto de equilibrio?',
      a: 'Dividiendo los costos fijos del período por el margen de contribución unitario: unidades = fijos ÷ (precio − costo variable). Con $900.000 de fijos, un precio de $2.000 y un costo variable de $1.200, la contribución es $800 y hacen falta 1.125 unidades para no perder plata.',
    },
    {
      q: '¿Qué pasa si el precio es menor al costo variable?',
      a: 'No hay punto de equilibrio posible: cada venta aumenta la pérdida, así que vender más empeora la situación. Antes de pensar en volumen o en publicidad hay que subir el precio o bajar el costo variable.',
    },
    {
      q: '¿El margen bruto es lo mismo que el margen neto?',
      a: 'No. El margen bruto compara las ventas contra el costo de la mercadería vendida. Después de eso todavía faltan restar los gastos operativos, la depreciación, los intereses y los impuestos para llegar al margen neto. La diferencia entre los dos suele ser de decenas de puntos: un negocio con 50% de margen bruto puede terminar con 5% de neto.',
    },
    {
      q: '¿Cómo subo el ticket promedio?',
      a: 'Con combos que sumen productos complementarios, upsell hacia una versión más grande o mejor, y un piso de compra que empuje al cliente a agregar algo. Subir el ticket un 10% sobre la misma cantidad de operaciones suma tanto como conseguir un 10% más de clientes, y no cuesta publicidad.',
    },
    {
      q: '¿El IVA forma parte de mi margen?',
      a: 'No. El IVA lo cobrás pero lo ingresás al fisco, así que el margen se calcula siempre sobre el precio neto sin IVA. Si trabajás con precios finales al público, sacale el IVA antes de medir el margen o vas a creer que ganás más de lo que ganás.',
    },
    {
      q: '¿Cada cuánto tengo que revisar el precio?',
      a: 'Cada vez que se mueva el costo variable, el alquiler, los sueldos o el volumen de ventas. En contextos de inflación, un precio calculado hace tres meses ya está desactualizado aunque el porcentaje objetivo siga siendo el mismo: lo que cambió es la base sobre la que se aplica.',
    },
  ],

  sources: [
    {
      name: 'Gross margin y markup: definiciones y conversión',
      url: 'https://www.investopedia.com/ask/answers/102714/what-difference-between-gross-margin-and-markup.asp',
      publisher: 'Investopedia',
    },
    {
      name: 'Contribution margin y break-even analysis',
      url: 'https://corporatefinanceinstitute.com/resources/accounting/contribution-margin-overview/',
      publisher: 'Corporate Finance Institute',
    },
    {
      name: 'Break-even point: cómo calcularlo y para qué sirve',
      url: 'https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs',
      publisher: 'U.S. Small Business Administration',
    },
    {
      name: 'Alícuotas de IVA vigentes',
      url: 'https://www.arca.gob.ar/iva/alicuotas.asp',
      publisher: 'ARCA (ex AFIP)',
    },
  ],

  replaces: [
    '/calculadora-margen-ganancia-markup',
    '/calculadora-ticket-promedio-ventas',
    '/calculadora-punto-equilibrio-break-even',
    '/calculadora-cafeteria-cuanto-cobrar-pais-cafe-medialuna-margen',
    '/calculadora-precio-minimo-venta-con-margen',
    '/calculadora-precio-venta-producto-markup',
    '/calculadora-gross-margin-vs-net',
    '/calculadora-margen-contribucion-producto',
    '/calculadora-costos-fijos-y-variables',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
