import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto rinde y cuánto riesgo tiene lo que tengo?"
 * Absorbe 5 calculadoras sueltas: Sharpe ratio, efecto de la correlación en un
 * portafolio de dos activos, rendimiento y paridad de un bono argentino (dos
 * calculadoras que se solapaban) y price to book de una acción.
 */

/** Disclaimer YMYL inversión, textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

export const hub: HubData = {
  slug: 'inversiones/riesgo-de-mi-cartera',
  title: '¿Cuánto rinde y cuánto riesgo tiene mi cartera? — Sharpe, correlación, bonos y P/B',
  description:
    'Sharpe ratio de tu portafolio, cuánto baja el riesgo al combinar dos activos según su correlación, rendimiento y paridad de un bono argentino y price to book de una acción. Con la tasa libre de riesgo del BCRA cargada.',
  silo: 'Inversiones',
  siloHref: '/inversiones',

  eyebrow: 'Rendimiento ajustado por riesgo',
  h1: 'Mirás tu cartera: ¿cuánto rinde y cuánto riesgo estás tomando?',
  lede:
    'Partimos del caso más frecuente: querés saber si lo que rinde tu cartera compensa la volatilidad que aguantás. Ya podés ver el Sharpe ratio con la tasa libre de riesgo cargada, y ajustarlo con tus datos. Si tu pregunta es otra —diversificación, un bono o una acción—, la cambiás abajo.',
  stamps: ['Tasa libre de riesgo del BCRA', 'Ratios sin unidad monetaria', '4 calculadoras adentro'],

  resultLabel: 'Sharpe ratio',

  cases: {
    title: '¿Qué querés medir?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'sharpe',
        label: 'Mi cartera entera',
        hint: 'Retorno vs volatilidad',
        answer:
          'El Sharpe ratio dice cuánto exceso de retorno sobre la tasa libre de riesgo conseguís por cada punto de volatilidad que aguantás.',
        yes: [
          'Sharpe ratio del portafolio y en qué banda cae',
          'Exceso de retorno sobre la tasa libre de riesgo',
          'Cuánto rinde cada punto de volatilidad asumida',
          'Comparación contra lo que te habría dado la tasa libre de riesgo sin riesgo',
        ],
        warn: [
          DISCLAIMER,
          'El Sharpe castiga por igual la volatilidad hacia arriba y hacia abajo: un fondo con subas bruscas puede tener un Sharpe bajo sin que eso signifique más riesgo de pérdida',
          'Rendimiento y volatilidad tienen que estar en la misma unidad de tiempo y en la misma moneda que la tasa libre de riesgo, o el número no significa nada',
        ],
        plazo: 'para que el ratio sea comparable, medí siempre sobre la misma ventana de tiempo.',
      },
      {
        id: 'correlacion',
        label: '¿Estoy diversificado de verdad?',
        hint: 'Correlación entre dos activos',
        answer:
          'Repartir entre dos activos sólo baja el riesgo si no se mueven juntos: la correlación decide cuánto se cancelan.',
        yes: [
          'Riesgo del portafolio combinado según los pesos y la correlación',
          'Cuánto sería el riesgo si los dos activos se movieran igual',
          'Beneficio de diversificación en puntos y en porcentaje',
          'Rendimiento esperado de la combinación',
        ],
        warn: [
          DISCLAIMER,
          'La correlación no es estable: en las caídas fuertes tiende a subir hacia uno y justo entonces la diversificación deja de protegerte',
          'El cálculo usa la correlación histórica que vos cargues; medida sobre otra ventana de tiempo puede dar muy distinta',
        ],
        plazo: 'revisá los pesos cada tanto: el activo que más sube se agranda solo y te desarma la diversificación.',
      },
      {
        id: 'bono',
        label: 'Un bono argentino',
        hint: 'Rendimiento y paridad',
        answer:
          'El rendimiento de un bono sale de lo que pagás hoy contra los cupones y el capital que esperás cobrar hasta el vencimiento.',
        yes: [
          'Rendimiento anual estimado en dólares, simple y anualizado compuesto',
          'Rendimiento corriente: cuánto rinde el cupón sobre el precio de hoy',
          'Paridad: qué porcentaje del valor nominal estás pagando',
          'Cupones totales a cobrar y ganancia de capital al vencimiento',
        ],
        warn: [
          DISCLAIMER,
          'El rendimiento sólo se concreta si el emisor paga todo en tiempo y forma: una tasa de dos dígitos en dólares es riesgo de crédito ya descontado en el precio, no un regalo',
          'El cálculo simplifica los flujos a un cupón anual parejo y un pago único al final; los bonos amortizables devuelven capital antes y su rendimiento real difiere',
        ],
        plazo: 'cargá el cronograma real de pagos del bono desde el prospecto: cada serie tiene el suyo y va cambiando.',
      },
      {
        id: 'price-to-book',
        label: 'Una acción: ¿está cara?',
        hint: 'Price to book',
        answer:
          'El price to book compara lo que pagás por la acción contra el patrimonio contable que le corresponde.',
        yes: [
          'Valor en libros por acción a partir del patrimonio y las acciones en circulación',
          'Ratio price to book y comparación contra el promedio del sector',
          'Precio implícito si cotizara al múltiplo del sector',
          'Cuánto por encima o por debajo de ese precio está cotizando',
        ],
        warn: [
          DISCLAIMER,
          'El valor en libros es contable: en empresas de servicios o de software, donde casi todo el valor es intangible, el ratio dice muy poco',
          'Cotizar por debajo del valor en libros puede ser una oportunidad o una señal de que el mercado descuenta pérdidas futuras: el ratio solo no distingue una cosa de la otra',
        ],
        plazo: 'usá el patrimonio del último balance publicado y anotá su fecha: con estados viejos el ratio queda desactualizado.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo: sólo pesan los campos de la rama que elegiste.',
  fields: [
    {
      id: 'rendimiento',
      label: 'Rendimiento anual del portafolio',
      type: 'number',
      suffix: '%',
      step: 0.1,
      value: 35,
      help: 'El retorno del período que estás midiendo, en la misma moneda que la tasa libre de riesgo.',
    },
    {
      id: 'tasaLibre',
      label: 'Tasa libre de riesgo anual',
      type: 'number',
      suffix: '%',
      min: 0,
      step: 0.01,
      value: 0,
      help: 'Viene cargada con la tasa de plazo fijo a 30 días que publica el BCRA. Si medís en dólares, poné el rendimiento de los bonos del Tesoro de EE. UU.',
    },
    {
      id: 'volatilidad',
      label: 'Volatilidad anual del portafolio',
      type: 'number',
      suffix: '%',
      min: 0.01,
      step: 0.1,
      value: 18,
      help: 'El desvío estándar de los retornos, anualizado. Es la medida de cuánto oscila lo que tenés.',
    },
    { id: 'peso1', label: 'Peso del activo 1 en la cartera', type: 'number', suffix: '%', min: 0, max: 100, step: 1, value: 60 },
    { id: 'rendimiento1', label: 'Rendimiento del activo 1', type: 'number', suffix: '%', step: 0.1, value: 40 },
    { id: 'volatilidad1', label: 'Volatilidad del activo 1', type: 'number', suffix: '%', min: 0, step: 0.1, value: 25 },
    { id: 'rendimiento2', label: 'Rendimiento del activo 2', type: 'number', suffix: '%', step: 0.1, value: 20 },
    { id: 'volatilidad2', label: 'Volatilidad del activo 2', type: 'number', suffix: '%', min: 0, step: 0.1, value: 12 },
    {
      id: 'correlacion',
      label: 'Correlación entre los dos activos',
      type: 'number',
      min: -1,
      max: 1,
      step: 0.05,
      value: 0.3,
      help: 'Va de −1 a 1. En 1 se mueven idénticos y diversificar no sirve; en −1 se compensan por completo.',
    },
    {
      id: 'precioBono',
      label: 'Precio de compra del bono',
      type: 'number',
      prefix: 'US$',
      min: 0.01,
      step: 0.01,
      value: 62,
      help: 'Precio por cada 100 de valor nominal. Es como cotizan el AL30, el GD30, el AL35 y el AL41.',
    },
    {
      id: 'valorFinalBono',
      label: 'Capital a cobrar al vencimiento',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 0.01,
      value: 100,
      help: 'Por cada 100 de valor nominal. En un bono que paga a la par es 100; si ya amortizó parte, cargá el residual.',
    },
    {
      id: 'cuponBono',
      label: 'Cupón anual del bono',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 0.01,
      value: 1.5,
      help: 'Renta anual por cada 100 de valor nominal, según el cronograma del prospecto. Varios bonos argentinos tienen cupón creciente: usá el promedio del tramo que te queda.',
    },
    { id: 'aniosBono', label: 'Años hasta el vencimiento', type: 'number', min: 0.1, step: 0.1, value: 5 },
    { id: 'precioAccion', label: 'Precio de la acción', type: 'number', prefix: '$', min: 0.01, step: 0.01, value: 1200, thousands: true },
    {
      id: 'patrimonio',
      label: 'Patrimonio neto de la empresa',
      type: 'number',
      prefix: '$',
      step: 1,
      value: 500000000000,
      thousands: true,
      help: 'Del último balance publicado, en la misma moneda que el precio de la acción.',
    },
    { id: 'acciones', label: 'Acciones en circulación', type: 'number', min: 1, step: 1, value: 600000000, thousands: true },
    {
      id: 'pbSector',
      label: 'Price to book promedio del sector',
      type: 'number',
      min: 0.01,
      step: 0.1,
      value: 1.5,
      help: 'Referencia contra la que se compara. Bancos y aseguradoras suelen moverse cerca de 1; industria y consumo, más arriba.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'En qué banda cae tu número',
    caption:
      'La escala cambia según la rama: bandas de Sharpe ratio, de correlación entre activos, de rendimiento del bono o de price to book contra el sector. El marcador es tu resultado.',
  },
  breakdownTitle: 'Cómo se arma el número',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cuadro.',

  answer: undefined,

  faq: [
    {
      q: '¿Qué mide exactamente el Sharpe ratio?',
      a: 'Mide cuánto exceso de retorno sobre la tasa libre de riesgo obtenés por cada punto de volatilidad que aguantás. Se calcula restando la tasa libre de riesgo al rendimiento y dividiendo por el desvío estándar. Un Sharpe de 1 significa que ganaste un punto de exceso de retorno por cada punto de volatilidad: es una unidad de eficiencia, no de ganancia.',
    },
    {
      q: '¿Cuál es un Sharpe ratio bueno?',
      a: 'Por debajo de cero es malo: rendiste menos que la alternativa sin riesgo. Entre cero y uno es la zona normal, donde cae la mayoría de las carteras diversificadas. Por encima de uno es bueno y por encima de dos, muy bueno. Si te da por encima de tres conviene revisar los datos: casi siempre hay un error de escala o de período.',
    },
    {
      q: '¿Qué tasa libre de riesgo tengo que usar?',
      a: 'La de la moneda en la que medís tu rendimiento. Si tu cartera está en pesos, el campo viene cargado con la tasa de plazo fijo a 30 días que publica el BCRA. Si medís en dólares, corresponde el rendimiento de los bonos del Tesoro de Estados Unidos al plazo de tu horizonte. Mezclar un rendimiento en pesos con una tasa en dólares rompe el cálculo.',
    },
    {
      q: '¿Por qué el riesgo de la cartera es menor que el promedio del riesgo de sus activos?',
      a: 'Porque los activos no se mueven en el mismo momento ni en la misma magnitud. Cuando uno cae y el otro no, las oscilaciones se compensan parcialmente y el desvío del conjunto queda por debajo del promedio ponderado. Ese descuento es el beneficio de diversificación, y crece cuanto más baja es la correlación.',
    },
    {
      q: '¿Qué correlación conviene buscar entre dos activos?',
      a: 'Cuanto más baja, mejor: con correlación cercana a cero cada uno se mueve por su cuenta, y con correlación negativa uno tiende a subir cuando el otro baja. Por encima de 0,8 el beneficio de repartir es casi nulo: comprar dos cosas que se mueven igual no es diversificar, es duplicar la misma apuesta.',
    },
    {
      q: '¿Por qué la diversificación falla justo cuando más la necesito?',
      a: 'Porque en los episodios de pánico las correlaciones suben hacia uno: se vende todo al mismo tiempo, sin distinguir. Es un fenómeno bien documentado, y explica por qué carteras que parecían repartidas caen en bloque. La diversificación funciona en el promedio de los años, no necesariamente en la peor semana.',
    },
    {
      q: '¿Qué diferencia hay entre rendimiento corriente y rendimiento a vencimiento de un bono?',
      a: 'El rendimiento corriente es sólo el cupón anual dividido por el precio que pagaste: mide la renta que cobrás mientras lo tenés. El rendimiento a vencimiento agrega la diferencia entre lo que pagás hoy y lo que cobrás al final, prorrateada por los años que faltan. En un bono que cotiza muy por debajo de la par, esa ganancia de capital suele pesar más que el cupón.',
    },
    {
      q: '¿Qué es la paridad de un bono?',
      a: 'Es el porcentaje del valor nominal al que estás comprando. Un bono con paridad de 62 cotiza a 62 dólares por cada 100 de valor nominal, o sea con 38% de descuento. Paridades bajas indican que el mercado le asigna una probabilidad relevante de que no se pague todo, y son la razón por la que el rendimiento calculado da tan alto.',
    },
    {
      q: '¿Por qué el hub me pide los cupones en vez de traerlos cargados?',
      a: 'Porque el cronograma de pagos de cada bono cambia con el tiempo: los cupones se van cobrando, varias series tienen cupón creciente por tramos y las amortizaciones reducen el capital que queda por cobrar. Una tabla fija quedaría desactualizada en pocos meses y daría números equivocados. El prospecto o el sitio de tu agente tienen el cronograma vigente.',
    },
    {
      q: '¿Qué significa un price to book menor que uno?',
      a: 'Que el mercado valúa la empresa por debajo de su patrimonio contable. Puede leerse como una oportunidad si el negocio es sólido y el mercado exagera, o como una advertencia de que se esperan pérdidas que van a licuar ese patrimonio. El ratio solo no distingue una cosa de la otra: hay que mirar la rentabilidad sobre el patrimonio y la deuda.',
    },
    {
      q: '¿En qué sectores sirve el price to book y en cuáles no?',
      a: 'Sirve bien en bancos, aseguradoras e inmobiliarias, donde el activo está registrado a valores cercanos a los de mercado. Sirve mal en software, servicios y marcas, donde el valor está en intangibles que casi no figuran en el balance: ahí un ratio alto es normal y no dice que la acción esté cara.',
    },
    {
      q: '¿Por qué ninguno de estos resultados viene expresado en pesos?',
      a: 'Porque todos son ratios o porcentajes: el Sharpe es un número sin unidad, la correlación va de menos uno a uno, y el rendimiento de un bono y el price to book son proporciones. Ponerles un signo de peso induciría a leerlos como un monto. La única cuenta en dinero que aparece es la del bono, que va en dólares porque así cotiza.',
    },
  ],

  sources: [
    {
      name: 'Sharpe, W. F. — “The Sharpe Ratio” (1994)',
      url: 'https://web.stanford.edu/~wfsharpe/art/sr/sr.htm',
      publisher: 'The Journal of Portfolio Management',
      date: '1994',
    },
    {
      name: 'Markowitz, H. — “Portfolio Selection” (1952)',
      url: 'https://www.jstor.org/stable/2975974',
      publisher: 'The Journal of Finance',
      date: '1952',
    },
    {
      name: 'Estadísticas monetarias — tasa de plazo fijo a 30 días',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Títulos públicos: prospectos y cronogramas de pago',
      url: 'https://www.argentina.gob.ar/economia/finanzas/graficos-deuda-titulos-publicos',
      publisher: 'Ministerio de Economía — Secretaría de Finanzas',
    },
    {
      name: 'Estados contables de emisoras y precios de mercado',
      url: 'https://www.bolsar.info/',
      publisher: 'Bolsas y Mercados Argentinos',
    },
  ],

  replaces: [
    '/calculadora-sharpe-ratio-portafolio-riesgo',
    '/calculadora-diversificacion-portafolio-correlacion',
    '/calculadora-bonos-al30-al35-al41-rendimiento-anual',
    '/calculadora-bonos-globales-al30-gd30-rendimiento',
    '/calculadora-price-to-book-ratio-valor-libros',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Bandas de lectura del Sharpe ratio, en la misma escala que la calculadora vieja. */
export const SHARPE_BANDS = [
  { label: 'Negativo', from: -1, to: 0, tone: 'bad' as const },
  { label: 'Bajo', from: 0, to: 0.5, tone: 'warn' as const },
  { label: 'Normal', from: 0.5, to: 1, tone: 'warn' as const },
  { label: 'Bueno', from: 1, to: 2, tone: 'good' as const },
  { label: 'Muy bueno', from: 2, to: 3, tone: 'good' as const },
];
