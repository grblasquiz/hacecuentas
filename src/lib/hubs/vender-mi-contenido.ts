import type { HubData } from './types';
import dolar from '../../data/live/dolar.json';

/**
 * Hub de decisión — "¿Cuánto deja vender mi propia obra?"
 *
 * Arquetipo RAMIFICADO: cuatro caminos que comparten la MISMA pregunta —
 * cuánto queda del precio unitario después del corte de la plataforma— aplicada
 * a cuatro formatos: streams de música, ebooks, audiolibros y suscripciones.
 *
 * Absorbe 6 calculadoras sueltas (ver `replaces`). Las fórmulas espejadas son
 * las reales del repo:
 *   src/lib/formulas/spotify-royalties-streams.ts
 *   src/lib/formulas/apple-music-royalties-pagos.ts
 *   src/lib/formulas/kindle-kdp-ingreso-ebook.ts
 *   src/lib/formulas/audible-ingreso-audiolibro.ts
 *   src/lib/formulas/newsletter-ingreso-suscriptores-pago.ts
 *   src/lib/formulas/substack-suscriptores-meta.ts
 *
 * ── Criterio de UNIDADES (crítico) ─────────────────────────────────────────
 * TODO el negocio de regalías se liquida en DÓLARES. El runtime formatea en
 * pesos por defecto y hace `Object.assign`, así que una fila sin `format`
 * propio se imprimiría con "$" y se leería como pesos: números absurdos.
 * Por eso TODAS las filas de plata declaran `format: 'unit'` + `unit: 'USD'`,
 * y las cantidades (streams, copias, suscriptores) usan `format: 'plain'`.
 * La única fila en pesos argentinos es la equivalencia informativa al dólar
 * oficial de `src/data/live/dolar.json`, que sí va en `format: 'ars'`.
 */

/** Dólar oficial (venta) del feed vivo, para la equivalencia en pesos. */
export const USD_ARS: number = (dolar as any).quotes?.oficial?.venta ?? 0;

/**
 * Revenue per stream por tier de mercado, en USD.
 * Espejo EXACTO de las tablas `rates` de spotify-royalties-streams.ts y
 * apple-music-royalties-pagos.ts. Los tiers no cubren los mismos países en
 * ambos servicios (Spotify agrupa Alemania en el 1; Apple, Canadá), pero el
 * escalón de rate es equivalente y se unifican en un solo selector.
 */
export const RATES_STREAM: Record<string, Record<string, number>> = {
  spotify: { t1: 0.0045, t2: 0.0035, t3: 0.0022, t4: 0.001 },
  apple: { t1: 0.0085, t2: 0.0065, t3: 0.004, t4: 0.0018 },
};

/** Rate de fallback de cada fórmula original cuando el tier no matchea. */
export const RATE_FALLBACK: Record<string, number> = { spotify: 0.003, apple: 0.006 };

/**
 * Kindle Direct Publishing. Espejo de kindle-kdp-ingreso-ebook.ts:
 * el tier del 70% sólo aplica dentro de la banda de precio, y encima
 * descuenta el delivery fee por megabyte del archivo.
 */
export const KDP = {
  royaltyAlta: 0.7,
  royaltyBaja: 0.35,
  precioMin70: 2.99,
  precioMax70: 9.99,
  /** USD por MB de archivo, descontados antes de aplicar el 70%. */
  deliveryPorMB: 0.15,
};

/** Audible / ACX. Espejo de audible-ingreso-audiolibro.ts. */
export const AUDIBLE = {
  royaltyExclusivo: 0.4,
  royaltyNoExclusivo: 0.25,
  /** Reparto 50/50 con el narrador bajo royalty share. */
  parteNarrador: 0.5,
};

/**
 * Revenue-share de plataforma de suscripción, en %.
 * Espejo de PLATAFORMA_FEE en newsletter-ingreso-suscriptores-pago.ts.
 * Ghost y Beehiiv no cobran % sobre el revenue: cobran abono fijo por la
 * herramienta, que esta cuenta no incluye.
 */
export const FEE_PLATAFORMA: Record<string, number> = {
  substack: 10,
  beehiiv: 0,
  ghost: 0,
  patreon: 8,
};

/**
 * Procesador de pago. Espejo de substack-suscriptores-meta.ts, que usa
 * el 2,9% + 0,30 fijo de Stripe. La fórmula de newsletter usa un % único
 * configurable (default 3%): acá se conserva el % editable y el fijo se
 * suma aparte, prorrateado por transacción.
 */
export const STRIPE = { pctDefault: 2.9, fijoPorCobro: 0.3 };

/**
 * Descuento típico del plan anual de Substack expresado como factor sobre el
 * precio mensual (16% off). Espejo del `pm * 0.84` de substack-suscriptores-meta.ts.
 */
export const FACTOR_ANUAL = 0.84;

export const MESES = 12;

export const hub: HubData = {
  slug: 'negocios/vender-mi-contenido',
  title: '¿Cuánto deja vender mi propia obra? Regalías de streams, ebooks, audiolibros y suscripciones',
  description:
    'Cuánto te queda por stream en Spotify o Apple Music, por ebook vendido en Kindle KDP, por audiolibro en Audible y por suscriptor pago en Substack o Beehiiv, después del corte de la plataforma. En dólares, con equivalencia en pesos.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Regalías y suscripciones',
  h1: '¿Cuánto deja vender mi propia obra?',
  lede:
    'Publicás música, un libro, un audiolibro o una newsletter paga y el número que ves no es el que cobrás: entre la plataforma, el distribuidor y el procesador de pago se va una parte fija de cada unidad vendida. Poné tu precio y tu volumen y mirá qué queda de cada peaje, en dólares y en pesos.',
  stamps: ['Actualizado 27-07-2026', 'Cifras en dólares', '6 calculadoras adentro'],

  resultLabel: 'Lo que te queda, neto',

  cases: {
    title: '¿Qué estás vendiendo?',
    intro:
      'Las cuatro ramas responden lo mismo con distinto peaje: qué queda del precio unitario después del corte. Si vendés otra cosa, cambiala.',
    items: [
      {
        id: 'streaming',
        label: 'Música en streaming',
        hint: 'Spotify y Apple Music',
        answer:
          'En streaming no cobrás un precio: cobrás una fracción de centavo por reproducción, y esa fracción depende del país del oyente.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Pago por reproducción según el tier de mercado del oyente: entre 0,0010 y 0,0085 dólares',
          'Ingreso bruto = streams por el pago por stream',
          'Comisión del distribuidor (DistroKid, CD Baby, TuneCore) descontada como porcentaje del bruto',
          'Cuántos streams hacen falta para juntar un dólar neto, y cuántos para llegar a tu meta mensual',
          'Apple Music paga casi el doble por stream que Spotify en el mismo mercado',
        ],
        warn: [
          'El pago por stream no es una tarifa fija: es tu porción del pozo de regalías del mes, así que cambia según cuánta gente escuchó y cuánto facturó la plataforma',
          'Un stream cuenta recién a los 30 segundos de reproducción',
          'Este número es la regalía de grabación: si además sos autor de la canción, los derechos de composición se cobran aparte y por otra vía',
          'Si el tema tiene varios artistas o un sello, tu parte se reparte otra vez sobre este neto',
          'Los mercados de LATAM pagan menos de la mitad que EE.UU. o Reino Unido: el mismo tema con el mismo volumen deja muy distinto según de dónde te escuchan',
        ],
        plazo: 'las plataformas liquidan a los distribuidores con dos o tres meses de retraso sobre el mes de reproducción.',
      },
      {
        id: 'libro',
        label: 'Un ebook en Kindle',
        hint: 'KDP: 35% contra 70%',
        answer:
          'En Kindle el precio de tapa define tu regalía: fuera de la banda de 2,99 a 9,99 dólares cobrás la mitad por copia.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Tramo de regalía del 70% cuando el precio de lista cae entre 2,99 y 9,99 dólares',
          'Tramo del 35% para cualquier precio fuera de esa banda, sin descuento de entrega',
          'Delivery fee de 0,15 dólares por megabyte del archivo, descontado del precio antes de aplicar el 70%',
          'Regalía por copia, ingreso mensual y anual según tus ventas',
          'Cuánto se queda Amazon de cada copia vendida',
        ],
        warn: [
          'Poner el libro a 12 dólares en vez de 9,99 puede dejarte menos plata por copia: pasás del 70% al 35% y perdés casi la mitad de la regalía unitaria',
          'El delivery fee castiga los libros pesados: un archivo de 5 MB con muchas imágenes se come 0,75 dólares de cada venta',
          'El tramo del 70% exige además cumplir condiciones de territorio y de paridad de precio con otras tiendas',
          'Las lecturas en Kindle Unlimited no se pagan por copia sino por página leída, con un fondo variable: no entran en esta cuenta',
          'El precio de lista de Amazon puede incluir o excluir impuestos según el país del comprador, y eso mueve la base de la regalía',
        ],
        plazo: 'KDP paga alrededor de 60 días después del cierre del mes en que se vendió la copia.',
      },
      {
        id: 'audiolibro',
        label: 'Un audiolibro',
        hint: 'Audible: exclusividad y narrador',
        answer:
          'En audiolibros la decisión es doble: exclusividad, que duplica tu porcentaje, y quién paga la narración.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Regalía del 40% del precio si publicás en exclusiva, contra 25% si distribuís en varias tiendas',
          'Reparto 50 y 50 con el narrador cuando la producción se hace bajo royalty share en vez de pagarle un cachet',
          'Regalía por venta, ingreso mensual y anual, y neto del autor después del reparto',
          'Cuánto tendrías que vender para cubrir lo que costaría pagar la narración por adelantado',
        ],
        warn: [
          'La exclusividad duplica el porcentaje pero te deja afuera de todas las otras tiendas: conviene sólo si esa tienda concentra tu público',
          'El royalty share con el narrador no tiene fecha de fin: cede la mitad de los ingresos por toda la vida del título',
          'El precio del audiolibro lo fija la tienda según la duración, no vos: cambiarlo no es una palanca real',
          'Las escuchas por crédito de suscripción se liquidan sobre un precio de referencia, que suele ser menor al precio de lista',
          'Producir un audiolibro cuesta plata antes de vender una sola copia: si pagás la narración por hora terminada, ese costo va antes de esta cuenta',
        ],
        plazo: 'la liquidación de audiolibros también se cobra con cerca de dos meses de demora sobre el mes de venta.',
      },
      {
        id: 'audiencia',
        label: 'Suscriptores pagos',
        hint: 'Newsletter, Substack, Patreon',
        answer:
          'Acá el peaje es doble: el revenue-share de la plataforma más la comisión del procesador de pago, y ninguna se toca con volumen.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Revenue-share de la plataforma: Substack 10%, Patreon 8%, Ghost y Beehiiv 0%',
          'Comisión del procesador de pago sobre cada cobro, más el cargo fijo por transacción',
          'Ingreso bruto, neto mensual y neto anual, y qué porcentaje del bruto te queda',
          'Cuántos suscriptores pagos necesitás para llegar a tu meta mensual neta',
          'Efecto de la mezcla de planes anuales, que se venden con descuento pero pagan una sola comisión fija al año',
        ],
        warn: [
          'Ghost y Beehiiv no se quedan un porcentaje, pero cobran un abono mensual fijo por la herramienta que esta cuenta no incluye: conviene recién a partir de cierto volumen',
          'El cargo fijo por transacción pega durísimo en suscripciones baratas: sobre un plan de 3 dólares mensuales puede ser más caro que el revenue-share',
          'El plan anual se cobra con descuento pero paga comisión fija una sola vez al año y baja la fuga mensual: casi siempre deja más neto',
          'La baja de suscriptores no es pareja: los primeros meses después de una campaña son los de mayor cancelación',
          'Cobrar desde Argentina agrega el paso de traer la plata al país, con su propio costo de conversión y su tratamiento impositivo',
        ],
        plazo: 'las plataformas suelen retener los primeros cobros de una cuenta nueva entre 7 y 14 días antes de liberarlos.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada rama usa los campos que le sirven; los demás podés dejarlos como están. Todos los importes van en dólares, que es la moneda en la que liquidan estas plataformas.',
  fields: [
    {
      id: 'servicio',
      label: 'Servicio de streaming',
      type: 'select',
      value: 'spotify',
      options: [
        { value: 'spotify', label: 'Spotify' },
        { value: 'apple', label: 'Apple Music' },
      ],
      help: 'Apple Music paga casi el doble por reproducción que Spotify en el mismo mercado.',
    },
    {
      id: 'tier',
      label: 'De dónde te escuchan',
      type: 'select',
      value: 't3',
      options: [
        { value: 't1', label: 'Tier 1 — EE.UU., Canadá, Reino Unido, Alemania' },
        { value: 't2', label: 'Tier 2 — Europa occidental (España, Italia, Francia)' },
        { value: 't3', label: 'Tier 3 — LATAM y Brasil' },
        { value: 't4', label: 'Tier 4 — India y Asia emergente' },
      ],
      help: 'Es el mercado que concentra tus oyentes. Si están repartidos, elegí el que más pese.',
    },
    {
      id: 'streams_mes',
      label: 'Streams por mes',
      type: 'number',
      min: 0,
      max: 1000000000,
      step: 1000,
      value: 50000,
      thousands: true,
      help: 'Suma de todas las plataformas o sólo la que elegiste arriba: la cuenta se hace sobre lo que cargues.',
    },
    {
      id: 'comision_dist',
      label: 'Comisión de tu distribuidor',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 15,
      help: 'DistroKid, TuneCore y Amuse cobran abono anual y 0% de comisión; CD Baby ronda el 9%; un sello chico puede llevarse mucho más.',
    },
    {
      id: 'precio_ebook',
      label: 'Precio de lista del ebook',
      type: 'number',
      prefix: 'US$',
      min: 0,
      max: 1000,
      step: 0.5,
      value: 4.99,
      help: 'Entre 2,99 y 9,99 entrás al tramo del 70%. Un centavo afuera y cobrás la mitad por copia.',
    },
    {
      id: 'peso_archivo',
      label: 'Tamaño del archivo del ebook',
      type: 'number',
      suffix: 'MB',
      min: 0,
      max: 650,
      step: 0.1,
      value: 2,
      help: 'Está en el panel de KDP. Cada megabyte descuenta 0,15 dólares de la base del 70%.',
    },
    {
      id: 'ventas_ebook',
      label: 'Copias del ebook que vendés por mes',
      type: 'number',
      min: 0,
      max: 10000000,
      step: 10,
      value: 100,
      thousands: true,
    },
    {
      id: 'precio_audiolibro',
      label: 'Precio del audiolibro',
      type: 'number',
      prefix: 'US$',
      min: 0,
      max: 1000,
      step: 1,
      value: 20,
      help: 'Lo fija la tienda según la duración del audio.',
    },
    {
      id: 'ventas_audiolibro',
      label: 'Audiolibros que vendés por mes',
      type: 'number',
      min: 0,
      max: 10000000,
      step: 5,
      value: 40,
      thousands: true,
    },
    {
      id: 'exclusividad',
      label: 'Distribución del audiolibro',
      type: 'select',
      value: 'exclusivo',
      options: [
        { value: 'exclusivo', label: 'Exclusivo en una sola tienda (40%)' },
        { value: 'no-exclusivo', label: 'Distribución amplia (25%)' },
      ],
    },
    {
      id: 'narrador',
      label: '¿Compartís regalías con el narrador?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No: le pagué la narración por adelantado' },
        { value: 'si', label: 'Sí: royalty share 50 y 50' },
      ],
    },
    {
      id: 'plataforma_subs',
      label: 'Plataforma de suscripción',
      type: 'select',
      value: 'substack',
      options: [
        { value: 'substack', label: 'Substack (10% del revenue)' },
        { value: 'patreon', label: 'Patreon (8% del revenue)' },
        { value: 'beehiiv', label: 'Beehiiv (0%, abono fijo aparte)' },
        { value: 'ghost', label: 'Ghost (0%, abono fijo aparte)' },
      ],
    },
    {
      id: 'suscriptores',
      label: 'Suscriptores pagos',
      type: 'number',
      min: 0,
      max: 10000000,
      step: 10,
      value: 200,
      thousands: true,
    },
    {
      id: 'precio_suscripcion',
      label: 'Precio mensual de la suscripción',
      type: 'number',
      prefix: 'US$',
      min: 0,
      max: 10000,
      step: 1,
      value: 8,
      help: 'El mínimo habitual de Substack son 5 dólares por mes.',
    },
    {
      id: 'pct_anual',
      label: 'Suscriptores que pagan plan anual',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 5,
      value: 30,
      help: 'El plan anual se vende con cerca de 16% de descuento, pero paga el cargo fijo del procesador una sola vez al año.',
    },
    {
      id: 'procesador_pct',
      label: 'Comisión del procesador de pago',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 20,
      step: 0.1,
      value: 2.9,
      help: 'Stripe cobra alrededor de 2,9% más un cargo fijo de 0,30 por cobro.',
    },
    {
      id: 'meta_mensual',
      label: 'Meta de ingreso neto por mes',
      type: 'number',
      prefix: 'US$',
      min: 0,
      max: 10000000,
      step: 100,
      value: 1000,
      thousands: true,
      help: 'Se usa para calcular cuántos streams, copias o suscriptores hacen falta para llegar.',
    },
  ],
  fineprint:
    'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad. Los pagos por stream son promedios de mercado y varían mes a mes según el pozo de regalías; los porcentajes de las plataformas y las comisiones del procesador cambian sin aviso. Verificá las condiciones vigentes de tu contrato antes de proyectar ingresos. Los importes van en dólares; la equivalencia en pesos usa el dólar oficial del día y es informativa.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparte lo que factura tu obra',
    caption:
      'El gráfico parte el bruto que genera tu obra en lo que te queda a vos y en cada peaje que se lo lleva: la plataforma, el distribuidor, el procesador de pago o el narrador, según la rama.',
  },
  breakdownTitle: 'Cuenta unidad por unidad',
  breakdownIntro:
    'Los importes van en dólares porque es la moneda en la que liquidan estas plataformas. Las cantidades (streams, copias, suscriptores) van sin unidad, y al final hay una fila con la equivalencia en pesos al dólar oficial.',

  faq: [
    {
      q: '¿Cuánto paga Spotify por stream?',
      a: 'No hay una tarifa oficial: Spotify reparte un pozo de regalías entre todos los artistas según la porción de reproducciones de cada uno, así que el valor cambia mes a mes. Los promedios de mercado que usa esta calculadora van de 0,0045 dólares por reproducción en mercados como Estados Unidos, Reino Unido o Alemania, a 0,0022 en América Latina y 0,0010 en India y el sudeste asiático. Esos números son brutos: todavía falta descontar la comisión del distribuidor.',
    },
    {
      q: '¿Apple Music paga más que Spotify?',
      a: 'Sí, y por bastante: los promedios de mercado ubican a Apple Music entre 0,0085 dólares por stream en los mercados más caros y 0,0018 en los emergentes, cerca del doble de Spotify en el mismo tier. La contra es el volumen: Spotify tiene mucha más base de usuarios, así que el mismo tema suele generar más reproducciones ahí. Lo que decide tu ingreso total es el cruce de rate por volumen, no el rate solo.',
    },
    {
      q: '¿Cuántos streams necesito para vivir de la música?',
      a: 'Depende casi por completo de dónde te escuchan. Para juntar 1.000 dólares netos por mes con oyentes de LATAM en Spotify, y con un distribuidor que se lleva 15%, hacen falta más de medio millón de reproducciones mensuales. Con oyentes de Estados Unidos, el mismo objetivo baja a menos de 300.000. Y en Apple Music, a menos de la mitad de eso. Por eso la palanca real no es publicar más temas sino mover la geografía y la plataforma de tu audiencia.',
    },
    {
      q: '¿Conviene el 35% o el 70% en Kindle KDP?',
      a: 'El 70% aplica solamente si el precio de lista queda entre 2,99 y 9,99 dólares, y encima descuenta un delivery fee de 0,15 dólares por megabyte del archivo. Fuera de esa banda cobrás 35% sin descuento de entrega. La consecuencia práctica es que un libro a 12 dólares deja menos regalía por copia que el mismo libro a 9,99: al pasar de tramo perdés la mitad del porcentaje y no lo compensás con los tres dólares extra de precio.',
    },
    {
      q: '¿Qué es el delivery fee de Amazon y cuánto me cuesta?',
      a: 'Es un cargo por transferir el archivo al dispositivo del lector, y se cobra sólo en el tramo del 70%: 0,15 dólares por cada megabyte del archivo terminado, descontados del precio antes de aplicar el porcentaje. Un texto sin imágenes pesa uno o dos megabytes y el cargo es marginal. Un libro con muchas ilustraciones o fotos puede llegar a cinco o diez megabytes y ahí sí se come una parte visible de cada venta, sobre todo si el precio es bajo.',
    },
    {
      q: '¿Cuánto se queda Audible de cada audiolibro?',
      a: 'La regalía del autor es del 40% del precio si publicás en exclusiva en esa tienda, y del 25% si además distribuís en otras plataformas. Si además produjiste el audiolibro bajo royalty share, el narrador se lleva la mitad de esa regalía por toda la vida del título, así que en los hechos te quedás con 20% o con 12,5%. Antes de firmar exclusividad conviene mirar si esa tienda concentra de verdad a tu público.',
    },
    {
      q: '¿Conviene pagarle al narrador por adelantado o compartir regalías?',
      a: 'Pagarle por hora terminada es un costo fijo y alto antes de vender una sola copia, pero se termina; el royalty share no cuesta nada al inicio y se lleva la mitad de los ingresos para siempre. La cuenta se resuelve con el punto de cruce: dividí el cachet de la narración por la mitad de tu regalía por venta y te da cuántas copias hacen falta para que compartir salga más caro que pagar. Si esperás vender más que eso, conviene pagar.',
    },
    {
      q: '¿Cuánto se queda Substack de mi newsletter?',
      a: 'Substack se lleva 10% del revenue, y encima de eso el procesador de pago cobra alrededor de 2,9% más un cargo fijo de 0,30 dólares por cobro. Sobre una suscripción de 8 dólares mensuales, entre las tres cosas se va cerca del 17% del bruto. Patreon cobra 8% en su plan básico. Ghost y Beehiiv no se quedan un porcentaje del revenue, pero cobran un abono mensual fijo por la herramienta, que conviene recién a partir de cierto volumen de suscriptores.',
    },
    {
      q: '¿Cuántos suscriptores pagos necesito para una meta de ingreso?',
      a: 'Dividí tu meta neta mensual por lo que te queda de cada suscriptor después de todos los descuentos, no por el precio de tapa. Con una suscripción de 8 dólares en Substack, y con tres de cada diez suscriptores en plan anual, quedan cerca de 6,40 netos por suscriptor mensual, así que una meta de 1.000 dólares netos por mes pide alrededor de 156 suscriptores pagos, no 125. Y si tu precio es bajo, el cargo fijo por transacción empeora bastante esa relación.',
    },
    {
      q: '¿Conviene ofrecer plan anual con descuento?',
      a: 'Casi siempre sí. El plan anual se vende con cerca de 16% de descuento sobre doce meses, pero paga el cargo fijo del procesador una sola vez al año en lugar de doce, y sobre todo elimina once oportunidades de que el suscriptor se dé de baja. En suscripciones de precio bajo el ahorro en cargos fijos por sí solo puede compensar buena parte del descuento; en las de precio alto, lo que compensa es la retención.',
    },
    {
      q: '¿Estos ingresos pagan impuestos en Argentina?',
      a: 'Sí: son ingresos de fuente extranjera y hay que declararlos. Si cobrás como monotributista o responsable inscripto por exportación de servicios, el tratamiento y las alícuotas cambian según tu categoría y tu jurisdicción, y también influye por qué vía traés la plata al país. Esta calculadora estima el bruto y el neto de plataforma, antes de cualquier impuesto argentino: la liquidación final conviene armarla con un contador.',
    },
    {
      q: '¿Por qué los números están en dólares y no en pesos?',
      a: 'Porque todas estas plataformas liquidan en dólares o en euros: tu regalía se define en esa moneda y recién después se convierte. Mostrarlo en pesos escondería que el rate por stream y los porcentajes de la plataforma no cambian con la inflación local. La calculadora agrega una fila con la equivalencia al dólar oficial del día para que tengas la referencia, pero la decisión de precio y de plataforma se toma sobre el número en dólares.',
    },
  ],

  sources: [
    {
      name: 'Amazon KDP — Opciones de regalías del 35% y del 70% y costos de entrega',
      url: 'https://kdp.amazon.com/es_ES/help/topic/G200634500',
      publisher: 'Amazon Kindle Direct Publishing',
    },
    {
      name: 'ACX — Royalty rates para audiolibros exclusivos y no exclusivos',
      url: 'https://help.acx.com/s/article/what-are-the-royalty-rates',
      publisher: 'Audiobook Creation Exchange (Audible)',
    },
    {
      name: 'Spotify Loud & Clear — Cómo se calculan y se reparten las regalías',
      url: 'https://loudandclear.byspotify.com/',
      publisher: 'Spotify',
    },
    {
      name: 'Apple Music for Artists — Pagos y regalías por reproducción',
      url: 'https://artists.apple.com/support',
      publisher: 'Apple',
    },
    {
      name: 'Substack — Cuánto cuesta publicar: 10% más comisiones del procesador',
      url: 'https://substack.com/pricing',
      publisher: 'Substack',
    },
    {
      name: 'Stripe — Precios y comisiones por transacción',
      url: 'https://stripe.com/pricing',
      publisher: 'Stripe',
    },
    {
      name: 'Patreon — Planes y porcentaje que retiene la plataforma',
      url: 'https://www.patreon.com/pricing',
      publisher: 'Patreon',
    },
    {
      name: 'Cotización del dólar oficial',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
    },
  ],

  replaces: [
    '/calculadora-spotify-royalties-streams',
    '/calculadora-apple-music-royalties-pagos',
    '/calculadora-kindle-kdp-ingreso-ebook',
    '/calculadora-audible-ingreso-audiolibro',
    '/calculadora-newsletter-ingreso-suscriptores-pago',
    '/calculadora-substack-suscriptores-meta',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
